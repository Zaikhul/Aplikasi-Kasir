import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import SubscriptionPlan from '@/schemas/Subscription';

export async function GET(request) {
try {
    await connectDB();

    const plans = await SubscriptionPlan.find({ active: true }).lean();

    return NextResponse.json(plans);
} catch (error) {
    console.error('Subscription GET error:', error);
    return NextResponse.json(
        { error: 'Failed to fetch plans' },
        { status: 500 }
    );
}}