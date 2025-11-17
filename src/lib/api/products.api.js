import { apiClient } from '../apiClient'

/**
 * Product API Service
 * Matches backend ProductController endpoints
 */

export const productsApi = {
  /**
   * Get all products
   * GET /products?category=&search=&status=
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category)
    }
    if (filters.search) {
      params.append('search', filters.search)
    }
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status)
    }
    
    const queryString = params.toString()
    return await apiClient(`/products${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * Get product by ID
   * GET /products/:id
   */
  getById: async (id) => {
    return await apiClient(`/products/${id}`)
  },

  /**
   * Create product
   * POST /products
   */
  create: async (productData) => {
    return await apiClient('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  },

  /**
   * Update product
   * PUT /products/:id
   */
  update: async (id, productData) => {
    return await apiClient(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  },

  /**
   * Delete product
   * DELETE /products/:id
   */
  delete: async (id) => {
    return await apiClient(`/products/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Get product statistics
   * GET /products/stats
   */
  getStats: async () => {
    return await apiClient('/products/stats')
  },
}

