import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';
import type { PricingTier } from '../../data/pricingTiers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let requestData;
  try {
    requestData = await req.json();
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { priceId, customerId } = requestData;

  if (!priceId) {
    return new Response(
      JSON.stringify({ error: 'Price ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let customer = customerId;
    if (!customer) {
      // Get or create customer
      const { data: profile } = await supabase
        .from('credits_calculation_and_profiles')
        .select('stripe_customer_id, email')
        .eq('id', user.id)
        .single();

      if (profile?.stripe_customer_id) {
        customer = profile.stripe_customer_id;
      } else {
        const newCustomer = await stripe.customers.create({
          email: profile?.email || user.email,
          metadata: {
            supabase_uid: user.id
          }
        });
        customer = newCustomer.id;

        // Save customer ID
        await supabase
          .from('credits_calculation_and_profiles')
          .update({ stripe_customer_id: customer })
          .eq('id', user.id);
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/my-subscription?success=true`,
      cancel_url: `${req.headers.get('origin')}/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto'
      },
      payment_method_collection: 'if_required'
    });

    if (!session?.id) {
      return new Response(
        JSON.stringify({ error: 'Failed to create Stripe session' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json'
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Checkout failed';

    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}