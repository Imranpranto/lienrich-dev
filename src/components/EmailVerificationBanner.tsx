import React, { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../utils/toast';

export default function EmailVerificationBanner() {
  const [loading, setLoading] = useState(false);
  const { resendVerificationEmail } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendVerificationEmail();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-100">
      <div className="max-w-7xl mx-auto py-3 px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              Please verify your email address to access all features
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-sm font-medium text-amber-800 hover:text-amber-900 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Resend verification email'}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-amber-600 hover:text-amber-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}