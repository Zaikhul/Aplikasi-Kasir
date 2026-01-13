/**
 * Menu API Service (Legacy)
 * Provides backward compatibility for menu endpoints
 * Consider migrating to products API for new features
 */

import { apiClient } from '../apiClient';

export interface MenuItem {
    _id?: string;
    id?: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    imageUrl?: string;
    available?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface MenuFilters {
    category?: string;
    search?: string;
}

export interface CreateMenuItemData {
    name: string;
    description?: string;
    price: number;
    category: string;
    imageUrl?: string;
}

export const menuApi = {
    /**
     * Get all menu items
     * GET /menu?category=&search=
     */
    getAll: async (filters: MenuFilters = {}): Promise<MenuItem[]> => {
        const params = new URLSearchParams();

        if (filters.category && filters.category !== 'all') {
            params.append('category', filters.category);
        }
        if (filters.search) {
            params.append('search', filters.search);
        }

        const queryString = params.toString();
        return await apiClient<MenuItem[]>(`/menu${queryString ? `?${queryString}` : ''}`);
    },

    /**
     * Get menu item by ID
     * GET /menu/:id
     */
    getById: async (id: string): Promise<MenuItem> => {
        return await apiClient<MenuItem>(`/menu/${id}`);
    },

    /**
     * Create menu item
     * POST /menu
     */
    create: async (menuData: CreateMenuItemData): Promise<MenuItem> => {
        return await apiClient<MenuItem>('/menu', {
            method: 'POST',
            body: menuData,
        });
    },

    /**
     * Update menu item
     * PUT /menu/:id
     */
    update: async (id: string, menuData: Partial<CreateMenuItemData>): Promise<MenuItem> => {
        return await apiClient<MenuItem>(`/menu/${id}`, {
            method: 'PUT',
            body: menuData,
        });
    },

    /**
     * Delete menu item
     * DELETE /menu/:id
     */
    delete: async (id: string): Promise<void> => {
        return await apiClient<void>(`/menu/${id}`, {
            method: 'DELETE',
        });
    },
};
