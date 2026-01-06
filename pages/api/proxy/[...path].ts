import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * API Proxy Route
 * 
 * Forwards requests to the backend with the JWT auth token from the httpOnly cookie.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { path } = req.query
    const pathString = Array.isArray(path) ? path.join('/') : path || ''

    const targetUrl = `${BACKEND_URL}/${pathString}`

    const token = req.cookies.auth_token

    const headers: HeadersInit = {
        ...req.headers as Record<string, string>,
    }

    delete (headers as any).host
    delete (headers as any).connection
    delete (headers as any)['content-length']

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    try {
        const backendResponse = await fetch(targetUrl, {
            method: req.method,
            headers,

            body: req.method !== 'GET' && req.method !== 'HEAD' ? (req as any) : undefined,
            // @ts-ignore - duplex is needed for streaming bodies in some fetch implementations
            duplex: 'half',
        })

        const contentType = backendResponse.headers.get('content-type')

        res.status(backendResponse.status)

        if (contentType) {
            res.setHeader('Content-Type', contentType)
        }

        const arrayBuffer = await backendResponse.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        return res.send(buffer)

    } catch (error) {
        console.error('Proxy error:', error)
        return res.status(502).json({ error: 'Failed to reach backend server' })
    }
}
