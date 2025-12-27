import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function optimizeSupabaseImage(
  url: string | undefined | null,
  width: number,
  height?: number,
  quality = 80
) {
  if (!url) return undefined
  // Only optimize Supabase Storage URLs
  if (!url.includes("/storage/v1/object/public/")) return url

  const optimizedUrl = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/")
  const params = new URLSearchParams()
  params.set("width", width.toString())
  if (height) params.set("height", height.toString())
  params.set("quality", quality.toString())
  params.set("resize", "cover")

  return `${optimizedUrl}?${params.toString()}`
}
