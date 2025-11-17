'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import { normalizeImageSrc } from '@/lib/image'

interface ProductGalleryProps {
  mainImage: string
  detailedImages?: string[]
  productName: string
}

export default function ProductGallery({
  mainImage,
  detailedImages = [],
  productName,
}: ProductGalleryProps) {
  const images = useMemo(() => {
    const normalized = [mainImage, ...detailedImages].map((img) =>
      normalizeImageSrc(img),
    )
    return Array.from(new Set(normalized))
  }, [mainImage, detailedImages])

  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedImage = images[selectedIndex] ?? null

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (images.length === 0) return
    const offset = direction === 'prev' ? -1 : 1
    const nextIndex = (selectedIndex + offset + images.length) % images.length
    setSelectedIndex(nextIndex)
  }

  if (!selectedImage) {
    return (
      <Card className="flex h-96 items-center justify-center bg-muted text-sm text-muted-foreground">
        No image available
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="group relative flex aspect-square items-center justify-center overflow-hidden bg-muted">
        <Image
          src={selectedImage}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 66vw"
          className="object-cover"
          priority={false}
        />

        {images.length > 1 && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => handleNavigate('prev')}
            >
              <SafeIcon name="ChevronLeft" className="h-6 w-6" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => handleNavigate('next')}
            >
              <SafeIcon name="ChevronRight" className="h-6 w-6" />
            </Button>
          </>
        )}
      </Card>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image || index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                selectedIndex === index
                  ? 'border-primary'
                  : 'border-border hover:border-primary/60'
              }`}
            >
              <Image
                src={image}
                alt={`${productName} view ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

