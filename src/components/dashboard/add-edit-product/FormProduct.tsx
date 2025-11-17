
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
import ProductImageUpload from '@/components/dashboard/add-edit-product/UploadImage'
import type { ProductCategory } from '@/data/products'
import { productsApi } from '@/lib/api/products.api'
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
  detailedImages: string[]
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
  detailedImages: [],
}

export default function AddEditProductForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA)
  const [isEditMode, setIsEditMode] = useState(false)
  const [productId, setProductId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          const normalizedDetailed: string[] =
            product.detailedImages
              ?.map((img: string | { url: string }) =>
                typeof img === 'string' ? stripApiOrigin(img) : stripApiOrigin(img.url),
              )
              .filter((value: string) => value.trim().length > 0) || []

          const uniqueDetailedImages = Array.from(new Set(normalizedDetailed))

          setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category,
            inventory: product.inventory,
            sku: product.sku,
            imageUrl: stripApiOrigin(product.imageUrl),
            detailedImages: uniqueDetailedImages,
          })
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
    if (!formData.imageUrl.trim()) {
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

  const handleMainImageChange = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl,
    }))
    if (errors.imageUrl) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.imageUrl
        return newErrors
      })
    }
  }

  const handleDetailedImagesChange = (images: string[]) => {
    const deduped = Array.from(new Set<string>(images))
    setFormData(prev => ({
      ...prev,
      detailedImages: deduped,
    }))
  }

  const buildProductPayload = (): ProductPayload => ({
    name: formData.name.trim(),
    description: formData.description.trim(),
    price: Number(formData.price),
    category: formData.category,
    inventory: Number(formData.inventory),
    sku: formData.sku.trim(),
    imageUrl: stripApiOrigin(formData.imageUrl),
    detailedImages: formData.detailedImages
      .filter((url) => url.trim())
      .map((url) => ({ url: stripApiOrigin(url) })),
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
      const productPayload = buildProductPayload()
      const result = await persistProduct(productPayload)

      if (result && (result._id || result.id)) {
        router.push('/product-management')
      } else {
        throw new Error('Product save failed. Invalid response from server.')
      }
    } catch (error: unknown) {
      console.error('Error submitting form:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save product. Please try again.'
      setErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }))
      if (typeof globalThis !== 'undefined' && globalThis.window) {
        globalThis.window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/product-management')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/product-management" className="text-muted-foreground hover:text-foreground">
            Products
          </Link>
          <SafeIcon name="ChevronRight" className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </span>
        </div>
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditMode
            ? 'Update the product information below'
            : 'Fill in the details to create a new food item'}
        </p>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
          <SafeIcon name="AlertCircle" className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-destructive">{errors.submit}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Basic Information */}
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
                  placeholder="e.g., Gourmet Beef Burger"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger id="category" className={errors.category ? 'border-destructive' : ''}>
                    <SelectValue />
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
                placeholder="Describe the product in detail..."
                rows={4}
                className={errors.description ? 'border-destructive' : ''}
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
            <CardDescription>Price, stock level, and SKU</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price (Rp.) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={errors.price ? 'border-destructive' : ''}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventory">Inventory *</Label>
                <Input
                  id="inventory"
                  name="inventory"
                  type="number"
                  min="0"
                  value={formData.inventory}
                  onChange={handleInputChange}
                  placeholder="0"
                  className={errors.inventory ? 'border-destructive' : ''}
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
                  placeholder="e.g., FDBRGR001"
                  className={errors.sku ? 'border-destructive' : ''}
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
            <CardDescription>Main image and additional product photos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProductImageUpload
              mainImage={formData.imageUrl}
              detailedImages={formData.detailedImages}
              onMainImageChange={handleMainImageChange}
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
                Saving...
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
