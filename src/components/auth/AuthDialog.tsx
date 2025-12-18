import { useState } from "react"
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

export function AuthDialog({ children }: { children: React.ReactNode }) {
  const { signIn, loading } = useAuth()
  const [isGithubLoading, setIsGithubLoading] = useState(false)

  const handleGithubLogin = async () => {
    try {
      setIsGithubLoading(true)
      await signIn()
    } catch (error) {
      console.error("Login failed", error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Welcome back</DialogTitle>
          <DialogDescription className="text-center">
            Sign in to your CodeScapes account
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button
            className="w-full"
            variant="outline"
            onClick={handleGithubLogin}
            disabled={isGithubLoading || loading}
          >
            {isGithubLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Github className="mr-2 h-4 w-4" />
            )}
            Continue with GitHub
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" disabled />
          </div>

          <Button className="w-full" disabled>
            <Mail className="mr-2 h-4 w-4" />
            Sign In with Email
          </Button>

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
