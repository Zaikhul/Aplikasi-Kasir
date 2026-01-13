'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
    children: ReactNode;
}

/**
 * ProtectedRoute Component
 * Wraps components that require authentication
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth(true);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect to login via useAuth hook
    }

    return <>{children}</>;
}
