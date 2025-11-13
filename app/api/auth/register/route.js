import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/schemas/User';

export async function POST(request) {
try {
    await connectDB();

    const { name, email, password, businessName } = await request.json();

    // Validate input
    if (!name || !email || !password) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return NextResponse.json(
            { error: 'User already exists' },
            { status: 400 }
        );
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        businessInfo: {
            businessName: businessName || '',
        },
    });

    return NextResponse.json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    },
        { status: 201 }
    );
} catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
    );
}}