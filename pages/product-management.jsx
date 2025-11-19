import Head from 'next/head'
import DashboardLayout from '@/components/dashboard/common/Dashboard-Layout'
import ProductManagementContent from '@/components/dashboard/product-management/ProductManagementContent'
import ProtectedRoute from '@/pages/auth/ProtectedRoute'

export default function ProductManagement() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Product Management - Kasir Pintar</title>
      </Head>
      <DashboardLayout headerPlaceholder="Search products...">
        <ProductManagementContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

