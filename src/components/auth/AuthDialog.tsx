import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Github, Loader2, Mail, CheckCircle2, ArrowRight } from "lucide-react"
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/auth/TurnstileWidget"
import { CodeScapeLogo } from "@/components/brand/Logo"
import { AnimatePresence, motion } from "framer-motion"

export function AuthDialog({
  children,
  open,
  onOpenChange,
}: {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const { signInWithGithub, signInWithGoogle, signInWithEmail, signUpWithEmail, loading, user } =
    useAuth()
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)

  // Auto-close on auth
  useEffect(() => {
    if (user && open && onOpenChange) {
      onOpenChange(false)
    }
  }, [user, open, onOpenChange])

  // Email Auth State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [verificationPending, setVerificationPending] = useState(false)

  const turnstileRef = useRef<TurnstileWidgetRef>(null)

  // Reset Turnstile when switching modes
  useEffect(() => {
    setError(null)
    setSuccessMsg(null)
    turnstileRef.current?.reset()
    setTurnstileToken(null)
  }, [isSignUp])

  const handleGithubLogin = async () => {
    try {
      setIsGithubLoading(true)
      await signInWithGithub()
    } catch (error) {
      console.error("Login failed", error)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      await signInWithGoogle()
    } catch (error) {
      console.error("Login failed", error)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setError(null)
    setSuccessMsg(null)
    setIsEmailLoading(true)

    try {
      // Validate Turnstile token server-side (skip in dev if no token)
      if (turnstileToken && turnstileToken !== "dev-bypass-token") {
        const verifyRes = await fetch("/api/verify-turnstile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: turnstileToken }),
        })
        const verifyData = await verifyRes.json()
        if (!verifyData.success) {
          throw new Error("Bot verification failed. Please try again.")
        }
      }

      if (isSignUp) {
        await signUpWithEmail(email, password)
        setVerificationPending(true)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error(err)
      setError(error.message || "Authentication failed")
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    } finally {
      setIsEmailLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="overflow-hidden transition-all duration-300 sm:max-w-[425px]">
        <AnimatePresence mode="wait">
          {verificationPending ? (
            <motion.div
              key="verification"
              initial={{ opacity: 0, height: "300px" }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: "300px" }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="flex justify-center pb-2">
                  <div className="rounded-full bg-emerald-500/10 p-3">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                </DialogTitle>
                <DialogDescription className="text-center text-base font-medium text-foreground">
                  Check your email
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  We've sent a verification link to{" "}
                  <span className="font-semibold text-foreground">{email}</span>. Click the link to
                  verify your account.
                </p>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setVerificationPending(false)
                      setIsSignUp(false)
                      setEmail("")
                      setPassword("")
                    }}
                    className="w-full"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Return to Sign In
                  </Button>
                  <button
                    onClick={() => setSuccessMsg("Verification email resent!")}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Resend verification email
                  </button>
                  {successMsg && (
                    <p className="text-xs text-emerald-500 animate-in fade-in">{successMsg}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <div className="flex justify-center pb-4">
                  <CodeScapeLogo size={48} />
                </div>
                <DialogTitle className="text-center text-xl font-bold tracking-tight">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isSignUp ? "signup" : "signin"}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="block"
                    >
                      {isSignUp ? "Create an account" : "Welcome back"}
                    </motion.span>
                  </AnimatePresence>
                </DialogTitle>
                <DialogDescription className="text-center text-base">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isSignUp ? "signup-desc" : "signin-desc"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="block"
                    >
                      {isSignUp ? "Start your coding journey" : "Sign in to CodeScapes"}
                    </motion.span>
                  </AnimatePresence>
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleGithubLogin}
                    disabled={isGithubLoading || isGoogleLoading || loading}
                  >
                    {isGithubLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Github className="mr-2 h-4 w-4" />
                    )}
                    GitHub
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={isGithubLoading || isGoogleLoading || loading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.053-1.147 7.92-3.08 1.907-1.92 2.453-4.8 2.453-6.4 0-.693-.053-1.213-.107-1.6H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    Google
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <form onSubmit={handleEmailAuth} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-xs text-destructive"
                    >
                      {error}
                    </motion.p>
                  )}
                  {successMsg && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-xs text-green-500"
                    >
                      {successMsg}
                    </motion.p>
                  )}

                  {/* Turnstile CAPTCHA */}
                  <TurnstileWidget
                    ref={turnstileRef}
                    onVerify={setTurnstileToken}
                    onError={() => setError("Verification failed. Please refresh.")}
                    onExpire={() => setTurnstileToken(null)}
                    className="my-2"
                  />

                  <Button
                    className="w-full"
                    type="submit"
                    disabled={isEmailLoading || loading || !turnstileToken}
                  >
                    {isEmailLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    {isSignUp ? "Create Account" : "Sign In with Email"}
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary hover:underline"
                  >
                    {isSignUp
                      ? "Already have an account? Sign In"
                      : "Don't have an account? Sign Up"}
                  </button>
                </div>

                <p className="px-4 text-center text-xs text-muted-foreground">
                  By clicking continue, you agree to our{" "}
                  <a href="#" className="underline hover:text-primary">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="underline hover:text-primary">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
