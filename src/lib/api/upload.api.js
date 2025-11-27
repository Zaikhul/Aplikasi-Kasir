import { apiClient } from '../apiClient'

/**
 * Upload API Service
 * Matches backend UploadController endpoints
 */

export const uploadApi = {
  /**
   * Upload file
   * POST /upload
   */
  uploadFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient('/upload', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary
    })

    // Prefer relativePath if available (for Next.js Image optimization)
    if (response.relativePath) {
      return {
        ...response,
        url: response.relativePath,
      }
    }

    return response
  },
}

