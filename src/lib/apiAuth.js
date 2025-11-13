import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

/**
 * Protected API Route Wrapper
 * 
 * Validates user session and returns standardized error response if unauthorized.
 * Use this to wrap your API route handlers for automatic auth protection.
 * 
 * @param {Request} request - Next.js request object
 * @param {Object} options - Configuration options
 * @param {string[]} options.requiredRoles - Array of allowed roles (e.g., ['admin', 'user'])
 * @returns {Promise<Object|NextResponse>} Session object or error response
 */
export async function requireAuth(request, options = {}) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is authenticated
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized: Please login to access this resource' },
                { status: 401 }
            );
        }

        // Check if user has required role (if specified)
        if (options.requiredRoles && options.requiredRoles.length > 0) {
            if (!options.requiredRoles.includes(session.user.role)) {
                return NextResponse.json(
                    { 
                        error: 'Forbidden: You do not have permission to access this resource',
                        requiredRoles: options.requiredRoles,
                        userRole: session.user.role,
                    },
                    { status: 403 }
                );
            }
        }

        // Return session if all checks pass
        return session;
    } catch (error) {
        console.error('Authentication error:', error);
        return NextResponse.json(
            { error: 'Internal server error: Authentication failed' },
            { status: 500 }
        );
    }
}

/**
 * Role-based protection wrapper
 * 
 * Example:
 * const adminOnly = async (handler) => requireAuth(request, { requiredRoles: ['admin'] });
 */
export function createRoleProtection(roles) {
    return (request) => requireAuth(request, { requiredRoles: roles });
}
