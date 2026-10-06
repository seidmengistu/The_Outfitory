import { useEffect, useMemo, useState } from "react"
import api from "../../lib/api"

interface AuthImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  srcPath?: string
}

// Fetches an image via the authenticated axios client and renders it as a blob URL
export default function AuthImage({ srcPath, alt = "", ...imgProps }: AuthImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  // Normalize to a backend-relative path so axios baseURL applies
  const path = useMemo(() => {
    if (!srcPath) return null
    try {
      // Absolute URL → strip origin and keep path/search
      if (/^https?:\/\//i.test(srcPath)) {
        const url = new URL(srcPath)
        return url.pathname + url.search
      }
      // If it's a bare filename (no slash), map to /file/get/<encoded>
      if (!srcPath.includes("/")) {
        const encoded = encodeURIComponent(srcPath)
        return `/file/get/${encoded}`
      }
      // Already a relative path
      return srcPath
    } catch {
      // Fallback: try as /file/get/<encoded basename>
      const base = String(srcPath).split("/").pop() || String(srcPath)
      return `/file/get/${encodeURIComponent(base)}`
    }
  }, [srcPath])

  useEffect(() => {
    let revokedUrl: string | null = null
    let cancelled = false

    async function fetchImage() {
      if (!path) {
        setBlobUrl(null)
        return
      }

      // Build minimal set of candidate paths (avoid double-encoding)
      const buildCandidates = (): string[] => {
        const candidates = new Set<string>()
        const add = (p: string | null | undefined) => { if (p) candidates.add(p) }

        const toRelative = (p: string): string => {
          if (/^https?:\/\//i.test(p)) {
            const url = new URL(p)
            return url.pathname + url.search
          }
          return p
        }

        const decodeSafe = (s: string): string => {
          try { return decodeURIComponent(s) } catch { return s }
        }

        const rel = toRelative(path)
        add(rel)

        const baseRaw = rel.split("/").pop() || ""
        const base = decodeSafe(baseRaw)
        const baseUnder = base.replace(/\s+/g, "_")
        const encBase = encodeURIComponent(base)
        const encUnder = encodeURIComponent(baseUnder)

        const prefixes = ["/file/get/", "/upload/files/"]
        for (const prefix of prefixes) {
          add(prefix + base)
          add(prefix + baseUnder)
          add(prefix + encBase)
          add(prefix + encUnder)
        }

        return Array.from(candidates)
      }

      const candidates = buildCandidates()
      let loaded = false
      for (const candidate of candidates) {
        try {
          const response = await api.get(candidate, { responseType: "blob" })
          const url = URL.createObjectURL(response.data)
          revokedUrl = url
          if (!cancelled) {
            setBlobUrl(url)
          }
          loaded = true
          break
        } catch {
          // continue
        }
      }
      if (!loaded && !cancelled) {
        setBlobUrl(null)
      }
    }

    void fetchImage()
    return () => {
      cancelled = true
      if (revokedUrl) URL.revokeObjectURL(revokedUrl)
    }
  }, [path])

  if (!blobUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs text-gray-500 dark:bg-[#170C35] dark:text-white/40">
        No Image
      </div>
    )
  }

  return <img src={blobUrl} alt={alt} {...imgProps} />
}


