import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode } from "react"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale-while-revalidate: Show cached data immediately, refetch in background
      staleTime: 2 * 60 * 1000, // 2 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on tab focus
      retry: 1, // Only retry once on failure
    },
  },
})

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
