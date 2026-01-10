import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"
import { debug } from "@/lib/debug"

interface TurtleCanvasProps {
  width?: number
  height?: number
  onKeyEvent?: (key: string, type: "keydown" | "keyup") => void
  canvasInstance?: HTMLCanvasElement
  onResize?: (width: number, height: number) => void
  onSaveImage?: (filename: string, base64Data: string) => void
  runId: string
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
  penWidth: number
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
  penWidth?: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  cx?: number
  cy?: number
  radius?: number
  startAngle?: number
  endAngle?: number
  counterclockwise?: boolean
  x?: number
  y?: number
  size?: number
  path?: Point[]
  fillColor?: string
  text?: string
  font?: string
  align?: string
}

type Point = { x: number; y: number }

/**
 * TurtleCanvas - Flicker-Free Double-Buffered Implementation
 *
 * Architecture: "Hidden Back Buffer"
 * ─────────────────────────────────────────────────────────
 * ALL drawing happens on HIDDEN back-buffer canvases.
 * The user only sees the FRONT buffer.
 * On screen.update(), we BLIT back→front in one atomic operation.
 *
 * Canvas Stack:
 *   FRONT (visible):    displayCanvas     - What user sees
 *   BACK (hidden):      backBgCanvas      - Background drawing
 *                       backInkCanvas     - Ink/line drawing
 *                       backSpriteCanvas  - Sprite drawing
 *
 * Why this eliminates flicker:
 *   1. t.clear() clears the BACK buffer (invisible)
 *   2. 150 lines draw to BACK buffer (invisible)
 *   3. screen.update() copies BACK→FRONT in ONE frame
 *   4. User never sees partial states
 */
