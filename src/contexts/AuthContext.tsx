import React, { createContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { initializeDatabase } from '../utils/database';
import { toast } from '../utils/toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export { AuthContext };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    emailVerified: false
  });
  const [error] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        // Check active session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          const emailVerified = session.user.email_confirmed_at != null;
          
          setState(prev => ({
            ...prev,
            user: session.user,
            emailVerified,
            loading: true // Keep loading true while we initialize
          }));

          const dbInitialized = await initializeDatabase();
          if (!dbInitialized) {
            console.error('Database initialization failed');
            toast.error('Failed to initialize application data. Please try refreshing the page.');
            // Sign out user if database initialization fails
            await supabase.auth.signOut();
            setState(prev => ({ 
              ...prev, 
              user: null,
              loading: false 
            }));
            return;
          }
        }

        if (mounted) {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (err) {
        console.error('Session check error:', err);
        if (mounted) {
          setState(prev => ({ ...prev, loading: false }));
          toast.error('Failed to check login status. Please refresh the page.');
        }
      }
    }

    // Initialize session
    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setState(prev => ({ ...prev, loading: true }));

      if (event === 'SIGNED_IN' && session?.user) {
          const dbInitialized = await initializeDatabase();
          if (!dbInitialized) {
            console.error('Database initialization failed on sign in');
            if (mounted) {
              toast.error('Failed to initialize application data. Please try signing in again.');
              // Sign out user if database initialization fails
              await supabase.auth.signOut();
              setState(prev => ({ 
                ...prev, 
                user: null,
                loading: false 
              }));
            }
            return;
          }
          
          if (mounted) {
            setState(prev => ({
              ...prev,
              user: session.user,
              emailVerified: session.user.email_confirmed_at != null,
              loading: false
            }));
          }
      } else {
        if (mounted) {
          setState(prev => ({
            ...prev,
            user: session?.user ?? null,
            emailVerified: session?.user?.email_confirmed_at != null,
            loading: false
          }));
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password.trim()
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error('Login failed');
      }

      setState(prev => ({
        ...prev,
        user: data.user,
        emailVerified: data.user.email_confirmed_at != null
      }));
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Attempting signup for:', email);
      
      // First check if user exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (existingUser.user) {
        throw new Error('This email is already registered. Please sign in instead.');
      }

      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { email },
          emailRedirectTo: window.location.origin + '/auth'
        }
      });
      
      if (error) {
        console.error('Signup API error:', error);
        throw error;
      }
      
      if (!user) {
        console.error('No user returned from signup');
        throw new Error('Failed to create account');
      }

      console.log('User created successfully:', user.id);

      toast.success('Account created successfully!');
      
      console.log('Attempting automatic sign in after signup');
      // Sign in immediately after signup
      await signIn(email, password);

    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      if (error instanceof Error && error.message.includes('User already registered')) {
        throw new Error('This email is already registered. Please sign in instead.');
      }
      
      throw error instanceof Error 
        ? error 
        : new Error('Failed to create account. Please try again.');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setState(prev => ({ ...prev, user: null }));
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      signIn,
      signUp,
      signOut,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
}
