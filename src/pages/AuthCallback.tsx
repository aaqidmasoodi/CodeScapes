import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Loader2 } from "lucide-react"

export default function AuthCallback() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    // If user is already detected (Supabase client processed the session), redirect.
    if (user) {
      navigate("/dashboard/local", { replace: true })
    } else {
      // Setup a timeout or listener?
      // Actually, useAuth listener runs globally.
      // We just wait for 'user' to become truthy.
      // But what if auth FAILS?
      // We should probably have a timeout to redirect to home if nothing happens.
      const timer = setTimeout(() => {
        // Fallback: If no user after 3s, maybe just go dashboard and let it handle "Not Logged In"
        navigate("/dashboard/local", { replace: true })
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [user, navigate])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Completing secure sign-in...</p>
    </div>
  )
}
