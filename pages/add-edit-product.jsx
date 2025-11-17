import Head from 'next/head'
import DashboardLayout from '@/components/dashboard/common/Dashboard-Layout'
import AddEditProductForm from '@/components/dashboard/add-edit-product/FormProduct'
import ProtectedRoute from '@/pages/auth/ProtectedRoute'

export default function AddEditProduct() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Add/Edit Product - FoodDash</title>
      </Head>
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4 md:px-6">
          <AddEditProductForm />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

