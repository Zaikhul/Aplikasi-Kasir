/**
     * Mengambil token JWT dari localStorage.
     */
    export function getToken() {
      if (typeof window === 'undefined') {
        return null;
      }
      return localStorage.getItem('token');
    }

    /**
     * Wrapper untuk fetch yang secara otomatis menambahkan URL API
     * dan header Authorization (token JWT).
     */
    export async function apiClient(endpoint, options = {}) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL is not configured. Please set it in .env.local file.');
      }
      
      const token = getToken();

      const headers = {
        ...options.headers,
      };

      // Only set Content-Type for non-FormData requests
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        // Ensure endpoint starts with /
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const fullUrl = `${apiUrl}${normalizedEndpoint}`;
        
        const response = await fetch(fullUrl, {
          ...options,
          headers,
        });

        if (!response.ok) {
          // Handle 401 Unauthorized - token expired or invalid
          if (response.status === 401) {
            // Clear invalid token
            if (typeof window !== 'undefined') {
              clearToken();
              // Redirect to login page
              window.location.href = '/auth/login';
            }
            throw new Error('Session expired. Please login again.');
          }

          // Check if response is JSON or HTML (404 page)
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', response.status, errorData);
            
            // Handle validation errors from NestJS
            if (errorData.message && Array.isArray(errorData.message)) {
              // NestJS validation errors format
              const validationMessages = errorData.message.map((err) => {
                if (typeof err === 'string') return err
                return err.constraints ? Object.values(err.constraints).join(', ') : JSON.stringify(err)
              }).join('; ')
              throw new Error(`Validation failed: ${validationMessages}`)
            }
            
            throw new Error(errorData.message || `API request failed with status ${response.status}`);
          } else {
            // HTML response (likely 404 or error page)
            const text = await response.text().catch(() => '');
            console.error('API Error: Received HTML instead of JSON', response.status, text.substring(0, 200));
            throw new Error(`API endpoint not found. Make sure the backend is running on ${apiUrl}`);
          }
        }

        // Jika respons tidak memiliki konten (misalnya 204 No Content)
        if (response.status === 204) {
          return null; 
        }

        return await response.json();
      } catch (error) {
        console.error(`Fetch error for ${endpoint}:`, error);
        throw error;
      }
    }
    
    /**
     * Simpan token setelah login.
     */
    export function setToken(token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
    }

    /**
     * Hapus token saat logout.
     */
    export function clearToken() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }