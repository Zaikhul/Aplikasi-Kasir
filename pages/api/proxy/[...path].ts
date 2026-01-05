import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * API Proxy Route
 * 
 * Forwards requests to the backend with the JWT auth token from the httpOnly cookie.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { path } = req.query
    const pathString = Array.isArray(path) ? path.join('/') : path || ''

    const targetUrl = `${BACKEND_URL}/${pathString}`

    const token = req.cookies.auth_token

    const headers: HeadersInit = {
        'Content-Type': req.headers['content-type'] || 'application/json',
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    try {
        const backendResponse = await fetch(targetUrl, {
            method: req.method,
            headers,
            body: req.method !== 'GET' && req.method !== 'HEAD'
                ? JSON.stringify(req.body)
                : undefined,
        })

        const contentType = backendResponse.headers.get('content-type')

        res.status(backendResponse.status)

        if (contentType) {
            res.setHeader('Content-Type', contentType)
        }

        if (contentType?.includes('application/json')) {
            const data = await backendResponse.json()
            return res.json(data)
        } else {
            const text = await backendResponse.text()
            return res.send(text)
        }
    } catch (error) {
        console.error('Proxy error:', error)
        return res.status(502).json({ error: 'Failed to reach backend server' })
    }
}
