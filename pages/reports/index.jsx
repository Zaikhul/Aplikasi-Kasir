import SalesChart from '@/pages/reports/SalesChart';
import ProtectedRoute from '@/pages/auth/ProtectedRoute';

export default function Reports() {
  return (
    <ProtectedRoute>
      <SalesChart />
    </ProtectedRoute>
  );
}