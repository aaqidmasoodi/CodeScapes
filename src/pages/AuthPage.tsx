import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Github, Loader2, Mail, Sparkles } from "lucide-react"
import { CodeScapeLogo } from "@/components/brand/Logo"

export default function AuthPage() {
  const navigate = useNavigate()
  const { signInWithGithub, signInWithGoogle, signInWithEmail, signUpWithEmail, loading, user } =
    useAuth()
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  // Email Auth State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleGithubLogin = async () => {
    try {
      setIsGithubLoading(true)
      await signInWithGithub()
    } catch (error) {
      console.error("Login failed", error)
    } finally {
      // setIsGithubLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      await signInWithGoogle()
    } catch (error) {
      console.error("Login failed", error)
    } finally {
      // setIsGoogleLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setError(null)
    setSuccessMsg(null)
    setIsEmailLoading(true)

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password)
        setSuccessMsg("Account created! Please check your email to confirm.")
        setIsSignUp(false) // Switch back to login
      } else {
        await signInWithEmail(email, password)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error)
      setError(error.message || "Authentication failed")
    } finally {
      setIsEmailLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-background p-4">
      {/* Animated Background Elements */}
      <div className="absolute -left-[15%] -top-[25%] h-[600px] w-[600px] animate-pulse rounded-full bg-emerald-500/10 blur-[150px]" />
      <div className="absolute -bottom-[25%] -right-[15%] h-[600px] w-[600px] animate-pulse rounded-full bg-blue-500/10 blur-[150px]" />
      <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 animate-pulse rounded-full bg-primary/5 blur-[100px]" />

      {/* Floating decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[10%] top-[15%] h-2 w-2 animate-bounce rounded-full bg-emerald-400/40"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        />
        <div
          className="absolute right-[15%] top-[25%] h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400/40"
          style={{ animationDelay: "0.5s", animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-[20%] left-[20%] h-1 w-1 animate-bounce rounded-full bg-primary/30"
          style={{ animationDelay: "1s", animationDuration: "3.5s" }}
        />
        <div
          className="absolute bottom-[30%] right-[10%] h-2 w-2 animate-bounce rounded-full bg-emerald-300/30"
          style={{ animationDelay: "1.5s", animationDuration: "4.5s" }}
        />
      </div>

      {/* Main Card */}
      <Card className="z-10 w-full max-w-md border-border/40 bg-card/80 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-4 pb-6 text-center">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/10 blur-xl" />
              <CodeScapeLogo size={64} className="relative" />
            </div>
          </div>

          {/* Tagline */}
          <CardDescription className="flex items-center justify-center gap-1.5 text-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {isSignUp ? "Create your account to start coding" : "Sign in to continue your journey"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleGithubLogin}
              disabled={isGithubLoading || isGoogleLoading || loading}
              className="h-11 border-border/60 bg-background/50 transition-all hover:border-primary/50 hover:bg-primary/5"
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
              className="h-11 border-border/60 bg-background/50 transition-all hover:border-primary/50 hover:bg-primary/5"
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

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground/70">Or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-border/60 bg-background/50 transition-all focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11 border-border/60 bg-background/50 transition-all focus:border-primary/50"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-500">
                {successMsg}
              </div>
            )}

            <Button
              className="h-11 w-full bg-primary text-primary-foreground transition-all hover:bg-primary/90"
              type="submit"
              disabled={isEmailLoading || loading}
            >
              {isEmailLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-2 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {isSignUp ? (
              <>
                Already have an account? <span className="font-medium text-primary">Sign In</span>
              </>
            ) : (
              <>
                Don't have an account? <span className="font-medium text-primary">Sign Up</span>
              </>
            )}
          </button>
          <div className="text-xs text-muted-foreground/60">
            By continuing, you agree to our{" "}
            <a href="#" className="underline transition-colors hover:text-primary">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="underline transition-colors hover:text-primary">
              Privacy Policy
            </a>
            .
          </div>
        </CardFooter>
      </Card>

      {/* Bottom branding */}
      <p className="z-10 mt-8 text-xs text-muted-foreground/50">
        © {new Date().getFullYear()} CodeScapes. All rights reserved.
      </p>
    </div>
  )
}
