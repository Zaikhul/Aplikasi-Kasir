import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    const { amount, currency = 'idr' } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
            userId: session.user.id,
        },
    });

    return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
    });
} catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
        { error: 'Failed to create payment intent' },
        { status: 500 }
    );
}}