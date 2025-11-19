'use client'

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import DashboardLayout from '@/components/dashboard/common/Dashboard-Layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ShieldCheck, LogOut, Save, UserRound } from 'lucide-react'
import { authApi } from '@/lib/api/auth.api'
import { resetAuthCache, useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/router'
import PrinterSettings from '@/components/settings/PrinterSettings'

type FormState = {
  name: string
  businessName: string
  address: string
  phone: string
  taxId: string
}

type StatusState =
  | { type: 'success' | 'error'; message: string }
  | null

const defaultFormState: FormState = {
  name: '',
  businessName: '',
  address: '',
  phone: '',
  taxId: '',
}

export default function UserProfilePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth(false)
  const [formState, setFormState] = useState<FormState>(defaultFormState)
  const [status, setStatus] = useState<StatusState>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setFormState({
        name: user.name || '',
        businessName: user.businessInfo?.businessName || '',
        address: user.businessInfo?.address || '',
        phone: user.businessInfo?.phone || '',
        taxId: user.businessInfo?.taxId || '',
      })
    }
  }, [user])

  const lastUpdated = useMemo(() => {
    if (!user?.updatedAt) return null
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(user.updatedAt))
    } catch {
      return user.updatedAt
    }
  }, [user?.updatedAt])

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    setSaving(true)

    try {
      const payload = { ...formState }
      const updatedUser = await authApi.updateProfile(payload)
      resetAuthCache(updatedUser)
      setFormState({
        name: updatedUser.name || '',
        businessName: updatedUser.businessInfo?.businessName || '',
        address: updatedUser.businessInfo?.address || '',
        phone: updatedUser.businessInfo?.phone || '',
        taxId: updatedUser.businessInfo?.taxId || '',
      })
      setStatus({
        type: 'success',
        message: 'Profile updated successfully.',
      })
    } catch (error: any) {
      console.error('Failed to update profile', error)
      setStatus({
        type: 'error',
        message: error?.message || 'Failed to update profile. Please try again.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    authApi.logout()
    resetAuthCache()
    router.replace('/auth/login')
  }

  if (isLoading && !user) {
    return (
      <DashboardLayout>
        <div className="px-6 py-10 text-sm text-muted-foreground">
          Loading profile...
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout headerPlaceholder="Search profile settings">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <ShieldCheck className="h-4 w-4" />
            <span>
              Verified login: <strong>{user?.email ?? 'Loading...'}</strong>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Account & Profile
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Manage your personal information, business details, and session
            security from a single view.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile settings</CardTitle>
              <CardDescription>
                Update your display name and business identity seen across the
                cashier experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status && (
                <div
                  className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                    status.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-rose-200 bg-rose-50 text-rose-900'
                  }`}
                >
                  {status.message}
                </div>
              )}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    required
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business name</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={formState.businessName}
                      onChange={handleChange}
                      placeholder="FoodDash Cafe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Business phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      placeholder="+62 812 3456 7890"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={formState.address}
                    onChange={handleChange}
                    placeholder="Street, city, province"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / NPWP</Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    value={formState.taxId}
                    onChange={handleChange}
                    placeholder="99.999.999.9-999.999"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Changes are verified via your authenticated session.
                  </p>
                  <Button type="submit" disabled={saving || isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  Account summary
                </CardTitle>
                <CardDescription>
                  Details taken directly from the verified login token.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Signed in as
                  </p>
                  <p className="text-lg font-semibold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Role
                    </p>
                    <p className="font-medium">{user?.role ?? 'user'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Plan
                    </p>
                    <p className="font-medium">
                      {user?.subscription?.plan ?? 'free'}
                    </p>
                  </div>
                </div>
                {lastUpdated && (
                  <p className="text-xs text-muted-foreground">
                    Last updated {lastUpdated}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session controls</CardTitle>
                <CardDescription>
                  Log out securely from this device.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Printer Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle>Printer Configuration</CardTitle>
            <CardDescription>
              Connect and manage your Bluetooth or USB printers for receipt printing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrinterSettings />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


