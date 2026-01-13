'use client'

import Image from 'next/image'
import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import { normalizeImageSrc } from '@/lib/image'
import { compressImage } from '@/lib/image-compression'

/**
 * Represents either a local file (pending upload) or an already-uploaded URL
 */
export type ImageItem =
  | { type: 'file'; file: File; previewUrl: string }
  | { type: 'url'; url: string }

type ProductImageUploadProps = Readonly<{
  /** Already-uploaded main image URL (for edit mode) */
  mainImageUrl: string
  /** Local file selected for main image (pending upload) */
  mainImageFile: File | null
  /** Array of already-uploaded URLs and local files */
  detailedImages: ImageItem[]
  /** Callback when main image file is selected/cleared */
  onMainImageFileChange: (file: File | null) => void
  /** Callback when detailed images change */
  onDetailedImagesChange: (images: ImageItem[]) => void
  /** Form validation error */
  error?: string
}>

export default function ProductImageUpload({
  mainImageUrl,
  mainImageFile,
  detailedImages,
  onMainImageFileChange,
  onDetailedImagesChange,
  error,
}: Readonly<ProductImageUploadProps>) {
  const [uploadError, setUploadError] = useState('')
  const [processingMain, setProcessingMain] = useState(false)
  const [processingDetailed, setProcessingDetailed] = useState(false)
  const mainFileInputRef = useRef<HTMLInputElement>(null)
  const detailedFileInputRef = useRef<HTMLInputElement>(null)

  // Create blob URL for main image file preview
  const mainPreviewUrl = useMemo(() => {
    if (mainImageFile) {
      return URL.createObjectURL(mainImageFile)
    }
    return null
  }, [mainImageFile])

  // Cleanup blob URL on unmount or when file changes
  useEffect(() => {
    return () => {
      if (mainPreviewUrl) {
        URL.revokeObjectURL(mainPreviewUrl)
      }
    }
  }, [mainPreviewUrl])

  // Determine what to show for main image
  const mainImageDisplay = mainPreviewUrl || (mainImageUrl ? normalizeImageSrc(mainImageUrl) : null)

  const handleMainImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB')
      return
    }

    setProcessingMain(true)
    setUploadError('')

    try {
      // Compress image (but don't upload yet)
      const compressedFile = await compressImage(file)
      onMainImageFileChange(compressedFile)
    } catch (err: unknown) {
      console.error('Compression error:', err)
      const message = err instanceof Error ? err.message : 'Failed to process image'
      setUploadError(message)
    } finally {
      setProcessingMain(false)
      if (mainFileInputRef.current) {
        mainFileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveMainImage = () => {
    onMainImageFileChange(null)
  }

  const handleDetailedImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB')
      return
    }

    setProcessingDetailed(true)
    setUploadError('')

    try {
      // Compress image (but don't upload yet)
      const compressedFile = await compressImage(file)
      const previewUrl = URL.createObjectURL(compressedFile)

      onDetailedImagesChange([
        ...detailedImages,
        { type: 'file', file: compressedFile, previewUrl }
      ])
    } catch (err: unknown) {
      console.error('Compression error:', err)
      const message = err instanceof Error ? err.message : 'Failed to process image'
      setUploadError(message)
    } finally {
      setProcessingDetailed(false)
      if (detailedFileInputRef.current) {
        detailedFileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveDetailedImage = (index: number) => {
    const removed = detailedImages[index]
    // Cleanup blob URL if it's a local file
    if (removed.type === 'file') {
      URL.revokeObjectURL(removed.previewUrl)
    }
    onDetailedImagesChange(detailedImages.filter((_, i) => i !== index))
  }

  const getDetailedImageSrc = (item: ImageItem): string => {
    if (item.type === 'file') {
      return item.previewUrl
    }
    return normalizeImageSrc(item.url)
  }

  return (
    <div className="space-y-6">
      {/* Main Image */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="mainImageFile">Main Product Image *</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Select a photo from your device.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              ref={mainFileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleMainImageFileChange}
              className="hidden"
              id="mainImageFile"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => mainFileInputRef.current?.click()}
              disabled={processingMain}
            >
              {processingMain ? (
                <>
                  <SafeIcon name="Loader2" className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <SafeIcon name="Upload" className="w-4 h-4 mr-2" />
                  Select from device
                </>
              )}
            </Button>
            {(mainImageFile || mainImageUrl) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemoveMainImage}
              >
                <SafeIcon name="X" className="w-4 h-4" />
              </Button>
            )}
          </div>
          {(error || uploadError) && (
            <p className="text-sm text-destructive">{error || uploadError}</p>
          )}
          {mainImageFile && (
            <Badge variant="secondary" className="text-xs">
              <SafeIcon name="Clock" className="w-3 h-3 mr-1" />
              Pending upload
            </Badge>
          )}
        </div>

        {mainImageDisplay && (
          <div
            className="relative w-full max-w-xs aspect-square overflow-hidden rounded-lg border bg-muted"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <Image
              src={mainImageDisplay}
              alt="Main product"
              fill
              sizes="240px"
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Detailed Images */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="detailedImageFile">Additional Product Images</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Add more photos.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            ref={detailedFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleDetailedImageFileChange}
            className="hidden"
            id="detailedImageFile"
            multiple={false}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => detailedFileInputRef.current?.click()}
            disabled={processingDetailed}
          >
            {processingDetailed ? (
              <>
                <SafeIcon name="Loader2" className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <SafeIcon name="Upload" className="w-4 h-4 mr-2" />
                Add photo
              </>
            )}
          </Button>
        </div>

        {detailedImages.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Added Images ({detailedImages.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {detailedImages.map((item, index) => (
                <div key={`img-${index}`} className="relative group">
                  <div
                    className="relative w-full aspect-square rounded-lg overflow-hidden border bg-muted"
                    style={{ borderColor: 'hsl(var(--border))' }}
                  >
                    <Image
                      src={getDetailedImageSrc(item)}
                      alt={`Product detail ${index + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveDetailedImage(index)}
                  >
                    <SafeIcon name="X" className="w-4 h-4" />
                  </Button>
                  {item.type === 'file' ? (
                    <Badge variant="secondary" className="absolute bottom-1 left-1 text-xs">
                      <SafeIcon name="Clock" className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="absolute bottom-1 left-1">
                      #{index + 1}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
