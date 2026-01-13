import ProtectedRoute from '@/pages/auth/ProtectedRoute';
import SalesChart from '@/pages/reports/SalesChart';

export default function Reports() {
    return (
        <ProtectedRoute>
            <SalesChart />
        </ProtectedRoute>
    );
}
