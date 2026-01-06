import type { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'stream'

/**
 * API Proxy Route
 * 
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

export const config = {
    api: {
        bodyParser: false,
    },
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    return Buffer.concat(chunks)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (!BACKEND_URL) {
        console.error('[Proxy] NEXT_PUBLIC_API_URL is not defined')
        return res.status(500).json({ error: 'Server configuration error' })
    }

    const { path, ...queryParams } = req.query
    const pathString = Array.isArray(path) ? path.join('/') : path || ''

    // Build URL with query parameters
    const url = new URL(`/${pathString}`, BACKEND_URL)
    Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined) {
            if (Array.isArray(value)) {
                value.forEach(v => url.searchParams.append(key, v))
            } else {
                url.searchParams.append(key, value)
            }
        }
    })
    const targetUrl = url.toString()

    const token = req.cookies.auth_token
    const contentType = req.headers['content-type'] || ''
    const isMultipart = contentType.includes('multipart/form-data')

    const headers: HeadersInit = {}

    if (contentType) {
        headers['Content-Type'] = contentType
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    try {
        let body: Buffer | string | undefined

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            const rawBody = await streamToBuffer(req)

            if (isMultipart) {
                body = rawBody
            } else if (rawBody.length > 0) {
                body = rawBody.toString('utf-8')
            }
        }

        const backendResponse = await fetch(targetUrl, {
            method: req.method,
            headers,
            body: body as any,
        })

        const responseContentType = backendResponse.headers.get('content-type')

        res.status(backendResponse.status)

        if (responseContentType) {
            res.setHeader('Content-Type', responseContentType)
        }

        const arrayBuffer = await backendResponse.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        return res.send(buffer)

    } catch (error) {
        console.error('Proxy error:', error)
        return res.status(502).json({ error: 'Failed to reach backend server' })
    }
}
