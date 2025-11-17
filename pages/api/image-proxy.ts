import type { NextApiRequest, NextApiResponse } from 'next'
import {
  buildAllowedHostSet,
  parseHostList,
} from '../../src/lib/image-hosts'

const allowedHostSet = buildAllowedHostSet(
  parseHostList(
    process.env.IMAGE_PROXY_ALLOWED_HOSTS ??
      process.env.NEXT_PUBLIC_IMAGE_PROXY_HOSTS,
  ),
)

function isHostAllowed(hostname: string): boolean {
  if (!hostname) {
    return false
  }
  return allowedHostSet.has(hostname.toLowerCase())
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { src } = req.query
  if (typeof src !== 'string' || src.trim().length === 0) {
    return res.status(400).json({ error: 'Missing src query parameter' })
  }

  let targetUrl: URL
  try {
    const decodedUrl = decodeURIComponent(src)
    targetUrl = new URL(decodedUrl)
  } catch {
    return res.status(400).json({ error: 'Invalid src query parameter' })
  }

  if (!isHostAllowed(targetUrl.hostname)) {
    return res.status(403).json({ error: 'Host not allowed' })
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      headers: {
        Accept:
          'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    })

    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .json({ error: 'Failed to fetch image' })
    }

    const arrayBuffer = await upstream.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    res.setHeader(
      'Content-Type',
      upstream.headers.get('content-type') || 'application/octet-stream',
    )
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable')
    res.setHeader('Content-Length', buffer.length.toString())
    res.setHeader('X-Image-Proxy', '1')

    return res.status(200).send(buffer)
  } catch (error) {
    console.error('Image proxy error:', error)
    return res.status(502).json({ error: 'Failed to proxy image' })
  }
}

