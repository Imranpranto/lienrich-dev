import Stripe from 'stripe';
import { supabase } from '../../../lib/supabase';
import { pricingTiers } from '../../../data/pricingTiers';
import type { StripeWebhookEvent } from '../../../types/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function handleStripeWebhook(
  req: Request,
  signature: string
): Promise<Response> {
  try {
    const event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      webhookSecret
    ) as StripeWebhookEvent;

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 400 }
    );
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status;
  const priceId = subscription.items.data[0].price.id;

  // Find the corresponding plan
  const plan = pricingTiers.find(tier => 
    tier.stripePrices.monthly === priceId || 
    tier.stripePrices.yearly === priceId
  );

  if (!plan) {
    console.error('Unknown price ID:', priceId);
    return;
  }

  // Update user's subscription details
  const { data: profiles } = await supabase
    .from('credits_calculation_and_profiles')
    .select('id')
    .eq('stripe_customer_id', customerId);

  if (!profiles?.length) {
    console.error('No user found for customer:', customerId);
    return;
  }

  const userId = profiles[0].id;
  await supabase
    .from('credits_calculation_and_profiles')
    .update({
      plan: plan.name,
      subscription_status: status,
      stripe_subscription_id: subscription.id,
      billing_cycle: subscription.items.data[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const { data: profiles } = await supabase
    .from('credits_calculation_and_profiles')
    .select('id')
    .eq('stripe_customer_id', customerId);

  if (!profiles?.length) return;

  const userId = profiles[0].id;
  await supabase
    .from('credits_calculation_and_profiles')
    .update({
      subscription_status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Handle successful payment
  // You might want to log this or update some payment history
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const { data: profiles } = await supabase
    .from('credits_calculation_and_profiles')
    .select('id')
    .eq('stripe_customer_id', customerId);

  if (!profiles?.length) return;

  const userId = profiles[0].id;
  await supabase
    .from('credits_calculation_and_profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
}