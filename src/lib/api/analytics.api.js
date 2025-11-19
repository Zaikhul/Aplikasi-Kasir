import { apiClient } from '../apiClient'

/**
 * Analytics API Service
 * Matches backend AnalyticsController endpoints
 */

export const analyticsApi = {
  /**
   * Get dashboard statistics
   * GET /analytics/dashboard
   */
  getDashboardStats: async () => {
    return await apiClient('/analytics/dashboard')
  },

  /**
   * Get category sales
   * GET /analytics/category-sales?startDate=&endDate=
   */
  getCategorySales: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.startDate) {
      params.append('startDate', filters.startDate)
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate)
    }
    
    const queryString = params.toString()
    return await apiClient(`/analytics/category-sales${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * Get detailed sales report for export
   * GET /analytics/detailed-report?startDate=&endDate=
   */
  getDetailedReport: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.startDate) {
      params.append('startDate', filters.startDate)
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate)
    }
    
    const queryString = params.toString()
    return await apiClient(`/analytics/detailed-report${queryString ? `?${queryString}` : ''}`)
  },
}

