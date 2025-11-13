import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/schemas/Order';
import { cache } from '@/lib/redis';

// GET - Fetch orders
export async function GET(request) {
try {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await connectDB();

    let query = { userId: session.user.id };

    if (status && status !== 'all') {
        query.paymentStatus = status;
    }

    if (startDate && endDate) {
    query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
    };}

    const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

    return NextResponse.json(orders);
} catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
    );
}}

// POST - Create new order
export async function POST(request) {
try {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = await Order.create({
        ...data,
        userId: session.user.id,
        orderNumber,
    });

    // Invalidate reports cache
    await cache.invalidatePattern(`reports:${session.user.id}:*`);

    return NextResponse.json(order, { status: 201 });
} catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
    );
}}