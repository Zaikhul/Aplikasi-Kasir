import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, requiredRole }) {
const { data: session, status } = useSession();
const router = useRouter();

useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
        router.push('/login');
        return;
    }

    if (requiredRole && session.user.role !== requiredRole) {
        router.push('/dashboard');
    }
}, [session, status, router, requiredRole]);

if (status === 'loading') {
    return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
    </div>
    );
}

if (!session) {
    return null;
}

if (requiredRole && session.user.role !== requiredRole) {
    return null;
}

return children;

}