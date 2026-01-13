import ProtectedRoute from '@/pages/auth/ProtectedRoute';
import UserProfilePage from '@/pages/profile/UserProfilePage';

export default function UserProfile() {
    return (
        <ProtectedRoute>
            <UserProfilePage />
        </ProtectedRoute>
    );
}
