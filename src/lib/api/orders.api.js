import { apiClient } from '../apiClient'

/**
 * Order API Service
 * Matches backend OrderController endpoints
 */

export const ordersApi = {
  /**
   * Get all orders
   * GET /orders?startDate=&endDate=&status=
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.startDate) {
      params.append('startDate', filters.startDate)
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate)
    }
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status)
    }
    
    const queryString = params.toString()
    return await apiClient(`/orders${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * Get order by ID
   * GET /orders/:id
   */
  getById: async (id) => {
    return await apiClient(`/orders/${id}`)
  },

  /**
   * Create order
   * POST /orders
   */
  create: async (orderData) => {
    return await apiClient('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  },

  /**
   * Update order status
   * PUT /orders/:id/status
   */
  updateStatus: async (id, status) => {
    return await apiClient(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  },

  /**
   * Get order statistics
   * GET /orders/stats?startDate=&endDate=
   */
  getStats: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.startDate) {
      params.append('startDate', filters.startDate)
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate)
    }
    
    const queryString = params.toString()
    return await apiClient(`/orders/stats${queryString ? `?${queryString}` : ''}`)
  },
}

