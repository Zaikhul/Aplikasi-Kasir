import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/schemas/User';

const emailRegex = /^(?:[a-zA-Z0-9_'^&/+-])+(?:\.(?:[a-zA-Z0-9_'^&/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

function isStrongPassword(pw) {
    // Basic strength: at least 6 chars (schema), prefer mixed-case and number
    if (!pw || pw.length < 6) return false;
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /\d/.test(pw);
    return hasLower && hasUpper && hasNumber;
}

function validateInput(name, email, password) {
    const errors = {};
    if (!name) errors.name = 'Name is required';
    if (!email) {
        errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
        errors.email = 'Invalid email address';
    }
    if (!password) {
        errors.password = 'Password is required';
    } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    } else if (!isStrongPassword(password)) {
        errors.password = 'Password should include upper/lowercase and numbers';
    }
    return errors;
}

function handleMongoseError(error) {
    if (error?.code === 11000) {
        return {
            statusCode: 409,
            response: { error: 'User already exists', errors: { email: 'Email is already registered' } },
        };
    }
    if (error?.name === 'ValidationError') {
        const errors = {};
        for (const k in error.errors) errors[k] = error.errors[k].message;
        return {
            statusCode: 400,
            response: { error: 'Validation failed', errors },
        };
    }
    return null;
}

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();
        const name = (body.name || '').trim();
        const email = (body.email || '').trim().toLowerCase();
        const password = body.password || '';
        const businessName = (body.businessName || '').trim();

        // Validate input
        const errors = validateInput(name, email, password);
        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists', errors: { email: 'Email is already registered' } }, { status: 400 });
        }

        const user = await User.create({
            name,
            email,
            password,
            businessInfo: { businessName: businessName || '' },
        });

        return NextResponse.json(
            {
                success: true,
                user: { id: user._id, name: user.name, email: user.email },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Register error:', error);

        const mongoError = handleMongoseError(error);
        if (mongoError) {
            return NextResponse.json(mongoError.response, { status: mongoError.statusCode });
        }

        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}