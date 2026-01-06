import { useEffect, useRef } from "react"
import { useTheme } from "@/components/theme-provider"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

const PARTICLE_COUNT = 80
const CONNECTION_DISTANCE = 120
const PARTICLE_SPEED = 0.4

export function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const initParticles = (width: number, height: number) => {
      const particles: Particle[] = []
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * PARTICLE_SPEED,
          vy: (Math.random() - 0.5) * PARTICLE_SPEED,
          radius: Math.random() * 2 + 1,
        })
      }
      particlesRef.current = particles
    }

    const draw = () => {
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const width = canvas.width / dpr
      const height = canvas.height / dpr
      const particles = particlesRef.current
      const isDark = resolvedTheme === "dark"

      // Draw background first (so particles appear on top)
      ctx.fillStyle = isDark ? "#171717" : "#f3f3ee"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Colors based on theme
      const particleColor = isDark ? "rgba(16, 185, 129, 0.7)" : "rgba(0, 0, 0, 0.25)"

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Update position
        p.x += p.vx
        p.y += p.vy

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Keep in bounds
        p.x = Math.max(0, Math.min(width, p.x))
        p.y = Math.max(0, Math.min(height, p.y))

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x * dpr, p.y * dpr, p.radius * dpr, 0, Math.PI * 2)
        ctx.fillStyle = particleColor
        ctx.fill()

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < CONNECTION_DISTANCE) {
            const opacity = 1 - dist / CONNECTION_DISTANCE
            ctx.beginPath()
            ctx.moveTo(p.x * dpr, p.y * dpr)
            ctx.lineTo(p2.x * dpr, p2.y * dpr)
            ctx.strokeStyle = isDark
              ? `rgba(16, 185, 129, ${0.2 * opacity})`
              : `rgba(0, 0, 0, ${0.15 * opacity})`
            ctx.lineWidth = 1 * dpr
            ctx.stroke()
          }
        }
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      initParticles(rect.width, rect.height)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    // Start animation
    animationRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [resolvedTheme])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    />
  )
}
