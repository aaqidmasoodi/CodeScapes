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
        redirectTo: window.location.origin + "/dashboard",
      },
    })
    if (error) throw error
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ session: null, user: null })
  },
}))

// Initialize Listener
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuth.getState().setSession(session)
})

supabase.auth.onAuthStateChange((_event, session) => {
  useAuth.getState().setSession(session)
})
