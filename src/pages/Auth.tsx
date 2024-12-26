import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import SignUpForm from '../components/auth/SignUpForm';
import Logo from '../components/Logo';
import { Check } from 'lucide-react';

export default function Auth() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 grid lg:grid-cols-2 relative">
      
      <div className="hidden lg:block relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c')] bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <Logo theme="dark" />
          
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold mb-6">
              Unlock the Power of LinkedIn Data Enrichment
            </h1>
            <p className="text-lg text-white/90">
              Extract valuable insights and generate qualified leads from LinkedIn profiles, posts, and company pages - all without logging in.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium">Start Free Trial</h3>
                <p className="text-sm text-white/75">250 credits for 7 days</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium">No Credit Card Required</h3>
                <p className="text-sm text-white/75">Get started instantly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto">
          <div className="flex justify-center lg:hidden mb-8">
            <Logo />
          </div>
          
          <div className="bg-white shadow-xl rounded-2xl p-8">
            {mode === 'login' ? (
              <LoginForm />
            ) : (
              <SignUpForm />
            )}
            
            <div className="mt-6 text-center text-sm">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Sign up for free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}