import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Menu from '@/schemas/Menu';
import { cache } from '@/lib/redis';

// GET - Fetch all menu items
export async function GET(request) {
try {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Try cache first
    const cacheKey = `menu:${session.user.id}:${category || 'all'}:${search || ''}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
        return NextResponse.json(cached);
    }

    await connectDB();

    let query = { userId: session.user.id };

    if (category && category !== 'all') {
        query.category = category;
    }

    if (search) {
        query.$text = { $search: search };
    }

    const menuItems = await Menu.find(query)
    .sort({ createdAt: -1 })
    .lean();

    // Cache for 5 minutes
    await cache.set(cacheKey, menuItems, 300);

    return NextResponse.json(menuItems);
} catch (error) {
    console.error('Menu GET error:', error);
    return NextResponse.json(
        { error: 'Failed to fetch menu items' },
        { status: 500 }
    );
}}

// POST - Create new menu item
export async function POST(request) {
try {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    
    const menuItem = await Menu.create({
    ...data,
    userId: session.user.id,
    });

    // Invalidate cache
    await cache.invalidatePattern(`menu:${session.user.id}:*`);

    return NextResponse.json(menuItem, { status: 201 });
} catch (error) {
    console.error('Menu POST error:', error);
    return NextResponse.json(
        { error: 'Failed to create menu item' },
        { status: 500 }
    );
}}