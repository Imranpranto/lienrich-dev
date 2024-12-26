import React, { useEffect, useState } from 'react';
import { CreditCard, Calendar, ArrowRight, Download, History } from 'lucide-react';
import { useCreditsStats } from '../hooks/useCreditsStats';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import BillingDetailsModal from '../components/modals/BillingDetailsModal';
import { pricingTiers } from '../data/pricingTiers';

interface CreditStats {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
}

interface SubscriptionDetails {
  plan: string;
  price: number;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  subscriptionStartAt: string | null;
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoice: string;
}

const billingHistory: BillingHistory[] = [
  {
    id: '1',
    date: '2024-02-15',
    amount: 50,
    status: 'paid',
    invoice: 'INV-2024-001'
  },
  {
    id: '2',
    date: '2024-01-15',
    amount: 50,
    status: 'paid',
    invoice: 'INV-2024-002'
  }
];

export default function MySubscription() {
  const navigate = useNavigate();
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails>({
    plan: 'Trial',
    price: 0,
    trialEndsAt: null,
    subscriptionEndsAt: null,
    subscriptionStartAt: null
  });
  const [showBillingDetails, setShowBillingDetails] = useState(false);
  const { totalCredits, usedCredits, remainingCredits, loading: creditsLoading } = useCreditsStats();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [creditStats, setCreditStats] = useState<CreditStats>({
    totalCredits: 0,
    usedCredits: 0,
    remainingCredits: 0
  });
  const maxRetries = 3;
  const retryDelay = 1000;

  const getPlanPrice = (planName: string) => {
    const plan = pricingTiers.find(tier => tier.name === planName);
    return plan?.price || 0;
  };

  const fetchProfileWithRetry = async (retries = maxRetries): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('credits_calculation_and_profiles')
        .select(`
          plan,
          trial_ends_at,
          subscription_end_at,
          subscription_start_at
        `)
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('No profile data found');
      return data;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchProfileWithRetry(retries - 1);
      }
      throw error;
    }
  };

  const fetchCreditsWithRetry = async (retries = maxRetries): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('credits_calculation_and_profiles')
        .select('trial_ends_at, credits_left')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('No credit data found');
      return data;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchCreditsWithRetry(retries - 1);
      }
      throw error;
    }
  };

  useEffect(() => {
    async function fetchCreditStats() {
      if (!user) return;
      
      let attempts = maxRetries;
      
      try {
        setError(null);
        while (attempts > 0) {
          try {
            const [profileData, creditData] = await Promise.all([
              fetchProfileWithRetry(),
              fetchCreditsWithRetry()
            ]);

            if (!profileData || !creditData) {
              throw new Error('Failed to fetch subscription data');
            }

            setSubscriptionDetails({
              plan: profileData?.plan || 'Trial',
              price: getPlanPrice(profileData?.plan || 'Trial'),
              trialEndsAt: profileData.trial_ends_at,
              subscriptionEndsAt: profileData.subscription_end_at,
              subscriptionStartAt: profileData.subscription_start_at
            });

            setCreditStats({
              totalCredits: profileData.total_credits || 250,
              usedCredits: profileData.used_credits || 0,
              remainingCredits: profileData.credits_left || 250
            });

            // If we get here, everything worked
            break;
          } catch (retryError) {
            attempts--;
            if (attempts === 0) throw retryError;
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      } catch (error) {
        console.error('Error fetching credit stats:', error);
        setError(error instanceof Error ? error.message : 'Unable to load credit stats');
      } finally {
        setLoading(false);
      }
    }

    fetchCreditStats();

    // Set up realtime subscription
    const subscription = supabase
      .channel('credit_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'credit_transactions',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchCreditStats();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">My Subscription</h1>
          <p className="text-gray-500">Manage your account settings and preferences</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-medium text-gray-900">Current Plan</h2>
                <p className="text-sm text-gray-500">{subscriptionDetails.plan}</p>
              </div>
            </div>
            <div className="flex items-baseline mb-4">
              <span className="text-2xl font-bold text-gray-900">${subscriptionDetails.price}</span>
              <span className="text-gray-500 ml-1">/month</span>
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Upgrade Plan
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="font-medium text-gray-900">Next Billing</h2>
                <p className="text-sm text-gray-500">
                  {subscriptionDetails.plan === 'Trial'
                    ? subscriptionDetails.trialEndsAt
                      ? `Trial ends on ${new Date(subscriptionDetails.trialEndsAt).toLocaleDateString()}`
                      : 'Trial period active'
                    : subscriptionDetails.subscriptionEndsAt
                      ? `Next billing on ${new Date(subscriptionDetails.subscriptionEndsAt).toLocaleDateString()}`
                      : 'No active subscription'}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {subscriptionDetails.plan !== 'Trial' && subscriptionDetails.subscriptionEndsAt && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Subscription active</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowBillingDetails(true)}
              className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Details
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <History className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-medium text-gray-900">Credits Usage</h2>
                <p className="text-sm text-gray-500">This Month</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">
                  {creditsLoading ? 'Loading...' : `${usedCredits.toLocaleString()} / ${totalCredits.toLocaleString()} credits used`}
                </span>
                <span className="text-gray-900 font-medium">
                  {creditsLoading ? '-' : totalCredits > 0
                    ? `${Math.round((usedCredits / totalCredits) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-2 bg-purple-600 rounded-full transition-all duration-300" 
                  style={{ width: creditsLoading ? '0%' : totalCredits > 0
                    ? `${Math.min((usedCredits / totalCredits) * 100, 100)}%`
                    : '0%' }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">{remainingCredits.toLocaleString()}</span> credits remaining
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {billingHistory.map((bill) => (
              <div key={bill.id} className="p-6 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    ${bill.amount.toFixed(2)} - {new Date(bill.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">{bill.invoice}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                    bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Need help with billing?</h3>
            <p className="text-sm text-gray-500">Our support team is here to assist you</p>
          </div>
          <button 
            onClick={() => {
              const widget = document.querySelector('charla-widget');
              if (widget) {
                widget.dispatchEvent(new Event('open'));
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
          >
            Contact Support
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <BillingDetailsModal
        isOpen={showBillingDetails}
        onClose={() => setShowBillingDetails(false)}
        plan={subscriptionDetails.plan}
        trialEndsAt={subscriptionDetails.trialEndsAt}
        subscriptionEndsAt={subscriptionDetails.subscriptionEndsAt}
        subscriptionStartAt={subscriptionDetails.subscriptionStartAt}
      />
    </div>
  );
}