/**
     * Mengambil token JWT dari localStorage.
     */
    function getToken() {
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const token = getToken();

      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
          ...options,
          headers,
        });

        if (!response.ok) {
          // Coba parse error dari backend
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', response.status, errorData);
          throw new Error(errorData.message || 'API request failed');
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