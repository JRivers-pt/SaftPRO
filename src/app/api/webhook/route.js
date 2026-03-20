import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Use service role key (server-side only!) to update user records
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('[Webhook Signature Error]', err.message);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle the events
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const customerEmail = session.customer_email;
            const plan = session.metadata?.plan || 'pro';

            console.log(`[Webhook] New ${plan} subscription for ${customerEmail}`);

            // Update the user's plan in Supabase
            if (customerEmail) {
                const { error } = await supabase
                    .from('user_profiles')
                    .update({
                        plan: plan.toLowerCase(),
                        stripe_customer_id: session.customer,
                        stripe_subscription_id: session.subscription,
                        updated_at: new Date().toISOString()
                    })
                    .eq('email', customerEmail);

                if (error) {
                    console.error('[Supabase Update Error]', error);
                }
            }
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            // Downgrade user to free plan on cancellation
            const { error } = await supabase
                .from('user_profiles')
                .update({ plan: 'free', updated_at: new Date().toISOString() })
                .eq('stripe_subscription_id', subscription.id);

            if (error) {
                console.error('[Supabase Downgrade Error]', error);
            }
            break;
        }

        case 'invoice.payment_failed': {
            // Optionally notify the user that payment failed
            console.warn('[Webhook] Payment failed for subscription:', event.data.object.subscription);
            break;
        }

        default:
            console.log(`[Webhook] Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
