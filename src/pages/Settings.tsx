import React from 'react';
import { Save, User, Mail, CreditCard, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { toast } from '../utils/toast';
import { getGravatarUrl } from '../utils/gravatar';

export default function Settings() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = React.useState('');
  const [plan, setPlan] = React.useState('Trial');
  const [trialEndsAt, setTrialEndsAt] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('credits_calculation_and_profiles')
          .select('display_name, plan, trial_ends_at')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        if (data) {
          setDisplayName(data.display_name);
          setPlan(data.plan);
          setTrialEndsAt(data.trial_ends_at);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
    
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('credits_calculation_and_profiles')
        .update({ 
          display_name: displayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Profile not found. Please try logging in again.');
        }
        throw error;
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to save settings. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-500">Manage your account settings and preferences</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-6">
              <img
                src={user?.user_metadata?.avatar_url || getGravatarUrl(user?.email || '')}
                alt={displayName || user?.email}
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{displayName || user?.email?.split('@')[0]}</h2>
                <p className="text-gray-500">{user?.email}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    plan === 'Trial' 
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {plan === 'Trial' ? 'Free Trial' : `${plan} Plan`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {plan === 'Trial' && trialEndsAt && (
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
              <div className="flex items-center gap-2 text-amber-800">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Trial ends on {new Date(trialEndsAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Update your profile information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 text-gray-400" />
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="displayName" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <User className="h-4 w-4 text-gray-400" />
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                This is how your name will appear across the platform
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-gray-50 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Need to change your plan?</h3>
            <p className="text-sm text-gray-500">View and manage your subscription settings</p>
          </div>
          <Link
            to="/my-subscription"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            Manage Subscription
          </Link>
        </div>
      </div>
    </div>
  );
}