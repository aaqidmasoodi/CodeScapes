import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  setSession: (session: Session | null) => void
}

export const useAuth = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  setSession: (session) => set({ session, user: session?.user ?? null, loading: false }),
  signIn: async () => {
    // For now, trigger Github OAuth. In future, we can be flexible.
    // Redirects to current URL.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.warn("SignOut API Error (ignoring)", error)
      }
    } catch (e) {
      console.warn("SignOut Warning", e)
    } finally {
      // ALWAYS clear local state
      set({ session: null, user: null })
      localStorage.clear() // Optional: nuclear option if state persists deeply
      window.location.reload() // Hard refresh to ensure clean state
    }
  },
}))

// Initialize Listener
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuth.getState().setSession(session)
})

supabase.auth.onAuthStateChange((_event, session) => {
  useAuth.getState().setSession(session)
})
