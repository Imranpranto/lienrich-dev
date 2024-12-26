import React from 'react';
import { X, Check, CreditCard, ArrowRight } from 'lucide-react';
import { pricingTiers } from '../../data/pricingTiers';

interface PricingPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

export default function PricingPlanModal({ isOpen, onClose, currentPlan }: PricingPlanModalProps) {
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = React.useState<string>(currentPlan);
  const [showConfirmation, setShowConfirmation] = React.useState(false);

  if (!isOpen) return null;

  const calculateYearlyPrice = (monthlyPrice: number) => {
    const yearlyDiscount = 0.1; // 10% discount
    return monthlyPrice * 12 * (1 - yearlyDiscount);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    // Handle plan change confirmation
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {!showConfirmation ? (
          <>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Change Subscription Plan</h2>
                <p className="text-gray-500">Select a plan that best fits your needs</p>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`relative bg-white rounded-xl transition-all duration-200 hover:shadow-lg border-2 ${
                      tier.name === currentPlan
                        ? 'border-indigo-600'
                        : 'border-gray-200'
                    }`}
                  >
                    {tier.name === currentPlan && (
                      <div className="absolute -top-3 left-4 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded">
                        Current Plan
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{tier.name}</h3>
                      <p className="text-gray-500 mb-4">{tier.description}</p>

                      {!tier.isEnterprise ? (
                        <div className="mb-6">
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-gray-900">
                              ${billingCycle === 'monthly' ? tier.price : Math.round(calculateYearlyPrice(tier.price) / 12)}
                            </span>
                            <span className="text-gray-500 ml-2">/month</span>
                          </div>
                          {billingCycle === 'yearly' && (
                            <div className="text-green-600 text-sm mt-1">
                              Save ${Math.round(tier.price * 12 * 0.1)} yearly
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mb-6">
                          <div className="text-3xl font-bold text-gray-900">Custom</div>
                          <div className="text-gray-500 mt-1">Contact sales for pricing</div>
                        </div>
                      )}

                      <div className="mb-6">
                        <div className="flex items-center gap-2 text-gray-900">
                          <CreditCard className="h-5 w-5 text-indigo-600" />
                          <span className="font-medium">
                            {tier.isEnterprise ? 'Flexible allocation' : `${tier.credits.toLocaleString()} credits`}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handlePlanSelect(tier.name)}
                        disabled={tier.name === currentPlan}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                          tier.name === currentPlan
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : tier.isEnterprise
                            ? 'bg-gray-900 text-white hover:bg-gray-800'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {tier.name === currentPlan ? 'Current Plan' : tier.isEnterprise ? 'Contact Sales' : 'Select Plan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="p-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Plan Change</h3>
              <p className="text-gray-500">
                You are about to change your plan from {currentPlan} to {selectedPlan}
              </p>
            </div>

            <div className="max-w-md mx-auto bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">New Plan</span>
                <span className="font-medium text-gray-900">{selectedPlan}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Billing Cycle</span>
                <span className="font-medium text-gray-900 capitalize">{billingCycle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Next Billing Date</span>
                <span className="font-medium text-gray-900">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Confirm Change
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}