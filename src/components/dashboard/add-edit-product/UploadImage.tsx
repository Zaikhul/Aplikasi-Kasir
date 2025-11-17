
'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import { uploadApi } from '@/lib/api/upload.api'
import { normalizeImageSrc, stripApiOrigin } from '@/lib/image'

type ProductImageUploadProps = Readonly<{
  mainImage: string
  detailedImages: string[]
  onMainImageChange: (imageUrl: string) => void
  onDetailedImagesChange: (images: string[]) => void
  error?: string
}>

export default function ProductImageUpload({
  mainImage,
  detailedImages,
  onMainImageChange,
  onDetailedImagesChange,
  error,
}: Readonly<ProductImageUploadProps>) {
  const [uploadingMain, setUploadingMain] = useState(false)
  const [uploadingDetailed, setUploadingDetailed] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const mainFileInputRef = useRef<HTMLInputElement>(null)
  const detailedFileInputRef = useRef<HTMLInputElement>(null)

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

    setUploadingMain(true)
    setUploadError('')

    try {
      const result = await uploadApi.uploadFile(file)
      const imageValue = stripApiOrigin(result.relativePath || result.url)
      onMainImageChange(imageValue)
    } catch (err: unknown) {
      console.error('Upload error:', err)
      const message =
        err instanceof Error ? err.message : 'Failed to upload image. Please try again.'
      setUploadError(message)
    } finally {
      setUploadingMain(false)
      if (mainFileInputRef.current) {
        mainFileInputRef.current.value = ''
      }
    }
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

    setUploadingDetailed(true)
    setUploadError('')

    try {
      const result = await uploadApi.uploadFile(file)
      const imageValue = stripApiOrigin(result.relativePath || result.url)
      if (!detailedImages.includes(imageValue)) {
        onDetailedImagesChange([...detailedImages, imageValue])
      }
    } catch (err: unknown) {
      console.error('Upload error:', err)
      const message =
        err instanceof Error ? err.message : 'Failed to upload image. Please try again.'
      setUploadError(message)
    } finally {
      setUploadingDetailed(false)
      if (detailedFileInputRef.current) {
        detailedFileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveDetailedImage = (index: number) => {
    onDetailedImagesChange(detailedImages.filter((_, i) => i !== index))
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
              disabled={uploadingMain}
            >
              {uploadingMain ? (
                <>
                  <SafeIcon name="Loader2" className="w-4 h-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <SafeIcon name="Upload" className="w-4 h-4 mr-2" />
                  Select from device
                </>
              )}
            </Button>
          </div>
          {(error || uploadError) && (
            <p className="text-sm text-destructive">{error || uploadError}</p>
          )}
        </div>

        {mainImage && (
          <div
            className="relative w-full max-w-xs overflow-hidden rounded-lg border bg-muted"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <Image
              src={normalizeImageSrc(mainImage)}
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
            Add more photos from your gallery or camera.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            ref={detailedFileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleDetailedImageFileChange}
            className="hidden"
            id="detailedImageFile"
            multiple={false}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => detailedFileInputRef.current?.click()}
            disabled={uploadingDetailed}
          >
            {uploadingDetailed ? (
              <>
                <SafeIcon name="Loader2" className="w-4 h-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <SafeIcon name="Upload" className="w-4 h-4 mr-2" />
                Select photo
              </>
            )}
          </Button>
        </div>

        {detailedImages.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Added Images ({detailedImages.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {detailedImages.map((image, index) => (
                <div key={`${image}-${index}`} className="relative group">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border bg-muted" style={{ borderColor: 'hsl(var(--border))' }}>
                    <Image
                      src={normalizeImageSrc(image)}
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
                  <Badge variant="secondary" className="absolute bottom-1 left-1">
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex gap-3">
          <SafeIcon name="Info" className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-1">Image security</p>
            <p>
              We automatically store a secure path for every upload and never expose the backend domain in the interface.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
