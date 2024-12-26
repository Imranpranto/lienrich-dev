import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from '../../utils/toast';
import { Loader2 } from 'lucide-react';

export default function SocialLoginButtons() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: 'https://app.lienrich.com/auth'
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : (
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            className="w-5 h-5"
          />
        )}
        <span className="text-sm font-medium text-gray-700">
          {loading ? 'Signing in...' : 'Continue with Google'}
        </span>
      </button>
    </div>
  );
}