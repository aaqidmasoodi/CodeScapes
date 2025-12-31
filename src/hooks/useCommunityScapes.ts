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
    queryFn: async (context) => {
      const page = context.pageParam ?? 0
      return repo.getPublicScapesPaginated(filterValue, page, 24)
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage.hasMore) return undefined
      return (lastPageParam ?? 0) + 1
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    enabled,
  })

  // Flatten all pages into a single array of scapes
  const scapes: Scape[] = query.data?.pages?.flatMap((page) => page.data) ?? []

  return {
    scapes,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    refetch: query.refetch,
  }
}
