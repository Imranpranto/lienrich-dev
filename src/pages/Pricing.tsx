import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { fetchProfile } from '../utils/supabaseHelpers';
import { pricingTiers } from '../data/pricingTiers';
import { toast } from '../utils/toast';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState('Trial');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribe, loading: subscriptionLoading } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurrentPlan() {
      if (!user) return;
      
      try {
        setError(null);
        const profile = await fetchProfile(user.id);
        setCurrentPlan(profile?.plan || 'Trial');
      } catch (error) {
        console.error('Error fetching current plan:', error);
        const message = error instanceof Error 
          ? error.message
          : 'Failed to load current plan. Please try again.';
        setError(message);
        setCurrentPlan('Trial'); // Fallback to Trial
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentPlan();
  }, [user]);
  
  function calculateYearlyPrice(monthlyPrice: number) {
    const yearlyDiscount = 0.1; // 10% discount
    return monthlyPrice * 12 * (1 - yearlyDiscount);
  }

  const handleUpgrade = async (plan: string) => {
    if (!user) return;
    setProcessingPlan(plan);

    try {
      const selectedPlan = pricingTiers.find(tier => tier.name === plan);
      if (!selectedPlan) throw new Error('Invalid plan selected');

      await subscribe(selectedPlan, billingCycle);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to upgrade plan');
      toast.error(error instanceof Error ? error.message : 'Failed to upgrade plan');
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your needs. All plans include immediate credit delivery.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly billing
              <span className="ml-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                Save 10%
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 mb-16 px-4">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-white rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 w-full md:w-[360px] ${
                tier.name === currentPlan ? 'border-indigo-600' : 'border-gray-200'
              }`}
            >
              {tier.name === currentPlan && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </div>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-500 mb-4">{tier.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      ${billingCycle === 'monthly' ? tier.price : Math.round(calculateYearlyPrice(tier.price) / 12)}
                    </span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                  {billingCycle === 'yearly' && tier.price > 0 && (
                    <div className="text-green-600 text-sm mt-1">
                      Save ${Math.round(tier.price * 12 * 0.1)} yearly
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 text-gray-900">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    <span className="font-medium">
                      {tier.credits.toLocaleString()} credits
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Delivered immediately</div>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    tier.name === currentPlan
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  disabled={tier.name === currentPlan || processingPlan !== null}
                  onClick={() => handleUpgrade(tier.name)} 
                >
                  {tier.name === currentPlan
                    ? 'Current Plan'
                    : processingPlan === tier.name || subscriptionLoading
                      ? 'Processing...'
                      : currentPlan
                        ? pricingTiers.findIndex(t => t.name === currentPlan) < pricingTiers.findIndex(t => t.name === tier.name)
                          ? 'Upgrade Plan'
                          : 'Downgrade Plan'
                        : 'Select Plan'}
                  <ArrowRight className="h-4 w-4 ml-2 inline-block" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mb-16">
          <p className="text-gray-600">
            Need custom solutions?{' '}
            <button
              onClick={() => {
                const widget = document.querySelector('charla-widget');
                if (widget) {
                  widget.dispatchEvent(new Event('open'));
                }
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Contact our support team
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}