import { useInfiniteQuery } from "@tanstack/react-query"
import { CloudRepository } from "@/lib/repositories/CloudRepository"
import { type Scape } from "@/lib/db"

const repo = new CloudRepository()

type FilterType = "all" | "web" | "python" | "flow"

interface UseCommunityScapesOptions {
  filter?: FilterType
  enabled?: boolean
}

export function useCommunityScapes({
  filter = "all",
  enabled = true,
}: UseCommunityScapesOptions = {}) {
  const filterValue = filter === "all" ? undefined : filter

  const query = useInfiniteQuery({
    queryKey: ["communityScapes", filter],
    queryFn: async ({ pageParam = 0 }) => {
      return repo.getPublicScapesPaginated(filterValue, pageParam, 24)
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined
      return allPages.length // Next page number
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    enabled,
  })

  // Flatten all pages into a single array of scapes
  const scapes: Scape[] = query.data?.pages.flatMap((page) => page.data) || []

  return {
    scapes,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    refetch: query.refetch,
  }
}
