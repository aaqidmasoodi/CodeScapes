/**
 * Thumbnail Service
 *
 * Compresses and uploads thumbnails to Supabase Storage,
 * returning a public URL instead of storing large base64 data in the database.
 */

import { supabase } from "@/lib/supabase"

const THUMBNAIL_MAX_WIDTH = 300
const THUMBNAIL_QUALITY = 0.7

/**
 * Converts a data URL to a Blob.
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",")
  const mimeMatch = header.match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg"
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }
  return new Blob([array], { type: mime })
}

/**
 * Compresses an image data URL by resizing and converting to JPEG.
 * Returns a compressed Blob.
 */
async function compressImage(dataUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // Calculate new dimensions (maintain aspect ratio)
      let width = img.width
      let height = img.height

      if (width > THUMBNAIL_MAX_WIDTH) {
        height = Math.round((height * THUMBNAIL_MAX_WIDTH) / width)
        width = THUMBNAIL_MAX_WIDTH
      }

      // Draw to canvas
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("Failed to get canvas context"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Convert to JPEG blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to create blob"))
          }
        },
        "image/jpeg",
        THUMBNAIL_QUALITY
      )
    }

    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = dataUrl
  })
}

/**
 * Uploads a thumbnail to Supabase Storage and returns the public URL.
 *
 * @param scapeId - The ID of the scape (used for naming)
 * @param dataUrl - The raw data URL from the capture
 * @returns The public URL of the uploaded thumbnail
 */
export async function uploadThumbnail(scapeId: string, dataUrl: string): Promise<string> {
  // 1. Compress the image
  let blob: Blob
  try {
    blob = await compressImage(dataUrl)
  } catch (e) {
    console.warn("[Thumbnail] Compression failed, using original:", e)
    blob = dataUrlToBlob(dataUrl)
  }

  // 2. Upload to Supabase Storage
  const path = `thumbnails/${scapeId}.jpg`

  const { error } = await supabase.storage.from("scape-assets").upload(path, blob, {
    upsert: true,
    contentType: "image/jpeg",
  })

  if (error) {
    console.error("[Thumbnail] Upload failed:", error)
    throw error
  }

  // 3. Get public URL
  const { data } = supabase.storage.from("scape-assets").getPublicUrl(path)

  // Add cache buster to force refresh on subsequent saves
  return `${data.publicUrl}?v=${Date.now()}`
}

/**
 * Checks if a thumbnail value is a URL (new format) or base64 (legacy).
 */
export function isThumbnailUrl(thumbnail: string | undefined | null): boolean {
  if (!thumbnail) return false
  return thumbnail.startsWith("http://") || thumbnail.startsWith("https://")
}
