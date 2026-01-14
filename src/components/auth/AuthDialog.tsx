import { useState, useEffect } from "react"
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
import { Github, Loader2, Mail } from "lucide-react"
import { TurnstileWidget } from "@/components/auth/TurnstileWidget"

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
          setError("Bot verification failed. Please try again.")
          setTurnstileToken(null)
          return
        }
      }

      if (isSignUp) {
        await signUpWithEmail(email, password)
        setSuccessMsg("Account created! Check email.")
        setIsSignUp(false)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error(err)
      setError(error.message || "Authentication failed")
    } finally {
      setIsEmailLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Welcome back</DialogTitle>
          <DialogDescription className="text-center">
            {isSignUp ? "Create an account" : "Sign in to CodeScapes"}
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
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
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

            {error && <p className="text-xs text-destructive">{error}</p>}
            {successMsg && <p className="text-xs text-green-500">{successMsg}</p>}

            {/* Turnstile CAPTCHA */}
            <TurnstileWidget
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
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline">
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
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
      </DialogContent>
    </Dialog>
  )
}
