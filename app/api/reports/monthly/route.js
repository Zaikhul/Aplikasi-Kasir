import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/schemas/Order';
import { cache } from '@/lib/redis';

export async function GET(request) {
try {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // Format: YYYY-MM
    
    if (!month) {
        return NextResponse.json({ error: 'Month parameter required' }, { status: 400 });
    }

    // Try cache
    const cacheKey = `reports:${session.user.id}:monthly:${month}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
        return NextResponse.json(cached);
    }

    await connectDB();

    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const orders = await Order.find({
        userId: session.user.id,
        createdAt: { $gte: startDate, $lte: endDate },
        paymentStatus: 'completed',
    });

    const daysInMonth = endDate.getDate();
    const dailyRevenue = Array(daysInMonth).fill(0);

    const report = {
        month,
        totalOrders: orders.length,
        totalRevenue: 0,
        totalTax: 0,
        totalDiscount: 0,
        averageOrderValue: 0,
        dailyRevenue: [],
        topProducts: {},
        paymentMethodBreakdown: {},
    };

    orders.forEach(order => {
        report.totalRevenue += order.total;
        report.totalTax += order.tax;
        report.totalDiscount += order.discount;

    // Daily revenue
    const day = new Date(order.createdAt).getDate() - 1;
    dailyRevenue[day] += order.total;

    // Payment methods
    report.paymentMethodBreakdown[order.paymentMethod] = 
        (report.paymentMethodBreakdown[order.paymentMethod] || 0) + order.total;

    // Top products
    order.items.forEach(item => {
        if (!report.topProducts[item.name]) {
            report.topProducts[item.name] = { quantity: 0, revenue: 0 };
        }
        report.topProducts[item.name].quantity += item.quantity;
        report.topProducts[item.name].revenue += item.subtotal;
    });
    });

    report.averageOrderValue = report.totalOrders > 0 
    ? report.totalRevenue / report.totalOrders 
    : 0;

    report.dailyRevenue = dailyRevenue.map((revenue, index) => ({
        day: index + 1,
        revenue,
    }));

    // Cache for 1 hour
    await cache.set(cacheKey, report, 3600);

    return NextResponse.json(report);
} catch (error) {
    console.error('Monthly report error:', error);
    return NextResponse.json(
        { error: 'Failed to generate report' },
        { status: 500 }
    );
}}