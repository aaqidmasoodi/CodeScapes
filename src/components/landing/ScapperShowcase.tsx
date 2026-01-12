import { useState, useEffect, useRef } from "react"
import {
  Terminal,
  Cpu,
  Sparkles,
  Play,
  Wand2,
  Wrench,
  Download,
  ShieldCheck,
  Rocket,
} from "lucide-react"

export function ScapperShowcase() {
  const [text, setText] = useState("")
  const [stage, setStage] = useState<"idle" | "typing" | "thinking" | "modifying" | "done">("idle")
  const scrollRef = useRef<HTMLDivElement>(null)

  const prompt =
    "create a python program that asks user their age and tells them weather they are allow to drive or not based on their age."

  // Auto-scroll effect
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [text, stage])

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const runAnimation = async () => {
      // Reset
      setStage("typing")
      setText("")

      // Type out prompt
      for (let i = 0; i <= prompt.length; i++) {
        setText(prompt.slice(0, i))
        await new Promise((r) => setTimeout(r, 40)) // Typing speed
      }

      await new Promise((r) => setTimeout(r, 800)) // Pause after typing
      setStage("thinking")

      await new Promise((r) => setTimeout(r, 1500)) // Thinking time
      setStage("modifying")

      await new Promise((r) => setTimeout(r, 2000)) // Modifying time
      setStage("done")

      await new Promise((r) => setTimeout(r, 4000)) // Show result

      setText("") // Clear text before restarting loop
      setStage("idle")
    }

    if (stage === "idle") {
      timeout = setTimeout(runAnimation, 1000)
    }

    return () => clearTimeout(timeout)
  }, [stage])

  return (
    <div className="col-span-6 my-4">
      <div className="group relative overflow-hidden rounded-xl p-[2px]">
        {/* Main Card Content - Pure Glassmorphism (No Solid Background) */}
        <div className="relative flex h-full flex-col items-center gap-12 overflow-hidden rounded-xl border border-white/20 p-6 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-300 dark:border-white/10 md:p-10 lg:flex-row">
          {/* Glassmorphism Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-white/60 to-white/40 dark:from-emerald-500/5 dark:via-white/[0.03] dark:to-white/[0.02]" />

          {/* Content Container (relative z-10 to sit above overlay) */}
          <div className="relative z-10 flex w-full flex-col items-center gap-12 lg:flex-row">
            {/* Left Side: Pitch */}
            <div className="flex-1 space-y-6">
              <div className="mb-2 flex items-center gap-2 text-emerald-600 dark:text-[#00ff9d]">
                <Sparkles size={20} />
                <span className="text-sm font-medium uppercase tracking-wider">
                  AI Coding Assistant
                </span>
              </div>

              <h2 className="text-3xl font-bold leading-tight text-zinc-900 dark:text-white md:text-4xl">
                Meet{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-[#00ff9d] dark:to-emerald-600">
                  Scapper
                </span>
                .
              </h2>
              <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                Your intelligent pair programmer. It understands your project, modifying files
                directly without copy-pasting code. Just chat, and watch it build.
              </p>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                  <Cpu size={14} className="text-emerald-600 dark:text-[#00ff9d]" /> Context Aware
                </div>
                <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                  <Terminal size={14} className="text-emerald-600 dark:text-[#00ff9d]" /> Terminal
                  Integration
                </div>
                <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                  <Wand2 size={14} className="text-emerald-600 dark:text-[#00ff9d]" /> Generate &
                  Edit Code
                </div>
                <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                  <Wrench size={14} className="text-emerald-600 dark:text-[#00ff9d]" /> Fix Syntax &
                  Runtime Errors
                </div>
                <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                  <Download size={14} className="text-emerald-600 dark:text-[#00ff9d]" /> Install
                  packages automatically
                </div>
                <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                  <ShieldCheck size={14} className="text-emerald-600 dark:text-[#00ff9d]" /> Run,
                  test & Verify Code
                </div>
                <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                  <Rocket size={14} className="text-emerald-600 dark:text-[#00ff9d]" /> Build Cool
                  Projects
                </div>
              </div>
            </div>

            {/* Right Side: Terminal Simulation */}
            <div className="w-full max-w-xl flex-1">
              <div className="relative flex h-[420px] w-full flex-col overflow-hidden rounded-lg border border-black/10 bg-[#1e1e1e] font-mono text-sm shadow-2xl dark:border-white/10 dark:bg-black/80">
                {/* Terminal Header */}
                <div className="flex shrink-0 items-center gap-1.5 border-b border-white/5 bg-[#2d2d2d] px-4 py-3 dark:bg-white/5">
                  <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                  <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                  <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
                  <div className="ml-auto text-xs text-zinc-400 dark:text-zinc-500">
                    scapper — zsh
                  </div>
                </div>

                {/* Terminal Body */}
                <div
                  ref={scrollRef}
                  className="no-scrollbar flex-1 space-y-4 overflow-y-auto scroll-smooth bg-[#1e1e1e] p-6 dark:bg-transparent"
                >
                  {/* Intro */}
                  <div className="text-zinc-500">
                    Type <span className="text-zinc-300">/quit</span> or{" "}
                    <span className="text-zinc-300">/exit</span> to leave
                  </div>

                  {/* Prompt Line */}
                  <div>
                    <div className="mb-1 flex gap-2 text-[#00ff9d]">
                      <span>➜</span>
                      <span>scapper</span>
                    </div>
                    <div className="min-h-[24px] whitespace-pre-wrap break-words leading-relaxed text-zinc-300">
                      {text}
                      {(stage === "typing" || stage === "idle") && (
                        <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-[#00ff9d] align-middle" />
                      )}
                    </div>
                  </div>

                  {/* Agent Activity */}
                  {(stage === "thinking" || stage === "modifying" || stage === "done") && (
                    <div className="space-y-2 duration-500 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Cpu size={14} className="animate-spin" />
                        <span>Understanding your request...</span>
                      </div>
                      <div className="pl-6 text-xs text-zinc-500">Reading project structure...</div>
                      <div className="pl-6 text-xs text-zinc-500">main.py (python)</div>
                    </div>
                  )}

                  {(stage === "modifying" || stage === "done") && (
                    <div className="space-y-2 duration-500 animate-in fade-in slide-in-from-bottom-2">
                      <div className="pl-6 text-xs text-zinc-500">Analyzed main.py (1 lines)</div>
                      <div className="flex items-center gap-2 text-amber-400">
                        <Terminal size={14} />
                        <span>Overwriting main.py...</span>
                      </div>
                      <div className="pl-6 text-xs text-zinc-500">Overwrote main.py (29 lines)</div>
                    </div>
                  )}

                  {stage === "done" && (
                    <div className="space-y-4 border-t border-white/5 pt-2 duration-500 animate-in fade-in slide-in-from-bottom-2">
                      <p className="text-zinc-300">
                        I’ve updated <strong className="text-white">main.py</strong> with a simple
                        program that asks for the user’s age and reports whether they’re eligible to
                        drive.
                      </p>
                      <p className="text-zinc-400">
                        Would you like me to run the script to see it in action?
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button className="flex items-center gap-1 rounded border border-[#00ff9d]/20 bg-[#00ff9d]/10 px-3 py-1 text-xs text-[#00ff9d] transition-colors hover:bg-[#00ff9d]/20">
                          <Play size={12} fill="currentColor" /> Run
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
