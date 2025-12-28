import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react"

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

type DrawCommand = {
  cmd: string
  [key: string]: unknown
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

    // Transform Logic
    const toCanvasX = useCallback(
      (x: number) => {
        if (coordsRef.current) {
          const { llx, urx } = coordsRef.current
          return ((x - llx) / (urx - llx)) * width
        }
        return width / 2 + x
      },
      [width]
    )

    const toCanvasY = useCallback(
      (y: number) => {
        if (coordsRef.current) {
          const { lly, ury } = coordsRef.current
          return height - ((y - lly) / (ury - lly)) * height
        }
        return height / 2 - y
      },
      [height]
    )

    // Inverse Transform for Mouse Events
    const toWorldX = useCallback(
      (cx: number) => {
        if (coordsRef.current) {
          const { llx, urx } = coordsRef.current
          return llx + (cx / width) * (urx - llx)
        }
        return cx - width / 2
      },
      [width]
    )

    const toWorldY = useCallback(
      (cy: number) => {
        if (coordsRef.current) {
          const { lly, ury } = coordsRef.current
          return lly + ((height - cy) / height) * (ury - lly)
        }
        return height / 2 - cy
      },
      [height]
    )

    const getScaleX = useCallback(() => {
      if (coordsRef.current) return width / (coordsRef.current.urx - coordsRef.current.llx)
      return 1.0
    }, [width])

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

        if (canvasInstance.getAttribute("width") !== String(width))
          canvasInstance.setAttribute("width", String(width))
        if (canvasInstance.getAttribute("height") !== String(height))
          canvasInstance.setAttribute("height", String(height))

        if (overlayRef.current) {
          if (overlayRef.current.getAttribute("width") !== String(width))
            overlayRef.current.setAttribute("width", String(width))
          if (overlayRef.current.getAttribute("height") !== String(height))
            overlayRef.current.setAttribute("height", String(height))
        }

        const ctx = canvasInstance.getContext("2d")
        if (ctx) {
          if (bgColorRef.current && bgColorRef.current !== "white") {
            ctx.fillStyle = bgColorRef.current
            ctx.fillRect(0, 0, width, height)
          }
        }
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
      ctx.clearRect(0, 0, width, height)

      stampsRef.current.forEach((stamp) => drawShape(ctx, stamp))
      turtlesRef.current.forEach((turtle) => drawShape(ctx, turtle))
    }, [width, height, drawShape])

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
            if (onResize) {
              const newW = (command.width as number) || 800
              const newH = (command.height as number) || 600
              if (newW !== width || newH !== height) onResize(newW, newH)
            }
            bgColorRef.current = (command.bgcolor as string) || "white"
            ctx.fillStyle = bgColorRef.current
            ctx.fillRect(0, 0, width, height)
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
            if (onResize && (w !== width || h !== height)) onResize(w, h)
            if (command.bgcolor) {
              bgColorRef.current = command.bgcolor as string
              ctx.fillStyle = bgColorRef.current
              ctx.fillRect(0, 0, width, height)
            }
            break
          }
          case "LISTEN": {
            // New
            listeningRef.current = true
            console.log("[Turtle] Listen Enabled")
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
            const rad = t.heading * (Math.PI / 180)
            const cx = t.x + r * Math.cos(rad + Math.PI / 2)
            const cy = t.y + r * Math.sin(rad + Math.PI / 2)
            const startAngle = rad - Math.PI / 2
            const endAngle = startAngle + extent * (Math.PI / 180)
            const canvasCX = toCanvasX(cx)
            const canvasCY = toCanvasY(cy)
            const canvasR = Math.abs(r * getScaleX())
            if (command.pen_down !== false) {
              ctx.beginPath()
              if (steps) {
                const totalSweep = extent * (Math.PI / 180)
                const stepSweep = totalSweep / steps
                ctx.moveTo(
                  canvasCX + canvasR * Math.cos(-startAngle),
                  canvasCY + canvasR * Math.sin(-startAngle)
                )
                for (let i = 1; i <= steps; i++) {
                  const a = -startAngle - i * stepSweep
                  ctx.lineTo(canvasCX + canvasR * Math.cos(a), canvasCY + canvasR * Math.sin(a))
                }
              } else {
                ctx.arc(canvasCX, canvasCY, canvasR, -startAngle, -endAngle, true)
              }
              ctx.strokeStyle = t.color
              ctx.stroke()
            }
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
              ctx.strokeStyle = "black"
              ctx.stroke()
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
          case "DOT": {
            const x = toCanvasX(
              (command.x || turtlesRef.current.get(command.id as number)?.x) as number
            )
            const y = toCanvasY(
              (command.y || turtlesRef.current.get(command.id as number)?.y) as number
            )
            const size = (command.size as number) || 2
            ctx.beginPath()
            ctx.arc(x, y, size * getScaleX(), 0, Math.PI * 2)
            ctx.fillStyle = (command.color as string) || "black"
            ctx.fill()
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
        }
        if (needOverlayUpdate) redrawOverlay()
      },
      [width, height, toCanvasX, toCanvasY, redrawOverlay, onResize, getScaleX]
    )

    const clear = useCallback(() => {
      const canvas =
        canvasRef.current ||
        (containerRef.current?.querySelector("canvas:not(.absolute)") as HTMLCanvasElement)
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.fillStyle = bgColorRef.current
          ctx.fillRect(0, 0, width, height)
        }
      }
      turtlesRef.current.clear()
      const overlayCtx = overlayRef.current?.getContext("2d")
      overlayCtx?.clearRect(0, 0, width, height)
      commandQueueRef.current = []
    }, [width, height])

    const processQueue = useCallback(() => {
      const commands = [...commandQueueRef.current]
      commandQueueRef.current = []
      commands.forEach((cmd) => handleCommand(cmd))
    }, [handleCommand])

    useImperativeHandle(
      ref,
      () => ({
        handleCommand: (cmd) => {
          const canvas =
            canvasRef.current ||
            (containerRef.current?.querySelector("canvas:not(.absolute)") as HTMLCanvasElement)
          if (canvas) handleCommand(cmd)
          else commandQueueRef.current.push(cmd)
        },
        clear,
      }),
      [handleCommand, clear]
    )

    useEffect(() => {
      const interval = setInterval(() => {
        if (
          (canvasRef.current || containerRef.current?.querySelector("canvas:not(.absolute)")) &&
          commandQueueRef.current.length > 0
        )
          processQueue()
      }, 100)
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

        console.log(`[Turtle] Click at (${wx.toFixed(1)}, ${wy.toFixed(1)}) Hit: ${hitId}`)
        pushEvent({ type: "click", x: wx, y: wy, id: hitId }) // Send hitId if any
      },
      [toWorldX, toWorldY, toCanvasX, toCanvasY, pushEvent]
    )

    return (
      <div
        ref={containerRef}
        className="relative flex justify-center overflow-hidden rounded border border-border bg-white shadow-sm dark:bg-zinc-900"
        style={{ width, height }}
        onClick={handleCanvasClick}
      >
        <canvas
          ref={overlayRef}
          width={width}
          height={height}
          className="absolute left-0 top-0" // Removed pointer-events-none to allow clicking?
          // Actually DIV handles click. Canvas processes events bubble?
          // Yes, div onClick works.
        />
      </div>
    )
  }
)

TurtleCanvas.displayName = "TurtleCanvas"
