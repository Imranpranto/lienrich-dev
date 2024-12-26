import React from 'react';
import { X, Calendar, CreditCard, Clock } from 'lucide-react';

interface BillingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: string;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  subscriptionStartAt?: string | null;
}

export default function BillingDetailsModal({
  isOpen,
  onClose,
  plan,
  trialEndsAt,
  subscriptionEndsAt,
  subscriptionStartAt
}: BillingDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Billing Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <CreditCard className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Current Plan</h4>
              <p className="text-sm text-gray-500">{plan}</p>
            </div>
          </div>

          {plan === 'Trial' ? (
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Trial Period</h4>
                <p className="text-sm text-gray-500">
                  {trialEndsAt
                    ? `Ends on ${new Date(trialEndsAt).toLocaleDateString()}`
                    : 'Trial period active'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {subscriptionStartAt && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Current Period</h4>
                    <p className="text-sm text-gray-500">
                      Started on {new Date(subscriptionStartAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {subscriptionEndsAt && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Next Billing</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(subscriptionEndsAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Your subscription will {plan === 'Trial' ? 'end' : 'automatically renew'} on{' '}
              {new Date(plan === 'Trial' ? trialEndsAt! : subscriptionEndsAt!).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}