export const TurtleCanvas = forwardRef<TurtleCanvasHandle, TurtleCanvasProps>(
  ({ width = 800, height = 600, onKeyEvent, onResize, onSaveImage, runId }, ref) => {
    // Container div (React owns this)
    const containerRef = useRef<HTMLDivElement>(null)

    // ══════════════════════════════════════════════════════════
    // FRONT BUFFER (visible to user)
    // ══════════════════════════════════════════════════════════
    const displayCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const displayCtxRef = useRef<CanvasRenderingContext2D | null>(null)

    // ══════════════════════════════════════════════════════════
    // BACK BUFFERS (hidden, all drawing happens here)
    // ══════════════════════════════════════════════════════════
    const backBgCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const backInkCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const backSpriteCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const backBgCtxRef = useRef<CanvasRenderingContext2D | null>(null)
    const backInkCtxRef = useRef<CanvasRenderingContext2D | null>(null)
    const backSpriteCtxRef = useRef<CanvasRenderingContext2D | null>(null)

    // Turtle state
    const turtlesRef = useRef<Map<number, TurtleState>>(new Map())
    const stampsRef = useRef<Map<number, StampState>>(new Map())

    // Drawing state
    const bgColorRef = useRef<string>("white")
    const commandQueueRef = useRef<DrawCommand[]>([])
    const listeningRef = useRef<boolean>(false)
    const coordsRef = useRef<{ llx: number; lly: number; urx: number; ury: number } | null>(null)
    const fillPathRef = useRef<Map<number, Point[]>>(new Map())
    const drawHistoryRef = useRef<Map<number, DrawPrimitive[]>>(new Map())

    // Logical canvas size
    const logicalSizeRef = useRef<{ width: number; height: number }>({ width: 800, height: 600 })
    const [logicalSize, setLogicalSize] = useState<{ width: number; height: number }>({
      width: 800,
      height: 600,
    })

    // Initialization tracking
    const isReadyRef = useRef(false)
    const isInitializedRef = useRef(false)

    // Batching support
    const autoUpdateRef = useRef(true)

    // Helper to update logical size
    const updateLogicalSize = useCallback((newSize: { width: number; height: number }) => {
      logicalSizeRef.current = newSize
      setLogicalSize(newSize)
    }, [])

    // ─────────────────────────────────────────────────────────
    // COORDINATE TRANSFORMS
    // ─────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────
    // CANVAS INITIALIZATION (RUNS ONCE)
    // ─────────────────────────────────────────────────────────
    useEffect(() => {
      if (isInitializedRef.current || !containerRef.current) return

      const container = containerRef.current
      const lw = logicalSizeRef.current.width
      const lh = logicalSizeRef.current.height

      // Clear any existing children
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }

      // ════════════════════════════════════════════════════════
      // CREATE FRONT BUFFER (visible)
      // ════════════════════════════════════════════════════════
      const displayCanvas = document.createElement("canvas")
      displayCanvas.width = lw
      displayCanvas.height = lh
      displayCanvas.style.position = "absolute"
      displayCanvas.style.left = "0"
      displayCanvas.style.top = "0"
      container.appendChild(displayCanvas)
      displayCanvasRef.current = displayCanvas
      displayCtxRef.current = displayCanvas.getContext("2d")

      // Fill initial white background on front buffer
      if (displayCtxRef.current) {
        displayCtxRef.current.fillStyle = "white"
        displayCtxRef.current.fillRect(0, 0, lw, lh)
      }

      // ════════════════════════════════════════════════════════
      // CREATE BACK BUFFERS (hidden, not in DOM)
      // ════════════════════════════════════════════════════════
      const backBg = document.createElement("canvas")
      backBg.width = lw
      backBg.height = lh
      backBgCanvasRef.current = backBg
      backBgCtxRef.current = backBg.getContext("2d")

      const backInk = document.createElement("canvas")
      backInk.width = lw
      backInk.height = lh
      backInkCanvasRef.current = backInk
      backInkCtxRef.current = backInk.getContext("2d")

      const backSprite = document.createElement("canvas")
      backSprite.width = lw
      backSprite.height = lh
      backSpriteCanvasRef.current = backSprite
      backSpriteCtxRef.current = backSprite.getContext("2d")

      // Fill initial background on back buffer
      if (backBgCtxRef.current) {
        backBgCtxRef.current.fillStyle = bgColorRef.current
        backBgCtxRef.current.fillRect(0, 0, lw, lh)
      }

      isInitializedRef.current = true
      isReadyRef.current = true

      debug.log("[Turtle] Double-buffered canvas initialized")

      return () => {
        isInitializedRef.current = false
        isReadyRef.current = false
      }
    }, [])

    // ─────────────────────────────────────────────────────────
    // SWAP BUFFERS: Copy back buffer to front buffer
    // This is the ONLY time the user sees a change!
    // ─────────────────────────────────────────────────────────
    const swapBuffers = useCallback(() => {
      const displayCtx = displayCtxRef.current
      const backBg = backBgCanvasRef.current
      const backInk = backInkCanvasRef.current
      const backSprite = backSpriteCanvasRef.current

      if (!displayCtx || !backBg || !backInk || !backSprite) return

      const lw = logicalSizeRef.current.width
      const lh = logicalSizeRef.current.height

      // Clear front buffer
      displayCtx.clearRect(0, 0, lw, lh)

      // Composite all back buffers to front in one operation
      displayCtx.drawImage(backBg, 0, 0)
      displayCtx.drawImage(backInk, 0, 0)
      displayCtx.drawImage(backSprite, 0, 0)
    }, [])

    // ─────────────────────────────────────────────────────────
    // DRAW SPRITE (turtle shape) - draws to BACK sprite buffer
    // ─────────────────────────────────────────────────────────
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
          // Standard Python Turtle Shape Polygon
          // Coordinates derived from CPython turtle.py, rotated -90deg to face East
          const p = [
            [16, 0],
            [14, 2],
            [10, 1],
            [7, 4],
            [9, 7],
            [8, 9],
            [5, 6],
            [1, 7],
            [-3, 5],
            [-6, 8],
            [-8, 6],
            [-5, 4],
            [-7, 0],
            [-5, -4],
            [-8, -6],
            [-6, -8],
            [-3, -5],
            [1, -7],
            [5, -6],
            [8, -9],
            [9, -7],
            [7, -4],
            [10, -1],
            [14, -2],
          ]
          ctx.moveTo(p[0][0], p[0][1])
          for (let i = 1; i < p.length; i++) {
            ctx.lineTo(p[i][0], p[i][1])
          }
          ctx.closePath()
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
          // "Classic" Turtle Shape
          ctx.moveTo(0, 0)
          ctx.lineTo(-10, 4)
          ctx.lineTo(-7, 0)
          ctx.lineTo(-10, -4)
          ctx.closePath()
        }

        ctx.fill()
        ctx.stroke()
        ctx.restore()
      },
      [toCanvasX, toCanvasY]
    )

    // ─────────────────────────────────────────────────────────
    // REDRAW SPRITES to BACK sprite buffer
    // ─────────────────────────────────────────────────────────
    const redrawSpritesToBackBuffer = useCallback(() => {
      const ctx = backSpriteCtxRef.current
      if (!ctx) return

      const lw = logicalSizeRef.current.width
      const lh = logicalSizeRef.current.height

      ctx.clearRect(0, 0, lw, lh)
      stampsRef.current.forEach((stamp) => drawShape(ctx, stamp))
      turtlesRef.current.forEach((turtle) => drawShape(ctx, turtle))
    }, [drawShape])

    // ─────────────────────────────────────────────────────────
    // REPLAY INK HISTORY to BACK ink buffer
    // ─────────────────────────────────────────────────────────
    const replayInkHistoryToBackBuffer = useCallback(() => {
      const ctx = backInkCtxRef.current
      if (!ctx) return

      const lw = logicalSizeRef.current.width
      const lh = logicalSizeRef.current.height

      ctx.clearRect(0, 0, lw, lh)

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
                ctx.lineWidth = (prim.penWidth || 1) * getScaleX()
                ctx.lineCap = "round"
                ctx.stroke()
              }
              break
            case "arc":
              if (prim.cx !== undefined && prim.cy !== undefined && prim.radius !== undefined) {
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
                ctx.lineWidth = (prim.penWidth || 1) * getScaleX()
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
    }, [toCanvasX, toCanvasY, getScaleX])

    // ─────────────────────────────────────────────────────────
    // RESIZE CANVASES
    // ─────────────────────────────────────────────────────────
    useEffect(() => {
      if (!isInitializedRef.current) return

      const lw = logicalSize.width
      const lh = logicalSize.height

      // Resize all canvases
      const allCanvases = [
        displayCanvasRef.current,
        backBgCanvasRef.current,
        backInkCanvasRef.current,
        backSpriteCanvasRef.current,
      ]
      allCanvases.forEach((canvas) => {
        if (canvas && (canvas.width !== lw || canvas.height !== lh)) {
          canvas.width = lw
          canvas.height = lh
        }
      })

      // Refill background
      if (backBgCtxRef.current) {
        backBgCtxRef.current.fillStyle = bgColorRef.current
        backBgCtxRef.current.fillRect(0, 0, lw, lh)
      }

      // Replay history to back buffers
      replayInkHistoryToBackBuffer()
      redrawSpritesToBackBuffer()

      // Swap to show
      swapBuffers()
    }, [logicalSize, replayInkHistoryToBackBuffer, redrawSpritesToBackBuffer, swapBuffers])

    // ─────────────────────────────────────────────────────────
    // ADD PRIMITIVE TO HISTORY
    // ─────────────────────────────────────────────────────────
    const addPrimitive = useCallback((turtleId: number, primitive: DrawPrimitive) => {
      if (!drawHistoryRef.current.has(turtleId)) {
        drawHistoryRef.current.set(turtleId, [])
      }
      drawHistoryRef.current.get(turtleId)!.push(primitive)
    }, [])

    // ─────────────────────────────────────────────────────────
    // HANDLE COMMAND - ALL drawing goes to BACK buffers
    // ─────────────────────────────────────────────────────────
    const handleCommand = useCallback(
      (command: DrawCommand) => {
        const inkCtx = backInkCtxRef.current
        const bgCtx = backBgCtxRef.current

        if (!inkCtx || !bgCtx) {
          commandQueueRef.current.push(command)
          return
        }

        const { cmd } = command

        switch (cmd) {
          case "INIT":
          case "INIT_SCREEN": {
            const newW = (command.width as number) || 800
            const newH = (command.height as number) || 600
            updateLogicalSize({ width: newW, height: newH })
            if (onResize && (newW !== width || newH !== height)) onResize(newW, newH)
            bgColorRef.current = (command.bgcolor as string) || "white"

            // Clear all state
            turtlesRef.current.clear()
            fillPathRef.current.clear()
            stampsRef.current.clear()
            drawHistoryRef.current.clear()
            coordsRef.current = null
            listeningRef.current = false

            // Clear and refill back buffers
            if (bgCtx) {
              bgCtx.fillStyle = bgColorRef.current
              bgCtx.fillRect(0, 0, newW, newH)
            }
            inkCtx.clearRect(0, 0, newW, newH)
            backSpriteCtxRef.current?.clearRect(0, 0, newW, newH)

            // Auto-swap on init for immediate feedback
            swapBuffers()
            break
          }

          case "CLEAR_SCREEN": {
            // CPython clearscreen():
            // 1. Delete all drawings and turtles
            // 2. Reset empty TurtleScreen to initial state: white bg, no image, no event bindings, tracing on

            bgColorRef.current = "white"
            autoUpdateRef.current = true // Tracing on
            listeningRef.current = false // No bindings

            turtlesRef.current.clear()
            fillPathRef.current.clear()
            stampsRef.current.clear()
            drawHistoryRef.current.clear()
            coordsRef.current = null

            // Clear buffers
            if (bgCtx) {
              // Reset transform? No, CPython clearscreen doesn't reset coordinates, resetscreen does?
              // Wait, CPython clearscreen: "Reset the empty TurtleScreen to its initial state"
              // This implies coordinates are reset to standard?
              // Usually clearscreen DOES reset coordinates.
              // Let's assume standard behavior: clean slate.
              if (coordsRef.current === null) {
                // If we were using standard coords (null), stay null
              } else {
                // If we had custom coords, do we keep them?
                // CPython 'resetscreen' resets turtles. 'clearscreen' resets SCREEN.
                // clearscreen effectively is "new screen".
                coordsRef.current = null
              }

              bgCtx.fillStyle = "white"
              bgCtx.fillRect(0, 0, width, height)
            }
            if (inkCtx) {
              inkCtx.clearRect(0, 0, width, height)
            }
            backSpriteCtxRef.current?.clearRect(0, 0, width, height)

            swapBuffers()
            break
          }

          case "SETUP": {
            const w = command.width as number
            const h = command.height as number
            updateLogicalSize({ width: w, height: h })
            if (onResize && (w !== width || h !== height)) onResize(w, h)
            if (command.bgcolor) {
              bgColorRef.current = command.bgcolor as string
              if (bgCtx) {
                bgCtx.fillStyle = bgColorRef.current
                bgCtx.fillRect(0, 0, w, h)
              }
            }
            swapBuffers()
            break
          }

          case "LISTEN": {
            listeningRef.current = true
            break
          }

          case "UPDATE": {
            // THIS IS THE KEY: Only swap buffers on explicit UPDATE
            redrawSpritesToBackBuffer()
            swapBuffers()
            break
          }

          case "SET_COORDS": {
            coordsRef.current = {
              llx: command.llx as number,
              lly: command.lly as number,
              urx: command.urx as number,
              ury: command.ury as number,
            }
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
              penWidth: 1,
            })
            if (autoUpdateRef.current) {
              redrawSpritesToBackBuffer()
              swapBuffers()
            }
            break
          }

          case "UPDATE_TURTLE": {
            const id = command.id as number
            const t = turtlesRef.current.get(id)
            if (t) {
              if (command.shape) t.shape = command.shape as string
              if (command.stretchWid) t.stretchWid = command.stretchWid as number
              if (command.stretchLen) t.stretchLen = command.stretchLen as number
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

            t.x = command.x as number
            t.y = command.y as number

            if (command.pen_down) {
              const penWidth = (command.width as number) || t.penWidth || 1
              const color = (command.color as string) || t.color || "black"

              // Draw to BACK ink buffer (invisible)
              inkCtx.beginPath()
              inkCtx.moveTo(toCanvasX(oldX), toCanvasY(oldY))
              inkCtx.lineTo(toCanvasX(t.x), toCanvasY(t.y))
              inkCtx.strokeStyle = color
              inkCtx.lineWidth = penWidth * getScaleX()
              inkCtx.lineCap = "round"
              inkCtx.stroke()

              addPrimitive(id, {
                type: "line",
                turtleId: id,
                color,
                penWidth,
                x1: oldX,
                y1: oldY,
                x2: t.x,
                y2: t.y,
              })
            }

            // IMPORTANT: Do NOT swap here! Wait for UPDATE command.
            if (autoUpdateRef.current) {
              redrawSpritesToBackBuffer()
              swapBuffers()
            }
            break
          }

          case "ROTATE": {
            const id = command.id as number
            const t = turtlesRef.current.get(id)
            if (t) {
              t.heading = command.heading as number
              if (autoUpdateRef.current) {
                redrawSpritesToBackBuffer()
                swapBuffers()
              }
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

            const numPoints = steps || Math.max(12, Math.ceil(Math.abs(extent) / 10))
            const arcPoints: Point[] = []
            for (let i = 0; i <= numPoints; i++) {
              const angle = startAngle + (endAngle - startAngle) * (i / numPoints)
              arcPoints.push({
                x: cx + Math.abs(r) * Math.cos(angle),
                y: cy + Math.abs(r) * Math.sin(angle),
              })
            }

            if (filling) {
              const path = fillPathRef.current.get(id)
              if (path) path.push(...arcPoints)
            }

            if (command.pen_down !== false) {
              const strokeColor = (command.color as string) || t.color
              const lineWidth = (command.width as number) || t.penWidth || 1
              inkCtx.beginPath()
              inkCtx.lineWidth = lineWidth
              if (steps) {
                inkCtx.moveTo(toCanvasX(arcPoints[0].x), toCanvasY(arcPoints[0].y))
                for (let i = 1; i < arcPoints.length; i++) {
                  inkCtx.lineTo(toCanvasX(arcPoints[i].x), toCanvasY(arcPoints[i].y))
                }
              } else {
                inkCtx.arc(canvasCX, canvasCY, canvasR, -startAngle, -endAngle, r >= 0)
              }
              inkCtx.strokeStyle = strokeColor
              inkCtx.stroke()

              // Add to draw history so it persists
              addPrimitive(id, {
                type: "arc",
                turtleId: id,
                cx,
                cy,
                radius: Math.abs(r),
                startAngle,
                endAngle,
                counterclockwise: r >= 0,
                color: strokeColor,
                penWidth: lineWidth,
              })
            }

            if (filling && extent === 360) {
              inkCtx.beginPath()
              inkCtx.arc(canvasCX, canvasCY, canvasR, 0, Math.PI * 2)
              inkCtx.fillStyle = fillcolor || t.fillColor || t.color
              inkCtx.fill()
              inkCtx.strokeStyle = (command.color as string) || t.color
              inkCtx.stroke()
            }

            t.x = endX
            t.y = endY
            if (r >= 0) {
              t.heading = (t.heading + extent) % 360
            } else {
              t.heading = (t.heading - extent + 360) % 360
            }

            if (autoUpdateRef.current) {
              redrawSpritesToBackBuffer()
              swapBuffers()
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
            const t = turtlesRef.current.get(id)
            if (path && path.length > 2) {
              inkCtx.beginPath()
              inkCtx.moveTo(toCanvasX(path[0].x), toCanvasY(path[0].y))
              for (let i = 1; i < path.length; i++) {
                inkCtx.lineTo(toCanvasX(path[i].x), toCanvasY(path[i].y))
              }
              inkCtx.closePath()
              inkCtx.fillStyle = (command.color as string) || "black"
              inkCtx.fill()
              inkCtx.strokeStyle = t?.color || (command.color as string) || "black"
              inkCtx.stroke()

              addPrimitive(id, {
                type: "fill",
                turtleId: id,
                color: t?.color || (command.color as string) || "black",
                fillColor: (command.color as string) || "black",
                path: [...path],
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
              if (command.width) t.penWidth = command.width as number
            }
            break
          }

          case "BGCOLOR": {
            bgColorRef.current = command.color as string
            if (bgCtx) {
              bgCtx.fillStyle = bgColorRef.current
              bgCtx.fillRect(0, 0, logicalSizeRef.current.width, logicalSizeRef.current.height)
            }
            swapBuffers()
            break
          }

          case "CLEAR": {
            const turtleId = command.id as number

            // Remove this turtle's draw history
            drawHistoryRef.current.delete(turtleId)

            // Clear stamps for this turtle
            stampsRef.current.forEach((stamp, id) => {
              if (stamp.turtleId === turtleId) {
                stampsRef.current.delete(id)
              }
            })

            // Replay to back buffer (invisible)
            replayInkHistoryToBackBuffer()

            // DO NOT swap here - wait for UPDATE
            break
          }

          case "DOT": {
            const id = command.id as number
            const worldX = (command.x || turtlesRef.current.get(id)?.x) as number
            const worldY = (command.y || turtlesRef.current.get(id)?.y) as number
            const x = toCanvasX(worldX)
            const y = toCanvasY(worldY)
            const size = (command.size as number) || 2
            const color = (command.color as string) || "black"

            inkCtx.beginPath()
            inkCtx.arc(x, y, size * getScaleX(), 0, Math.PI * 2)
            inkCtx.fillStyle = color
            inkCtx.fill()

            addPrimitive(id, {
              type: "dot",
              turtleId: id,
              color,
              x: worldX,
              y: worldY,
              size,
            })
            break
          }

          case "WRITE": {
            const id = command.id as number
            const t = turtlesRef.current.get(id)
            const wx = command.x !== undefined ? (command.x as number) : t?.x || 0
            const wy = command.y !== undefined ? (command.y as number) : t?.y || 0
            const cx = toCanvasX(wx)
            const cy = toCanvasY(wy)
            const text = String(command.arg)
            const move = command.move === true
            const align = (command.align as string) || "left"
            const font = command.font as [string, number, string] | undefined
            const color = (command.color as string) || t?.color || "black"

            inkCtx.save()

            let fontFamily = "Arial"
            let fontSize = 12
            let fontStyle = "normal"
            if (font) {
              ;[fontFamily, fontSize, fontStyle] = font
            }

            inkCtx.font = `${fontStyle} ${fontSize}px ${fontFamily}`
            inkCtx.textAlign = align as CanvasTextAlign
            inkCtx.textBaseline = "alphabetic"
            inkCtx.fillStyle = color
            inkCtx.fillText(text, cx, cy)

            if (move && t) {
              const metrics = inkCtx.measureText(text)
              t.x =
                wx + (align === "left" ? metrics.width : align === "center" ? metrics.width / 2 : 0)
            }

            addPrimitive(id, {
              type: "text",
              turtleId: id,
              color,
              x: wx,
              y: wy,
              text,
              font: `${fontStyle} ${fontSize}px ${fontFamily}`,
              align,
            })

            inkCtx.restore()
            break
          }

          case "SHOW": {
            const t = turtlesRef.current.get(command.id as number)
            if (t) t.visible = true
            break
          }

          case "HIDE": {
            const t = turtlesRef.current.get(command.id as number)
            if (t) t.visible = false
            break
          }

          case "SAVE": {
            // Capture current canvas as PNG and send to worker to write to virtual FS
            if (!displayCanvasRef.current) break

            try {
              // Ensure we capture the fully rendered state
              redrawSpritesToBackBuffer()
              swapBuffers()

              const dataUrl = displayCanvasRef.current.toDataURL("image/png")
              // Extract base64 data (remove "data:image/png;base64," prefix)
              const base64Data = dataUrl.split(",")[1]
              const filename = (command.filename as string) || "turtle_drawing.png"

              // Use callback to send image data to PythonRunner -> Worker
              if (onSaveImage) {
                onSaveImage(filename, base64Data)
                debug.log(`[Turtle] Sent ${filename} to worker via callback`)
              } else {
                debug.warn("[Turtle] onSaveImage callback not provided")
              }
            } catch (e) {
              debug.error("[Turtle] Failed to capture canvas for save", e)
            }
            break
          }

          case "SET_AUTO_UPDATE": {
            autoUpdateRef.current = command.value as boolean
            break
          }
        }
      },
      [
        width,
        height,
        toCanvasX,
        toCanvasY,
        redrawSpritesToBackBuffer,
        swapBuffers,
        onResize,
        onSaveImage,
        getScaleX,
        addPrimitive,
        replayInkHistoryToBackBuffer,
        updateLogicalSize,
      ]
    )

    // ─────────────────────────────────────────────────────────
    // CLEAR (full reset)
    // ─────────────────────────────────────────────────────────
    const clear = useCallback(() => {
      const lw = logicalSizeRef.current.width
      const lh = logicalSizeRef.current.height

      // Clear all back buffers
      if (backBgCtxRef.current) {
        backBgCtxRef.current.fillStyle = bgColorRef.current
        backBgCtxRef.current.fillRect(0, 0, lw, lh)
      }
      if (backInkCtxRef.current) {
        backInkCtxRef.current.clearRect(0, 0, lw, lh)
      }
      if (backSpriteCtxRef.current) {
        backSpriteCtxRef.current.clearRect(0, 0, lw, lh)
      }

      // Clear state
      turtlesRef.current.clear()
      stampsRef.current.clear()
      drawHistoryRef.current.clear()
      fillPathRef.current.clear()
      commandQueueRef.current = []

      // Swap to show cleared state
      swapBuffers()
    }, [swapBuffers])

    // ─────────────────────────────────────────────────────────
    // PROCESS QUEUE
    // ─────────────────────────────────────────────────────────
    const processQueue = useCallback(() => {
      if (!isReadyRef.current) return

      const commands = [...commandQueueRef.current]
      commandQueueRef.current = []
      commands.forEach((cmd) => handleCommand(cmd))
    }, [handleCommand])

    // ─────────────────────────────────────────────────────────
    // IMPERATIVE HANDLE
    // ─────────────────────────────────────────────────────────
    useImperativeHandle(
      ref,
      () => ({
        handleCommand: (cmd) => {
          if (isReadyRef.current && backInkCtxRef.current) {
            handleCommand(cmd)
          } else {
            commandQueueRef.current.push(cmd)
          }
        },
        clear,
        getCanvasDataURL: () => {
          if (!displayCanvasRef.current) return null

          try {
            return displayCanvasRef.current.toDataURL("image/png")
          } catch (e) {
            debug.error("Failed to capture turtle canvas thumbnail", e)
            return null
          }
        },
      }),
      [handleCommand, clear]
    )

    // ─────────────────────────────────────────────────────────
    // QUEUE PROCESSING
    // ─────────────────────────────────────────────────────────
    useEffect(() => {
      if (isReadyRef.current && commandQueueRef.current.length > 0) {
        processQueue()
      }
    }, [processQueue])

    useEffect(() => {
      const interval = setInterval(() => {
        if (isReadyRef.current && commandQueueRef.current.length > 0) {
          processQueue()
        }
      }, 16)
      return () => clearInterval(interval)
    }, [processQueue])

    // ─────────────────────────────────────────────────────────
    // INPUT EVENTS
    // ─────────────────────────────────────────────────────────
    const pushEvent = useCallback(
      (data: { key?: string; type: string; x?: number; y?: number; id?: number | null }) => {
        fetch("/_turtle_push_event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, runId }),
        }).catch(() => {})
      },
      [runId]
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
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top
        const wx = toWorldX(cx)
        const wy = toWorldY(cy)

        let hitId: number | null = null
        const tList = Array.from(turtlesRef.current.values()).reverse()
        for (const t of tList) {
          if (!t.visible) continue
          const tcx = toCanvasX(t.x)
          const tcy = toCanvasY(t.y)
          const dcx = cx - tcx
          const dcy = cy - tcy
          const cDist = Math.sqrt(dcx * dcx + dcy * dcy)

          if (cDist < 15 * Math.max(t.stretchLen, t.stretchWid)) {
            hitId = t.id
            break
          }
        }

        debug.log(`[Turtle] Click at (${wx.toFixed(1)}, ${wy.toFixed(1)}) Hit: ${hitId}`)
        pushEvent({ type: "click", x: wx, y: wy, id: hitId })
      },
      [toWorldX, toWorldY, toCanvasX, toCanvasY, pushEvent]
    )

    // Track mouse button state for drag detection
    const isMouseDownRef = useRef(false)
    const lastDragTargetRef = useRef<number | null>(null)

    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        isMouseDownRef.current = true
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top

        // Find hit target on mouse down
        let hitId: number | null = null
        const tList = Array.from(turtlesRef.current.values()).reverse()
        for (const t of tList) {
          if (!t.visible) continue
          const tcx = toCanvasX(t.x)
          const tcy = toCanvasY(t.y)
          const dcx = cx - tcx
          const dcy = cy - tcy
          const cDist = Math.sqrt(dcx * dcx + dcy * dcy)

          if (cDist < 15 * Math.max(t.stretchLen, t.stretchWid)) {
            hitId = t.id
            break
          }
        }
        lastDragTargetRef.current = hitId
      },
      [toCanvasX, toCanvasY]
    )

    const handleMouseUp = useCallback(
      (e: React.MouseEvent) => {
        isMouseDownRef.current = false
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top
        const wx = toWorldX(cx)
        const wy = toWorldY(cy)

        // Find hit target
        let hitId: number | null = null
        const tList = Array.from(turtlesRef.current.values()).reverse()
        for (const t of tList) {
          if (!t.visible) continue
          const tcx = toCanvasX(t.x)
          const tcy = toCanvasY(t.y)
          const dcx = cx - tcx
          const dcy = cy - tcy
          const cDist = Math.sqrt(dcx * dcx + dcy * dcy)

          if (cDist < 15 * Math.max(t.stretchLen, t.stretchWid)) {
            hitId = t.id
            break
          }
        }

        debug.log(`[Turtle] MouseUp at (${wx.toFixed(1)}, ${wy.toFixed(1)}) Hit: ${hitId}`)
        pushEvent({ type: "mouseup", x: wx, y: wy, id: hitId })
        lastDragTargetRef.current = null
      },
      [toWorldX, toWorldY, toCanvasX, toCanvasY, pushEvent]
    )

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        // Only track drag when mouse is down
        if (!isMouseDownRef.current) return

        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top
        const wx = toWorldX(cx)
        const wy = toWorldY(cy)

        // Use the drag target from mousedown
        const hitId = lastDragTargetRef.current

        pushEvent({ type: "drag", x: wx, y: wy, id: hitId })
      },
      [toWorldX, toWorldY, pushEvent]
    )

    // ─────────────────────────────────────────────────────────
    // RENDER (Just a container div)
    // ─────────────────────────────────────────────────────────
    return (
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded border border-border bg-white shadow-sm dark:bg-zinc-900"
        style={{ width: logicalSize.width, height: logicalSize.height }}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
    )
  }
)

TurtleCanvas.displayName = "TurtleCanvas"
