import React from 'react';
import { Cable } from 'lucide-react';
import WebhookCard from '../components/sidebar/WebhookCard';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../utils/toast';

export default function Integrations() {
  const { user } = useAuth();

  React.useEffect(() => {
    if (!user) {
      toast.error('Please sign in to access integrations');
      return;
    }
  }, [user]);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Integrations</h1>
          <p className="text-gray-500">Manage your external integrations and webhooks</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Cable className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Webhook Integration</h2>
                <p className="text-sm text-gray-500">Configure webhooks to receive data updates</p>
              </div>
            </div>
            <WebhookCard />
          </div>
          
          <div className="mt-8 p-6 bg-gray-50 rounded-xl text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Need More Integrations?</h3>
            <p className="text-gray-600">We're constantly adding new integration options.</p>
            <p className="text-gray-600">Contact support to request specific integrations for your needs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}