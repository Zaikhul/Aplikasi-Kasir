'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import ProductImageUpload, { type ImageItem } from '@/components/dashboard/add-edit-product/UploadImage'
import type { ProductCategory } from '@/data/products'
import { productsApi } from '@/lib/api/products.api'
import { uploadApi } from '@/lib/api/upload.api'
import { stripApiOrigin } from '@/lib/image'

interface ProductPayload {
  name: string
  description: string
  price: number
  category: ProductCategory
  inventory: number
  sku: string
  imageUrl: string
  detailedImages: Array<{ url: string }>
}

interface FormData {
  name: string
  description: string
  price: number
  category: ProductCategory
  inventory: number
  sku: string
  imageUrl: string
}

const CATEGORIES: ProductCategory[] = ['Mains', 'Desserts', 'Drinks', 'Appetizers']

const DEFAULT_FORM_DATA: FormData = {
  name: '',
  description: '',
  price: 0,
  category: 'Mains',
  inventory: 0,
  sku: '',
  imageUrl: '',
}

export default function AddEditProductForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA)
  const [isEditMode, setIsEditMode] = useState(false)
  const [productId, setProductId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Deferred upload state: files are stored locally until form submission
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [detailedImages, setDetailedImages] = useState<ImageItem[]>([])

  // Initialize form with product data if editing
  useEffect(() => {
    const loadProduct = async () => {
      const id = router.query.id as string | undefined
      if (!id) return

      try {
        const product = await productsApi.getById(id)
        if (product) {
          setProductId(id)
          setIsEditMode(true)

          type UrlImageItem = { type: 'url'; url: string }
          const existingDetailedImages: UrlImageItem[] = (product.detailedImages || [])
            .map((img: string | { url: string }) => ({
              type: 'url' as const,
              url: typeof img === 'string' ? stripApiOrigin(img) : stripApiOrigin(img.url),
            }))
            .filter((item): item is UrlImageItem => item.url.trim().length > 0)

          const uniqueUrls = new Set<string>()
          const uniqueDetailedImages: ImageItem[] = []
          for (const item of existingDetailedImages) {
            if (!uniqueUrls.has(item.url)) {
              uniqueUrls.add(item.url)
              uniqueDetailedImages.push(item)
            }
          }

          setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category,
            inventory: product.inventory,
            sku: product.sku,
            imageUrl: stripApiOrigin(product.imageUrl),
          })
          setDetailedImages(uniqueDetailedImages)
        }
      } catch (error) {
        console.error('Error loading product:', error)
      }
    }

    loadProduct()
  }, [router.query.id])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    if (formData.inventory < 0) {
      newErrors.inventory = 'Inventory cannot be negative'
    }
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required'
    }
    // Check for either existing URL or pending file
    if (!formData.imageUrl.trim() && !mainImageFile) {
      newErrors.imageUrl = 'Main image is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'inventory' ? Number.parseFloat(value) || 0 : value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value as ProductCategory,
    }))
    if (errors.category) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.category
        return newErrors
      })
    }
  }

  const handleMainImageFileChange = (file: File | null) => {
    setMainImageFile(file)
    // If file is selected, clear the existing URL (we'll upload the new one)
    if (file) {
      setFormData(prev => ({ ...prev, imageUrl: '' }))
    }
    // Clear error
    if (errors.imageUrl) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.imageUrl
        return newErrors
      })
    }
  }

  const handleDetailedImagesChange = (images: ImageItem[]) => {
    setDetailedImages(images)
  }

  /**
   * Upload all pending images and return the final URLs
   */
  const uploadPendingImages = async (): Promise<{
    mainImageUrl: string
    detailedImageUrls: string[]
  }> => {
    // Upload main image if there's a pending file
    let finalMainImageUrl = formData.imageUrl
    if (mainImageFile) {
      const result = await uploadApi.uploadFile(mainImageFile)
      finalMainImageUrl = stripApiOrigin(result.relativePath || result.url)
    }

    // Upload detailed images that are pending files
    const detailedImageUrls: string[] = []
    for (const item of detailedImages) {
      if (item.type === 'file') {
        const result = await uploadApi.uploadFile(item.file)
        detailedImageUrls.push(stripApiOrigin(result.relativePath || result.url))
      } else {
        detailedImageUrls.push(item.url)
      }
    }

    return { mainImageUrl: finalMainImageUrl, detailedImageUrls }
  }

  const buildProductPayload = (mainImageUrl: string, detailedImageUrls: string[]): ProductPayload => ({
    name: formData.name.trim(),
    description: formData.description.trim(),
    price: Number(formData.price),
    category: formData.category,
    inventory: Number(formData.inventory),
    sku: formData.sku.trim(),
    imageUrl: mainImageUrl,
    detailedImages: detailedImageUrls
      .filter((url) => url.trim())
      .map((url) => ({ url })),
  })

  const persistProduct = async (payload: ProductPayload) => {
    if (isEditMode && productId) {
      const updated = await productsApi.update(productId, payload)
      if (!updated) {
        throw new Error('Product update failed. No response from server.')
      }
      return updated
    }

    const created = await productsApi.create(payload)
    if (!created) {
      throw new Error('Product creation failed. No response from server.')
    }
    return created
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Upload all pending images
      const { mainImageUrl, detailedImageUrls } = await uploadPendingImages()

      // Step 2: Build payload with uploaded URLs
      const productPayload = buildProductPayload(mainImageUrl, detailedImageUrls)

      // Step 3: Create/update product
      const result = await persistProduct(productPayload)

      if (result && (result._id || result.id)) {
        router.push('/product-management')
      } else {
        throw new Error('Product save failed. Invalid response from server.')
      }
    } catch (error) {
      console.error('Submit error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred. Please try again.'
      setErrors(prev => ({ ...prev, submit: errorMessage }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/product-management')
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/product-management">
          <Button variant="ghost" size="icon">
            <SafeIcon name="ArrowLeft" className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode
              ? 'Update product details and images'
              : 'Fill in the details to create a new product'}
          </p>
        </div>
      </div>

      {errors.submit && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Product name, description, and category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
            <CardDescription>Set the price, stock, and SKU</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price (Rp) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  placeholder="0"
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventory">Stock Quantity *</Label>
                <Input
                  id="inventory"
                  name="inventory"
                  type="number"
                  min="0"
                  value={formData.inventory || ''}
                  onChange={handleInputChange}
                  placeholder="0"
                />
                {errors.inventory && (
                  <p className="text-sm text-destructive">{errors.inventory}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="e.g., PROD-001"
                />
                {errors.sku && (
                  <p className="text-sm text-destructive">{errors.sku}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>
              Main image and additional product photos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProductImageUpload
              mainImageUrl={formData.imageUrl}
              mainImageFile={mainImageFile}
              detailedImages={detailedImages}
              onMainImageFileChange={handleMainImageFileChange}
              onDetailedImagesChange={handleDetailedImagesChange}
              error={errors.imageUrl}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <SafeIcon name="Loader2" className="w-4 h-4 animate-spin" />
                Uploading & Saving...
              </>
            ) : (
              <>
                <SafeIcon name="Save" className="w-4 h-4" />
                {isEditMode ? 'Update Product' : 'Create Product'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
