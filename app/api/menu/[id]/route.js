import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Menu from '@/schemas/Menu';
import { cache } from '@/lib/redis';

// PUT - Update menu item
export async function PUT(request, { params }) {
try {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const menuItem = await Menu.findOneAndUpdate(
        { _id: params.id, userId: session.user.id },
        { ...data, updatedAt: new Date() },
        { new: true }
    );

    if (!menuItem) {
        return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    // Invalidate cache
    await cache.invalidatePattern(`menu:${session.user.id}:*`);

    return NextResponse.json(menuItem);
} catch (error) {
    console.error('Menu PUT error:', error);
    return NextResponse.json(
        { error: 'Failed to update menu item' },
        { status: 500 }
    );
}}

// DELETE - Delete menu item
export async function DELETE(request, { params }) {
try {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const menuItem = await Menu.findOneAndDelete({
        _id: params.id,
        userId: session.user.id,
    });

    if (!menuItem) {
        return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    // Invalidate cache
    await cache.invalidatePattern(`menu:${session.user.id}:*`);

    return NextResponse.json({ success: true });
} catch (error) {
    console.error('Menu DELETE error:', error);
    return NextResponse.json(
        { error: 'Failed to delete menu item' },
        { status: 500 }
    );
}}