/**
 * API Client with HttpOnly Cookie Authentication
 * Provides type-safe HTTP client for communicating with backend API through proxy
 */

import { getErrorMessage } from './errors';

/**
 * API response wrapper type
 */
export interface ApiClientResponse<T = unknown> {
    data?: T;
    error?: string;
}

/**
 * Request options for API client
 */
export interface ApiClientOptions extends Omit<RequestInit, 'body'> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: BodyInit | Record<string, any> | null;
}

/**
 * Set authentication token via httpOnly cookie
 */
export async function setToken(token: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        const response = await fetch('/api/auth/set-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            console.error('Failed to set auth cookie');
        }
    } catch (error) {
        console.error('Error setting auth cookie:', getErrorMessage(error));
    }
}

/**
 * Clear authentication token (logout)
 */
export async function clearToken(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        await fetch('/api/auth/clear-token', {
            method: 'POST',
        });
    } catch (error) {
        console.error('Error clearing auth cookie:', getErrorMessage(error));
    }
}

/**
 * Parse validation error messages from API response
 */
function parseValidationErrors(errorData: { message?: unknown }): string {
    if (!errorData.message || !Array.isArray(errorData.message)) {
        return '';
    }

    return errorData.message
        .map((err: unknown) => {
            if (typeof err === 'string') return err;
            if (typeof err === 'object' && err !== null) {
                const constraints = (err as { constraints?: Record<string, string> }).constraints;
                if (constraints) {
                    return Object.values(constraints).join(', ');
                }
                return JSON.stringify(err);
            }
            return String(err);
        })
        .join('; ');
}

/**
 * API Client that routes requests through a proxy to handle auth
 * @param endpoint - API endpoint path (e.g., '/products' or 'products')
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws Error with descriptive message on failure
 */
export async function apiClient<T = unknown>(
    endpoint: string,
    options: ApiClientOptions = {}
): Promise<T> {
    const headers: HeadersInit = {
        ...(options.headers as Record<string, string>),
    };

    // Only set Content-Type for non-FormData bodies
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        const proxyUrl = `/api/proxy/${normalizedEndpoint}`;

        // Build body first
        let requestBody: BodyInit | undefined;
        if (options.body) {
            if (options.body instanceof FormData) {
                requestBody = options.body;
            } else if (typeof options.body === 'object') {
                requestBody = JSON.stringify(options.body);
            } else {
                requestBody = options.body as BodyInit;
            }
        }

        const fetchOptions: RequestInit = {
            method: options.method,
            headers,
            credentials: 'include',
            body: requestBody,
        };

        const response = await fetch(proxyUrl, fetchOptions);

        if (!response.ok) {
            // Handle 401 Unauthorized - redirect to login
            if (response.status === 401) {
                if (typeof window !== 'undefined') {
                    await clearToken();
                    window.location.href = '/auth/login';
                }
                throw new Error('Session expired. Please login again.');
            }

            // Try to parse error response
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                const errorData = await response.json().catch(() => ({}));

                // Handle validation errors (array of messages)
                const validationMessages = parseValidationErrors(errorData);
                if (validationMessages) {
                    throw new Error(`Validation failed: ${validationMessages}`);
                }

                throw new Error(
                    (errorData as { message?: string }).message ||
                    `API request failed with status ${response.status}`
                );
            }

            throw new Error('API endpoint not found. Make sure the backend is running.');
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return null as T;
        }

        return (await response.json()) as T;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error(`Fetch error for ${endpoint}:`, error);
        }
        throw error;
    }
}
