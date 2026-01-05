import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * API Route: Clear Auth Token Cookie
 * POST /api/auth/clear-token
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = [
        'auth_token=',
        'HttpOnly',
        isProduction ? 'Secure' : '',
        'SameSite=Lax',
        'Path=/',
        'Max-Age=0',
    ].filter(Boolean).join('; ')

    res.setHeader('Set-Cookie', cookieOptions)
    return res.status(200).json({ success: true })
}
