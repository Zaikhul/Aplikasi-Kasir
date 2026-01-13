/**
 * Product API Service
 */

import { apiClient } from '../apiClient';
import { unwrapResponse, ensureArray } from './helpers';
import type { ProductCategory, ProductStatus } from '@/data/products';

export interface Product {
    _id?: string;
    id?: string;
    name: string;
    description: string;
    price: number;
    category: ProductCategory;
    inventory: number;
    sku: string;
    imageUrl: string;
    detailedImages: Array<{ url: string } | string>;
    status?: ProductStatus;
    rating?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductFilters {
    category?: string;
    search?: string;
    status?: string;
}

export interface ProductStats {
    totalProducts: number;
    total?: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
}

export interface CreateProductData {
    name: string;
    description: string;
    price: number;
    category: ProductCategory;
    inventory: number;
    sku: string;
    imageUrl: string;
    detailedImages: Array<{ url: string }>;
    status?: ProductStatus;
    isAvailable?: boolean;
}

export const productsApi = {
    getAll: async (filters: ProductFilters = {}): Promise<Product[]> => {
        const params = new URLSearchParams();
        if (filters.category && filters.category !== 'all') {
            params.append('category', filters.category);
        }
        if (filters.search) {
            params.append('search', filters.search);
        }
        if (filters.status && filters.status !== 'all') {
            params.append('status', filters.status);
        }

        const queryString = params.toString();
        const response = await apiClient<unknown>(`/products${queryString ? `?${queryString}` : ''}`);
        return ensureArray<Product>(unwrapResponse<Product[]>(response));
    },

    getById: async (id: string): Promise<Product> => {
        const response = await apiClient<unknown>(`/products/${id}`);
        return unwrapResponse<Product>(response);
    },

    create: async (productData: CreateProductData): Promise<Product> => {
        const response = await apiClient<unknown>('/products', {
            method: 'POST',
            body: productData,
        });
        return unwrapResponse<Product>(response);
    },

    update: async (id: string, productData: Partial<CreateProductData>): Promise<Product> => {
        const response = await apiClient<unknown>(`/products/${id}`, {
            method: 'PUT',
            body: productData,
        });
        return unwrapResponse<Product>(response);
    },

    delete: async (id: string): Promise<void> => {
        await apiClient<void>(`/products/${id}`, { method: 'DELETE' });
    },

    getStats: async (): Promise<ProductStats> => {
        const response = await apiClient<unknown>('/products/stats');
        return unwrapResponse<ProductStats>(response);
    },
};
