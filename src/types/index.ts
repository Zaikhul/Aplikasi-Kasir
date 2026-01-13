/**
 * Centralized Type Exports
 */

// Product types
export type { ProductCategory, ProductStatus, IProductModel } from '@/data/products';
export type { Product, ProductFilters, ProductStats, CreateProductData } from '@/lib/api/products.api';

// Order types
export type { Order, OrderItem, OrderFilters, OrderStats, CreateOrderData } from '@/lib/api/orders.api';

// Analytics types
export type {
    DashboardStats,
    SalesDay,
    CategorySales,
    DetailedReport,
    AnalyticsFilters,
} from '@/lib/api/analytics.api';

// Upload types
export type { UploadResponse } from '@/lib/api/upload.api';
