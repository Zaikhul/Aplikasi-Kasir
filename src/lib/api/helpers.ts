/**
 * Centralized API Helper Functions
 */

/**
 * Extracts data from wrapped API responses.
 */
export function unwrapResponse<T>(response: unknown): T {
    if (response && typeof response === 'object' && 'data' in response) {
        return (response as { data: T }).data;
    }
    return response as T;
}

/**
 * Ensures response is an array, defaulting to empty array if not.
 */
export function ensureArray<T>(data: unknown): T[] {
    if (Array.isArray(data)) {
        return data;
    }
    console.warn('Expected array from API but received:', typeof data);
    return [];
}
