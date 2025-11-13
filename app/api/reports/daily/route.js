import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import connectDB from '@/lib/mongodb';
import Order from '@/schemas/Order';
import { cache } from '@/lib/redis';

export async function GET(request) {
try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Try cache
    const cacheKey = `reports:${session.user.id}:daily:${date}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
        return NextResponse.json(cached);
    }

    await connectDB();

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const orders = await Order.find({
        userId: session.user.id,
        createdAt: { $gte: startDate, $lte: endDate },
        paymentStatus: 'completed',
    });

    const report = {
        date,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
        totalTax: orders.reduce((sum, order) => sum + order.tax, 0),
        totalDiscount: orders.reduce((sum, order) => sum + order.discount, 0),
        paymentMethods: {},
        topItems: {},
        hourlyBreakdown: Array(24).fill(0),
    };

    orders.forEach(order => {
    // Payment methods
    report.paymentMethods[order.paymentMethod] = 
        (report.paymentMethods[order.paymentMethod] || 0) + 1;

    // Top items
    order.items.forEach(item => {
        if (!report.topItems[item.name]) {
            report.topItems[item.name] = { quantity: 0, revenue: 0 };
        }
        report.topItems[item.name].quantity += item.quantity;
        report.topItems[item.name].revenue += item.subtotal;
    });

    // Hourly breakdown
    const hour = new Date(order.createdAt).getHours();
    report.hourlyBreakdown[hour] += order.total;
    });

    // Cache for 15 minutes
    await cache.set(cacheKey, report, 900);

    return NextResponse.json(report);
} catch (error) {
    console.error('Daily report error:', error);
    return NextResponse.json(
        { error: 'Failed to generate report' },
        { status: 500 }
    );
}}