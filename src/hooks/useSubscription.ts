import { useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { fetchProfile } from '../utils/supabaseHelpers';
import { createCheckoutSession, redirectToCheckout, createPortalSession } from '../lib/stripe';
import type { PricingTier } from '../data/pricingTiers';
import { toast } from '../utils/toast';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function useSubscription() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const retryCount = useRef(0);

  const subscribe = useCallback(async (
    plan: PricingTier,
    billingCycle: 'monthly' | 'yearly'
  ) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    const priceId = plan.stripePrices[billingCycle];
    if (!priceId) {
      toast.error('Invalid pricing configuration');
      return;
    }

    setLoading(true);

    try {
      let sessionId;
      while (retryCount.current < MAX_RETRIES) {
        try {
          const result = await createCheckoutSession(priceId);
          sessionId = result.sessionId;
          break;
        } catch (error) {
          if (retryCount.current === MAX_RETRIES - 1) {
            throw error;
          }
          retryCount.current++;
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }

      if (!sessionId) {
        throw new Error('Failed to create checkout session after retries');
      }

      try {
        await redirectToCheckout(sessionId);
      } catch (error) {
        throw new Error('Failed to redirect to checkout. Please try again.');
      }
    } catch (error) {
      let errorMessage = 'Failed to start subscription';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      console.error('Subscription error:', { error });
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      retryCount.current = 0;
    }
  }, [user]);

  const manageBilling = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to manage billing');
      return;
    }

    setLoading(true);
    try {
      const profile = await fetchProfile(user.id);

      if (!profile?.stripe_customer_id) {
        throw new Error('No billing information found');
      }

      const { url } = await createPortalSession(profile.stripe_customer_id);
      window.location.href = url;
    } catch (error) {
      console.error('Billing portal error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    subscribe,
    manageBilling,
    loading
  };
}