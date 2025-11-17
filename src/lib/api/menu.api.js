import { apiClient } from '../apiClient'

/**
 * Menu API Service (Legacy - for backward compatibility)
 * Matches backend MenuController endpoints
 * Note: Consider migrating to products API
 */

export const menuApi = {
  /**
   * Get all menu items
   * GET /menu?category=&search=
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category)
    }
    if (filters.search) {
      params.append('search', filters.search)
    }
    
    const queryString = params.toString()
    return await apiClient(`/menu${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * Get menu item by ID
   * GET /menu/:id
   */
  getById: async (id) => {
    return await apiClient(`/menu/${id}`)
  },

  /**
   * Create menu item
   * POST /menu
   */
  create: async (menuData) => {
    return await apiClient('/menu', {
      method: 'POST',
      body: JSON.stringify(menuData),
    })
  },

  /**
   * Update menu item
   * PUT /menu/:id
   */
  update: async (id, menuData) => {
    return await apiClient(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(menuData),
    })
  },

  /**
   * Delete menu item
   * DELETE /menu/:id
   */
  delete: async (id) => {
    return await apiClient(`/menu/${id}`, {
      method: 'DELETE',
    })
  },
}

