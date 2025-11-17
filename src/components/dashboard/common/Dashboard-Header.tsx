'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import SafeIcon from '@/components/dashboard/common/SafeIcon'

interface DashboardHeaderProps {
  onSearch?: (query: string) => void
  placeholder?: string
}

export default function DashboardHeader({ 
  onSearch, 
  placeholder = 'Search products...' 
}: DashboardHeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery)
      } else {
        router.push(`/search-results?q=${encodeURIComponent(searchQuery)}`)
      }
    }
  }

  useEffect(() => {
    const query = router.query.q as string | undefined
    if (query) {
      setSearchQuery(query)
    }
  }, [router.query.q])

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
        <div className="relative">
          <SafeIcon 
            name="Search" 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" 
          />
          <Input
            type="search"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
      </form>

      <Button variant="ghost" size="icon" className="hidden md:flex">
        <SafeIcon name="Bell" className="w-5 h-5" />
      </Button>
    </header>
  )
}
