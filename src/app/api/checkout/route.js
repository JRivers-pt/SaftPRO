import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Map of plan names to Stripe Price IDs (set these in your .env.local)
const PRICE_IDS = {
    Pro: process.env.STRIPE_PRO_PRICE_ID,
    Agency: process.env.STRIPE_AGENCY_PRICE_ID,
};

export async function POST(req) {
    try {
        const { plan, userEmail } = await req.json();

        const priceId = PRICE_IDS[plan];
        if (!priceId) {
            return NextResponse.json({ error: `Plano inválido: ${plan}` }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            customer_email: userEmail || undefined,
            metadata: { plan },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true&plan=${plan}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?cancelled=true`,
            locale: 'pt',
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error('[Stripe Checkout Error]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
