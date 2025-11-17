import { buildAllowedHostSet, parseHostList } from './image-hosts'

const FALLBACK_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f4f4f5"/%3E%3Ctext x="50%25" y="50%25" dy=".3em" font-size="18" text-anchor="middle" fill="%23909090"%3ENo Image%3C/text%3E%3C/svg%3E'

const apiBase =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''

const proxyableHostSet = buildAllowedHostSet(
  parseHostList(process.env.NEXT_PUBLIC_IMAGE_PROXY_HOSTS),
)

function buildProxyUrl(target: URL): string {
  return `/api/image-proxy?src=${encodeURIComponent(target.toString())}`
}

function ensureLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

function resolvePort(url: URL): string {
  if (url.port) {
    return url.port
  }

  return url.protocol === 'https:' ? '443' : '80'
}

/**
 * Removes the configured API origin (localhost/backend URL) from an image path.
 * Ensures relative paths are stored and displayed without revealing the host.
 */
export function stripApiOrigin(src?: string | null): string {
  if (!src) {
    return ''
  }

  const trimmed = src.trim()
  if (!trimmed) {
    return ''
  }

  if (!apiBase) {
    return trimmed
  }

  if (trimmed.startsWith(apiBase)) {
    const relative = trimmed.slice(apiBase.length)
    return ensureLeadingSlash(relative)
  }

  try {
    const parsedSrc = new URL(trimmed)
    const parsedApi = new URL(apiBase)

    if (
      parsedSrc.hostname === parsedApi.hostname &&
      resolvePort(parsedSrc) === resolvePort(parsedApi)
    ) {
      return ensureLeadingSlash(
        `${parsedSrc.pathname}${parsedSrc.search}${parsedSrc.hash}`,
      )
    }
  } catch {
    // not an absolute URL, return as-is
  }

  return trimmed
}

/**
 * Normalizes image source URLs to work with Next.js Image component
 * - Converts absolute API URLs to relative paths
 * - Preserves relative paths as-is
 * - Proxies approved external hosts through a local endpoint
 * - Returns fallback for empty/null values
 */
export function normalizeImageSrc(src?: string | null): string {
  const stripped = stripApiOrigin(src)

  if (!stripped || stripped.trim() === '') {
    return FALLBACK_IMAGE
  }

  const value = stripped

  // Already a relative path - use as-is
  if (value.startsWith('/')) {
    return value
  }

  // Data URI - use as-is
  if (value.startsWith('data:')) {
    return value
  }

  // Try to parse as URL
  try {
    const url = new URL(value)
    
    const hostname = url.hostname.toLowerCase()
    if (proxyableHostSet.has(hostname)) {
      return buildProxyUrl(url)
    }

    // External URL - return as-is (must be in next.config.ts remotePatterns)
    return value
  } catch {
    // Not a valid URL - might be a relative path without leading slash
    // or some other format - return as-is
    return value
  }
}

export function getFallbackImage(): string {
  return FALLBACK_IMAGE
}


