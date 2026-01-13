/**
 * Order API Service
 */

import { apiClient } from '../apiClient';
import { unwrapResponse, ensureArray } from './helpers';

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

export interface Order {
    _id?: string;
    id?: string;
    orderNumber?: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    status: string;
    cashReceived?: number;
    changeGiven?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface OrderFilters {
    startDate?: string;
    endDate?: string;
    status?: string;
}

export interface OrderStats {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
}

export interface CreateOrderData {
    items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        price: number;
        imageUrl?: string;
    }>;
    subtotal?: number;
    tax?: number;
    total?: number;
    paymentMethod: string;
    cashReceived?: number;
    changeGiven?: number;
    notes?: string;
}

export const ordersApi = {
    getAll: async (filters: OrderFilters = {}): Promise<Order[]> => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);

        const queryString = params.toString();
        const response = await apiClient<unknown>(`/orders${queryString ? `?${queryString}` : ''}`);
        return ensureArray<Order>(unwrapResponse<Order[]>(response));
    },

    getById: async (id: string): Promise<Order> => {
        const response = await apiClient<unknown>(`/orders/${id}`);
        return unwrapResponse<Order>(response);
    },

    create: async (orderData: CreateOrderData): Promise<Order> => {
        const response = await apiClient<unknown>('/orders', {
            method: 'POST',
            body: orderData,
        });
        return unwrapResponse<Order>(response);
    },

    updateStatus: async (id: string, status: string): Promise<Order> => {
        const response = await apiClient<unknown>(`/orders/${id}/status`, {
            method: 'PUT',
            body: { status },
        });
        return unwrapResponse<Order>(response);
    },

    getStats: async (filters: Omit<OrderFilters, 'status'> = {}): Promise<OrderStats> => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);

        const queryString = params.toString();
        const response = await apiClient<unknown>(`/orders/stats${queryString ? `?${queryString}` : ''}`);
        return unwrapResponse<OrderStats>(response);
    },
};
