import { create } from 'zustand'

interface User {
    id: string
    name: string
    email: string
    avatar?: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: () => Promise<void>
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: async () => {
        set({ isLoading: true })
        // Mock login delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        set({
            isLoading: false,
            isAuthenticated: true,
            user: {
                id: 'user_123',
                name: 'Demo User',
                email: 'demo@codescape.dev',
                avatar: 'https://github.com/shadcn.png'
            }
        })
    },
    logout: () => set({ user: null, isAuthenticated: false })
}))
