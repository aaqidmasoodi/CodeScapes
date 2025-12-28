import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"
import { debug } from "@/lib/debug"

interface TurtleCanvasProps {
  width?: number
  height?: number
  onKeyEvent?: (key: string, type: "keydown" | "keyup") => void
  canvasInstance?: HTMLCanvasElement
  onResize?: (width: number, height: number) => void
}

export interface TurtleCanvasHandle {
  handleCommand: (command: DrawCommand) => void
  clear: () => void
  getCanvasDataURL: () => string | null
}

interface TurtleState {
  id: number
  x: number
  y: number
  heading: number
  shape: string
  color: string
  fillColor: string
  visible: boolean
  stretchWid: number
  stretchLen: number
}

interface StampState {
  id: number
  turtleId: number
  x: number
  y: number
  heading: number
  shape: string
  color: string
  fillColor: string
  stretchWid: number
  stretchLen: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DrawCommand = { cmd: string; [key: string]: any }

// Drawable primitive that can be replayed
interface DrawPrimitive {
  type: "line" | "arc" | "dot" | "fill" | "text"
  turtleId: number
  color: string
  // Line: from (x1,y1) to (x2,y2)
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  // Arc: center (cx, cy), radius, startAngle, endAngle
  cx?: number
  cy?: number
  radius?: number
  startAngle?: number
  endAngle?: number
  counterclockwise?: boolean
  // Dot: position (x, y), size
  x?: number
  y?: number
  size?: number
  // Fill: path points
  path?: Point[]
  fillColor?: string
  // Text: position (x, y), content
  text?: string
  font?: string
  align?: string
}

type Point = { x: number; y: number }

export const TurtleCanvas = forwardRef<TurtleCanvasHandle, TurtleCanvasProps>(
  ({ width = 800, height = 600, onKeyEvent, canvasInstance, onResize }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const overlayRef = useRef<HTMLCanvasElement>(null)

    const turtlesRef = useRef<Map<number, TurtleState>>(new Map())
    const stampsRef = useRef<Map<number, StampState>>(new Map())

    const bgColorRef = useRef<string>("white")
    const commandQueueRef = useRef<DrawCommand[]>([])
    const listeningRef = useRef<boolean>(false)

    const coordsRef = useRef<{ llx: number; lly: number; urx: number; ury: number } | null>(null)
    const fillPathRef = useRef<Map<number, Point[]>>(new Map())

    // Track all draw primitives per turtle for clear() support
    // Key is turtle ID, value is array of drawable primitives
    const drawHistoryRef = useRef<Map<number, DrawPrimitive[]>>(new Map())

    // Logical canvas size (set by INIT/SETUP, never changes on pane resize)
    // Using BOTH ref (for callbacks) and state (for render) to avoid stale closures
    const logicalSizeRef = useRef<{ width: number; height: number }>({ width: 800, height: 600 })
    const [logicalSize, setLogicalSize] = useState<{ width: number; height: number }>({
      width: 800,
      height: 600,
    })

    // Strict initialization tracking
    const isReadyRef = useRef(false)

    // Batching support: If false, overlay updates are skipped until explicit UPDATE command
    const autoUpdateRef = useRef(true)

    // Helper to update both ref and state
    const updateLogicalSize = useCallback((newSize: { width: number; height: number }) => {
      logicalSizeRef.current = newSize
      setLogicalSize(newSize)
    }, [])

    // Transform Logic - uses ref for stable coordinates in callbacks
    const toCanvasX = useCallback((x: number) => {
      const lw = logicalSizeRef.current.width
      if (coordsRef.current) {
        const { llx, urx } = coordsRef.current
        return ((x - llx) / (urx - llx)) * lw
      }
      return lw / 2 + x
    }, [])

    const toCanvasY = useCallback((y: number) => {
      const lh = logicalSizeRef.current.height
      if (coordsRef.current) {
        const { lly, ury } = coordsRef.current
        return lh - ((y - lly) / (ury - lly)) * lh
      }
      return lh / 2 - y
    }, [])

    // Inverse Transform for Mouse Events
    const toWorldX = useCallback((cx: number) => {
      const lw = logicalSizeRef.current.width
      if (coordsRef.current) {
        const { llx, urx } = coordsRef.current
        return llx + (cx / lw) * (urx - llx)
      }
      return cx - lw / 2
    }, [])

    const toWorldY = useCallback((cy: number) => {
      const lh = logicalSizeRef.current.height
      if (coordsRef.current) {
        const { lly, ury } = coordsRef.current
        return lly + ((lh - cy) / lh) * (ury - lly)
      }
      return lh / 2 - cy
    }, [])

    const getScaleX = useCallback(() => {
      const lw = logicalSizeRef.current.width
      if (coordsRef.current) return lw / (coordsRef.current.urx - coordsRef.current.llx)
      return 1.0
    }, [])

    useEffect(() => {
      if (canvasInstance && containerRef.current) {
        if (containerRef.current.firstChild !== canvasInstance) {
          if (!containerRef.current.contains(canvasInstance)) {
            if (overlayRef.current) {
              containerRef.current.insertBefore(canvasInstance, overlayRef.current)
            } else {
              containerRef.current.appendChild(canvasInstance)
            }
          }
        }
        canvasRef.current = canvasInstance

        // CRITICAL: Mark canvas as ready - queue will be processed by the interval
        // The interval at line 826+ will pick up any pending commands
        // We trigger an immediate first check by not relying on the 100ms delay

        // Use logical size for canvas dimensions (fixed, never changes on pane resize)
        const lw = logicalSize.width
        const lh = logicalSize.height

        if (canvasInstance.getAttribute("width") !== String(lw))
          canvasInstance.setAttribute("width", String(lw))
        if (canvasInstance.getAttribute("height") !== String(lh))
          canvasInstance.setAttribute("height", String(lh))

        if (overlayRef.current) {
          if (overlayRef.current.getAttribute("width") !== String(lw))
            overlayRef.current.setAttribute("width", String(lw))
          if (overlayRef.current.getAttribute("height") !== String(lh))
            overlayRef.current.setAttribute("height", String(lh))
        }

        const ctx = canvasInstance.getContext("2d")
        if (ctx) {
          if (bgColorRef.current && bgColorRef.current !== "white") {
            ctx.fillStyle = bgColorRef.current
            ctx.fillRect(0, 0, lw, lh)
          }
        }

        // Mark as fully ready to process commands
        isReadyRef.current = true
      }
    }, [canvasInstance, width, height])

    const drawShape = useCallback(
      (ctx: CanvasRenderingContext2D, item: TurtleState | StampState) => {
        if ("visible" in item && !item.visible) return

        const cx = toCanvasX(item.x)
        const cy = toCanvasY(item.y)
        const angle = -item.heading * (Math.PI / 180)

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(angle)
        ctx.scale(item.stretchLen, item.stretchWid)

        ctx.fillStyle = item.fillColor || item.color
        ctx.strokeStyle = item.color
        ctx.lineWidth = 1

        ctx.beginPath()
        if (item.shape === "turtle") {
          ctx.moveTo(-10, -8)
          ctx.lineTo(10, 0)
          ctx.lineTo(-10, 8)
          ctx.closePath()
          ctx.moveTo(6, 0)
          ctx.arc(6, 0, 4, 0, Math.PI * 2)
        } else if (item.shape === "circle") {
          ctx.arc(0, 0, 8, 0, Math.PI * 2)
        } else if (item.shape === "square") {
          ctx.rect(-8, -8, 16, 16)
        } else if (item.shape === "triangle") {
          ctx.moveTo(10, 0)
          ctx.lineTo(-8, 8)
          ctx.lineTo(-8, -8)
          ctx.closePath()
        } else if (item.shape === "arrow") {
          ctx.moveTo(-10, -5)
          ctx.lineTo(10, 0)
          ctx.lineTo(-10, 5)
          ctx.lineTo(-5, 0)
          ctx.closePath()
        } else {
          ctx.moveTo(-10, -6)
          ctx.lineTo(10, 0)
          ctx.lineTo(-10, 6)
          ctx.closePath()
        }

        ctx.fill()
        ctx.stroke()
        ctx.restore()
      },
      [toCanvasX, toCanvasY]
    )

    const redrawOverlay = useCallback(() => {
      const ctx = overlayRef.current?.getContext("2d")
      if (!ctx) return
      const { width: lw, height: lh } = logicalSizeRef.current
      ctx.clearRect(0, 0, lw, lh)

      stampsRef.current.forEach((stamp) => drawShape(ctx, stamp))
      turtlesRef.current.forEach((turtle) => drawShape(ctx, turtle))
    }, [drawShape])

    // Helper to add a draw primitive to a turtle's history
    const addPrimitive = useCallback((turtleId: number, primitive: DrawPrimitive) => {
      if (!drawHistoryRef.current.has(turtleId)) {
        drawHistoryRef.current.set(turtleId, [])
      }
      drawHistoryRef.current.get(turtleId)!.push(primitive)
    }, [])

    const handleCommand = useCallback(
      (command: DrawCommand) => {
        const canvas =
          canvasRef.current ||
          (containerRef.current?.querySelector("canvas:not(.absolute)") as HTMLCanvasElement)
        if (!canvas) {
          commandQueueRef.current.push(command)
          return
        }
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const { cmd } = command
        let needOverlayUpdate = false

        switch (cmd) {
          case "INIT":
          case "INIT_SCREEN": {
            const newW = (command.width as number) || 800
            const newH = (command.height as number) || 600
            // Store logical size for stable coordinate transforms
            updateLogicalSize({ width: newW, height: newH })
            if (onResize) {
              if (newW !== width || newH !== height) onResize(newW, newH)
            }
            bgColorRef.current = (command.bgcolor as string) || "white"
            ctx.fillStyle = bgColorRef.current
            ctx.fillRect(0, 0, newW, newH)
            turtlesRef.current.clear()
            fillPathRef.current.clear()
            stampsRef.current.clear()
            coordsRef.current = null
            listeningRef.current = false // Reset listening
            needOverlayUpdate = true
            break
          }
          case "SETUP": {
            const w = command.width as number
            const h = command.height as number
            // Store logical size for stable coordinate transforms
            updateLogicalSize({ width: w, height: h })
            if (onResize && (w !== width || h !== height)) onResize(w, h)
            if (command.bgcolor) {
              bgColorRef.current = command.bgcolor as string
              ctx.fillStyle = bgColorRef.current
              ctx.fillRect(0, 0, w, h)
            }
            break
          }
          case "LISTEN": {
            // New
            listeningRef.current = true
            debug.log("[Turtle] Listen Enabled")
            break
          }
          case "UPDATE": {
            // Force overlay repaint when screen.update() is called
            needOverlayUpdate = true
            break
          }
          case "SET_COORDS": {
            coordsRef.current = {
              llx: command.llx as number,
              lly: command.lly as number,
              urx: command.urx as number,
              ury: command.ury as number,
            }
            needOverlayUpdate = true
            break
          }
          case "CREATE":
          case "CREATE_TURTLE": {
            const id = command.id as number
            turtlesRef.current.set(id, {
              id,
              x: (command.x as number) || 0,
              y: (command.y as number) || 0,
              heading: 0,
              shape: (command.shape as string) || "classic",
              color: "black",
              fillColor: "black",
              visible: command.visible !== false,
              stretchWid: 1,
              stretchLen: 1,
            })
            needOverlayUpdate = true
            break
          }
          case "UPDATE_TURTLE": {
            const id = command.id as number
            const t = turtlesRef.current.get(id)
            if (t) {
              if (command.shape) t.shape = command.shape as string
              if (command.stretchWid) t.stretchWid = command.stretchWid as number
              if (command.stretchLen) t.stretchLen = command.stretchLen as number
              needOverlayUpdate = true
            }
            break
          }
          case "STAMP": {
            const id = command.id as number
            const stampId = command.stampId as number
            stampsRef.current.set(stampId, {
              id: stampId,
              turtleId: id,
              x: command.x as number,
              y: command.y as number,
              heading: command.heading as number,
              shape: command.shape as string,
              color: (command.color as string) || "black",
              fillColor: (command.fillColor as string) || "black",
              stretchWid: (command.stretchWid as number) || 1,
              stretchLen: (command.stretchLen as number) || 1,
            })
            needOverlayUpdate = true
            break
          }
          case "CLEAR_STAMPS": {
            const stampId = command.stampId as number | undefined
            const n = command.n as number | undefined
            const turtleId = command.id as number

            if (stampId !== undefined) {
              stampsRef.current.delete(stampId)
            } else {
              const stamps = Array.from(stampsRef.current.values()).filter(
                (s) => s.turtleId === turtleId
              )
              let toDelete = [] as number[]
              if (n === undefined || n === null) toDelete = stamps.map((s) => s.id)
              else if (n > 0) toDelete = stamps.slice(0, n).map((s) => s.id)
              else if (n < 0) toDelete = stamps.slice(stamps.length + n).map((s) => s.id)
              toDelete.forEach((sid) => stampsRef.current.delete(sid))
            }
            needOverlayUpdate = true
            break
          }
          case "MOVE": {
            const id = command.id as number
            const t = turtlesRef.current.get(id)
            if (!t) break

            const oldX = t.x
            const oldY = t.y
            if (fillPathRef.current.has(id)) {
              fillPathRef.current.get(id)?.push({ x: command.x as number, y: command.y as number })
            }
            const fromX = toCanvasX(t.x)
            const fromY = toCanvasY(t.y)
            t.x = command.x as number
            t.y = command.y as number
            const toX = toCanvasX(t.x)
            const toY = toCanvasY(t.y)
            if (command.pen_down) {
              ctx.beginPath()
              ctx.moveTo(fromX, fromY)
              ctx.lineTo(toX, toY)
              ctx.strokeStyle = (command.color as string) || "black"
              ctx.lineWidth = ((command.width as number) || 1) * getScaleX()
              ctx.lineCap = "round"
              ctx.stroke()

              // Store line primitive for clear() support
              addPrimitive(id, {
                type: "line",
                turtleId: id,
                color: (command.color as string) || "black",
                x1: oldX,
                y1: oldY,
                x2: t.x,
                y2: t.y,
              })
            }
            needOverlayUpdate = true
            break
          }
          case "ROTATE": {
            const id = command.id as number
            const t = turtlesRef.current.get(id)
            if (t) {
              t.heading = command.heading as number
              needOverlayUpdate = true
            }
            break
          }
          case "CIRCLE": {
            const id = command.id as number
            const t = turtlesRef.current.get(id)
            if (!t) break

            const r = command.radius as number
            const extent = (command.extent as number) || 360
            const steps = command.steps as number | undefined
            const filling = command.filling as boolean
            const fillcolor = command.fillcolor as string
            const endX = command.end_x as number
            const endY = command.end_y as number

            // Calculate circle center and angles
            const headingRad = t.heading * (Math.PI / 180)
            const centerAngle = r >= 0 ? headingRad + Math.PI / 2 : headingRad - Math.PI / 2
            const cx = t.x + Math.abs(r) * Math.cos(centerAngle)
            const cy = t.y + Math.abs(r) * Math.sin(centerAngle)

            const startAngle = Math.atan2(t.y - cy, t.x - cx)
            const extentRad = extent * (Math.PI / 180)
            const endAngle = r >= 0 ? startAngle + extentRad : startAngle - extentRad

            const canvasCX = toCanvasX(cx)
            const canvasCY = toCanvasY(cy)
            const canvasR = Math.abs(r * getScaleX())

            // Generate arc points for fill path
            const numPoints = steps || Math.max(12, Math.ceil(Math.abs(extent) / 10))
            const arcPoints: Point[] = []
            for (let i = 0; i <= numPoints; i++) {
              const angle = startAngle + (endAngle - startAngle) * (i / numPoints)
              arcPoints.push({
                x: cx + Math.abs(r) * Math.cos(angle),
                y: cy + Math.abs(r) * Math.sin(angle),
              })
            }

            // If filling, add arc points to fill path
            if (filling) {
              const path = fillPathRef.current.get(id)
              if (path) {
                path.push(...arcPoints)
              }
            }

            // Draw the arc stroke if pen is down
            if (command.pen_down !== false) {
              ctx.beginPath()
              if (steps) {
                ctx.moveTo(toCanvasX(arcPoints[0].x), toCanvasY(arcPoints[0].y))
                for (let i = 1; i < arcPoints.length; i++) {
                  ctx.lineTo(toCanvasX(arcPoints[i].x), toCanvasY(arcPoints[i].y))
                }
              } else {
                // Use native arc for smooth curves
                ctx.arc(canvasCX, canvasCY, canvasR, -startAngle, -endAngle, r >= 0)
              }
              ctx.strokeStyle = t.color
              ctx.stroke()
            }

            // If this is a filled standalone circle (360 degree, filling active)
            if (filling && extent === 360) {
              ctx.beginPath()
              ctx.arc(canvasCX, canvasCY, canvasR, 0, Math.PI * 2)
              ctx.fillStyle = fillcolor || t.fillColor || t.color
              ctx.fill()
              ctx.strokeStyle = t.color
              ctx.stroke()
            }

            // Update turtle position
            t.x = endX
            t.y = endY
            if (r >= 0) {
              t.heading = (t.heading + extent) % 360
            } else {
              t.heading = (t.heading - extent + 360) % 360
            }

            needOverlayUpdate = true
            break
          }
          case "BEGIN_FILL": {
            const id = command.id as number
            const t = turtlesRef.current.get(id)
            if (t) fillPathRef.current.set(id, [{ x: t.x, y: t.y }])
            break
          }
          case "END_FILL": {
            const id = command.id as number
            const path = fillPathRef.current.get(id)
            const t = turtlesRef.current.get(id)
            if (path && path.length > 2) {
              ctx.beginPath()
              const start = toCanvasX(path[0].x)
              const startY = toCanvasY(path[0].y)
              ctx.moveTo(start, startY)
              for (let i = 1; i < path.length; i++)
                ctx.lineTo(toCanvasX(path[i].x), toCanvasY(path[i].y))
              ctx.closePath()
              ctx.fillStyle = (command.color as string) || "black"
              ctx.fill()
              // Use turtle's pen color for stroke, fallback to fill color
              ctx.strokeStyle = t?.color || (command.color as string) || "black"
              ctx.stroke()

              // Store fill primitive for clear() support
              addPrimitive(id, {
                type: "fill",
                turtleId: id,
                color: t?.color || (command.color as string) || "black",
                fillColor: (command.color as string) || "black",
                path: [...path], // Clone the path
              })
            }
            fillPathRef.current.delete(id)
            break
          }
          case "PEN_UPDATE": {
            const id = command.id as number
            const t = turtlesRef.current.get(id)
            if (t) {
              if (command.color) t.color = command.color as string
              if (command.fillColor) t.fillColor = command.fillColor as string
            }
            break
          }
          case "BGCOLOR": {
            bgColorRef.current = command.color as string
            ctx.fillStyle = bgColorRef.current
            ctx.fillRect(0, 0, width, height)
            break
          }
          case "CLEAR": {
            // Clear only this turtle's drawings, keep other turtles' drawings
            const turtleId = command.id as number

            // Remove this turtle's draw history
            drawHistoryRef.current.delete(turtleId)

            // Clear stamps for this turtle
            stampsRef.current.forEach((_, id) => {
              if (Math.floor(id / 10000) === turtleId) {
                stampsRef.current.delete(id)
              }
            })

            // Re-render the canvas: clear and redraw all remaining drawings
            const { width: lw, height: lh } = logicalSizeRef.current
            ctx.fillStyle = bgColorRef.current || "white"
            ctx.fillRect(0, 0, lw, lh)

            // Replay all other turtles' draw primitives
            drawHistoryRef.current.forEach((primitives) => {
              primitives.forEach((prim) => {
                switch (prim.type) {
                  case "line":
                    if (
                      prim.x1 !== undefined &&
                      prim.y1 !== undefined &&
                      prim.x2 !== undefined &&
                      prim.y2 !== undefined
                    ) {
                      ctx.beginPath()
                      ctx.moveTo(toCanvasX(prim.x1), toCanvasY(prim.y1))
                      ctx.lineTo(toCanvasX(prim.x2), toCanvasY(prim.y2))
                      ctx.strokeStyle = prim.color
                      ctx.stroke()
                    }
                    break
                  case "arc":
                    if (
                      prim.cx !== undefined &&
                      prim.cy !== undefined &&
                      prim.radius !== undefined
                    ) {
                      ctx.beginPath()
                      ctx.arc(
                        toCanvasX(prim.cx),
                        toCanvasY(prim.cy),
                        Math.abs(prim.radius * getScaleX()),
                        -(prim.startAngle || 0),
                        -(prim.endAngle || 0),
                        prim.counterclockwise ?? false
                      )
                      ctx.strokeStyle = prim.color
                      ctx.stroke()
                    }
                    break
                  case "dot":
                    if (prim.x !== undefined && prim.y !== undefined) {
                      ctx.beginPath()
                      ctx.arc(
                        toCanvasX(prim.x),
                        toCanvasY(prim.y),
                        (prim.size || 2) * getScaleX(),
                        0,
                        Math.PI * 2
                      )
                      ctx.fillStyle = prim.color
                      ctx.fill()
                    }
                    break
                  case "fill":
                    if (prim.path && prim.path.length > 2) {
                      ctx.beginPath()
                      ctx.moveTo(toCanvasX(prim.path[0].x), toCanvasY(prim.path[0].y))
                      for (let i = 1; i < prim.path.length; i++) {
                        ctx.lineTo(toCanvasX(prim.path[i].x), toCanvasY(prim.path[i].y))
                      }
                      ctx.closePath()
                      ctx.fillStyle = prim.fillColor || prim.color
                      ctx.fill()
                      ctx.strokeStyle = prim.color
                      ctx.stroke()
                    }
                    break
                  case "text":
                    if (prim.x !== undefined && prim.y !== undefined && prim.text) {
                      ctx.font = prim.font || "12px Arial"
                      ctx.textAlign = (prim.align as CanvasTextAlign) || "left"
                      ctx.fillStyle = prim.color
                      ctx.fillText(prim.text, toCanvasX(prim.x), toCanvasY(prim.y))
                    }
                    break
                }
              })
            })

            needOverlayUpdate = true
            break
          }
          case "DOT": {
            const id = command.id as number
            const worldX = (command.x || turtlesRef.current.get(id)?.x) as number
            const worldY = (command.y || turtlesRef.current.get(id)?.y) as number
            const x = toCanvasX(worldX)
            const y = toCanvasY(worldY)
            const size = (command.size as number) || 2
            ctx.beginPath()
            ctx.arc(x, y, size * getScaleX(), 0, Math.PI * 2)
            ctx.fillStyle = (command.color as string) || "black"
            ctx.fill()

            // Store dot primitive for clear() support
            addPrimitive(id, {
              type: "dot",
              turtleId: id,
              color: (command.color as string) || "black",
              x: worldX,
              y: worldY,
              size: size,
            })
            break
          }
          case "WRITE": {
            const id = command.id as number
            const t = turtlesRef.current.get(id)

            // Use provided coordinates or turtle coordinates
            const wx = command.x !== undefined ? (command.x as number) : t?.x || 0
            const wy = command.y !== undefined ? (command.y as number) : t?.y || 0

            const cx = toCanvasX(wx)
            const cy = toCanvasY(wy)

            const text = String(command.arg)
            const move = command.move === true
            const align = (command.align as string) || "left"
            const font = command.font as [string, number, string] | undefined

            ctx.save()

            // Font Setup
            let fontFamily = "Arial"
            let fontSize = 12 // Canvas px
            let fontStyle = "normal"

            if (font) {
              // Python: (fontname, fontsize, fonttype)
              // Canvas: "style weight size family"
              ;[fontFamily, fontSize, fontStyle] = font as [string, number, string]
            }

            ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`
            ctx.textAlign = align as CanvasTextAlign
            ctx.textBaseline = "alphabetic"
            ctx.fillStyle = (command.color as string) || t?.color || "black"

            ctx.fillText(text, cx, cy)

            if (move && t) {
              const metrics = ctx.measureText(text)
              const width = metrics.width

              // Simple approx:
              t.x = wx + (align === "left" ? width : align === "center" ? width / 2 : 0)
              needOverlayUpdate = true
            }

            // Store text primitive for clear() support
            addPrimitive(id, {
              type: "text",
              turtleId: id,
              color: (command.color as string) || t?.color || "black",
              x: wx,
              y: wy,
              text: text,
              font: `${fontStyle} ${fontSize}px ${fontFamily}`,
              align: align,
            })

            ctx.restore()
            break
          }
          case "SHOW": {
            const t = turtlesRef.current.get(command.id as number)
            if (t) t.visible = true
            needOverlayUpdate = true
            break
          }
          case "HIDE": {
            const t = turtlesRef.current.get(command.id as number)
            if (t) t.visible = false
            needOverlayUpdate = true
            break
          }
          case "SET_AUTO_UPDATE": {
            autoUpdateRef.current = command.value as boolean
            if (autoUpdateRef.current) needOverlayUpdate = true
            break
          }
        }

        if (needOverlayUpdate) {
          // If autoUpdate is enabled OR it's an explicit UPDATE command -> redraw
          if (autoUpdateRef.current || cmd === "UPDATE") {
            redrawOverlay()
          }
        }
      },
      [width, height, toCanvasX, toCanvasY, redrawOverlay, onResize, getScaleX]
    )

    const clear = useCallback(() => {
      const canvas =
        canvasRef.current ||
        (containerRef.current?.querySelector("canvas:not(.absolute)") as HTMLCanvasElement)
      const { width: lw, height: lh } = logicalSizeRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.fillStyle = bgColorRef.current
          ctx.fillRect(0, 0, lw, lh)
        }
      }
      turtlesRef.current.clear()
      const overlayCtx = overlayRef.current?.getContext("2d")
      overlayCtx?.clearRect(0, 0, lw, lh)
      commandQueueRef.current = []
    }, [])

    const processQueue = useCallback(() => {
      // Only process when ready
      if (!isReadyRef.current) return

      const commands = [...commandQueueRef.current]
      commandQueueRef.current = []
      commands.forEach((cmd) => handleCommand(cmd))
    }, [handleCommand])

    useImperativeHandle(
      ref,
      () => ({
        handleCommand: (cmd) => {
          // STRICT check: Only bypassing queue if ready AND canvas available
          if (isReadyRef.current && canvasRef.current) {
            handleCommand(cmd)
          } else {
            commandQueueRef.current.push(cmd)
          }
        },
        clear,
        getCanvasDataURL: () => {
          if (!canvasRef.current || !overlayRef.current) return null

          try {
            // Create a temporary canvas to composite both layers
            const tempCanvas = document.createElement("canvas")
            tempCanvas.width = canvasRef.current.width
            tempCanvas.height = canvasRef.current.height
            const ctx = tempCanvas.getContext("2d")

            if (!ctx) return null

            // Draw main canvas (background + static drawings)
            ctx.drawImage(canvasRef.current, 0, 0)

            // Draw overlay (sprites + stamps)
            ctx.drawImage(overlayRef.current, 0, 0)

            return tempCanvas.toDataURL("image/png")
          } catch (e) {
            debug.error("Failed to capture turtle canvas thumbnail", e)
            return null
          }
        },
      }),
      [handleCommand, clear]
    )

    // Immediate flush when canvas becomes ready (Fixes First-Load & Stop->Run race conditions)
    useEffect(() => {
      // Since effects run in order, the top useEffect has already set isReadyRef=true
      if (isReadyRef.current && commandQueueRef.current.length > 0) {
        processQueue()
      }
    }, [canvasInstance, processQueue]) // Run when canvasInstance is created (mount/remount)

    useEffect(() => {
      // Process queue frequently (16ms ≈ 60fps) to ensure commands are processed quickly on first load
      const interval = setInterval(() => {
        if (
          isReadyRef.current &&
          (canvasRef.current || containerRef.current?.querySelector("canvas:not(.absolute)")) &&
          commandQueueRef.current.length > 0
        )
          processQueue()
      }, 16)
      return () => clearInterval(interval)
    }, [processQueue])

    // Input & Events
    const pushEvent = useCallback(
      (data: { key?: string; type: string; x?: number; y?: number; id?: number | null }) => {
        fetch("/_turtle_push_event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).catch(() => {})
      },
      []
    )

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (listeningRef.current && onKeyEvent) onKeyEvent(e.key, "keydown")
        if (listeningRef.current) pushEvent({ key: e.key, type: "keydown" })
      }
      const handleKeyUp = (e: KeyboardEvent) => {
        if (listeningRef.current && onKeyEvent) onKeyEvent(e.key, "keyup")
        if (listeningRef.current) pushEvent({ key: e.key, type: "keyup" })
      }
      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("keyup", handleKeyUp)
      return () => {
        window.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("keyup", handleKeyUp)
      }
    }, [onKeyEvent, pushEvent])

    const handleCanvasClick = useCallback(
      (e: React.MouseEvent) => {
        // Calculate World Coordinates
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top
        const wx = toWorldX(cx)
        const wy = toWorldY(cy)

        // Check hits
        let hitId: number | null = null
        // Reverse iterate for Z-order (top first)
        const tList = Array.from(turtlesRef.current.values()).reverse()
        for (const t of tList) {
          if (!t.visible) continue
          // Distance check. Standard turtle radius approx 10 * stretch
          // We use simple radius check for now.
          // Ideally use polygon hit test.
          // Canvas scale factors matter.
          // Default turtle size is 20x20 pixels (radius 10) roughly.
          // But in World Coords, size depends on scale.
          // We need to check DISTANCE in CANVAS PIXELS
          // Or convert turtle radius to world units?
          // Safer: Check in Canvas Pixels.
          const tcx = toCanvasX(t.x)
          const tcy = toCanvasY(t.y)
          const dcx = cx - tcx
          const dcy = cy - tcy
          const cDist = Math.sqrt(dcx * dcx + dcy * dcy)

          // Hit radius ~ 10px * stretch * (whatever scale)
          // Let's assume 15px radius for easy clicking
          if (cDist < 15 * Math.max(t.stretchLen, t.stretchWid)) {
            hitId = t.id
            break
          }
        }

        debug.log(`[Turtle] Click at (${wx.toFixed(1)}, ${wy.toFixed(1)}) Hit: ${hitId}`)
        pushEvent({ type: "click", x: wx, y: wy, id: hitId }) // Send hitId if any
      },
      [toWorldX, toWorldY, toCanvasX, toCanvasY, pushEvent]
    )

    // Use logical size for the container and overlay (fixed pixel size)
    const containerWidth = logicalSize.width
    const containerHeight = logicalSize.height

    return (
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded border border-border bg-white shadow-sm dark:bg-zinc-900"
        style={{ width: containerWidth, height: containerHeight }}
        onClick={handleCanvasClick}
      >
        <canvas
          ref={overlayRef}
          width={containerWidth}
          height={containerHeight}
          className="pointer-events-none absolute left-0 top-0"
        />
      </div>
    )
  }
)

TurtleCanvas.displayName = "TurtleCanvas"
