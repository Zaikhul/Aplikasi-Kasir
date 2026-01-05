import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * API Route: Set Auth Token as HttpOnly Cookie
 * POST /api/auth/set-token
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { token } = req.body

    if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Token is required' })
    }

    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = [
        `auth_token=${token}`,
        'HttpOnly',
        isProduction ? 'Secure' : '',
        'SameSite=Lax',
        'Path=/',
        `Max-Age=${7 * 24 * 60 * 60}`,
    ].filter(Boolean).join('; ')

    res.setHeader('Set-Cookie', cookieOptions)
    return res.status(200).json({ success: true })
}
