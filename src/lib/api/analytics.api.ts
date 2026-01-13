/**
 * Analytics API Service
 */

import { apiClient } from '../apiClient';
import { unwrapResponse, ensureArray } from './helpers';

export interface SalesDay {
    date: string;
    sales: number;
    orders: number;
}

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    averageOrderValue: number;
    salesByDay: SalesDay[];
    revenueByCategory: Record<string, number>;
    topProducts?: Array<{ productId: string; name: string; sales: number; quantity: number }>;
    recentOrders?: Array<{
        _id?: string;
        orderNumber?: string;
        total: number;
        paymentMethod: string;
        createdAt: string;
    }>;
    lowStockProducts?: Array<{ name: string; inventory: number; status: string }>;
    salesByCategory?: Record<string, number>;
    paymentSummary?: Record<string, number>;
}

export interface CategorySales {
    category: string;
    sales: number;
    percentage: number;
}

export interface ProductSalesSummary {
    productId: string;
    productName: string;
    category: string;
    totalQuantitySold: number;
    totalRevenue: number;
    averagePrice: number;
}

export interface PaymentMethodSummary {
    count: number;
    revenue: number;
}

export interface DetailedReport {
    orders: Array<{
        _id: string;
        orderNumber?: string;
        items: Array<{
            productId: string;
            productName: string;
            quantity: number;
            price: number;
        }>;
        subtotal: number;
        tax: number;
        total: number;
        paymentMethod: string;
        createdAt: string;
    }>;
    totalOrders: number;
    totalRevenue: number;
    revenueByCategory: Record<string, number>;
    productSales: ProductSalesSummary[];
    dailySales: SalesDay[];
    paymentMethodSummary: Record<string, PaymentMethodSummary>;
}

export interface AnalyticsFilters {
    startDate?: string;
    endDate?: string;
}

export const analyticsApi = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await apiClient<unknown>('/analytics/dashboard');
        return unwrapResponse<DashboardStats>(response);
    },

    getCategorySales: async (filters: AnalyticsFilters = {}): Promise<CategorySales[]> => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);

        const queryString = params.toString();
        const response = await apiClient<unknown>(
            `/analytics/category-sales${queryString ? `?${queryString}` : ''}`
        );
        return ensureArray<CategorySales>(unwrapResponse<CategorySales[]>(response));
    },

    getDetailedReport: async (filters: AnalyticsFilters = {}): Promise<DetailedReport> => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);

        const queryString = params.toString();
        const response = await apiClient<unknown>(
            `/analytics/detailed-report${queryString ? `?${queryString}` : ''}`
        );
        return unwrapResponse<DetailedReport>(response);
    },
};
