import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({ 
        ...prev, 
        user: session?.user ?? null, 
        loading: false,
        emailVerified: true // Remove email verification check
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await initializeDatabase(); // Initialize database when user signs in
      }
      setState(prev => ({ 
        ...prev, 
        user: session?.user ?? null,
        emailVerified: true // Remove email verification check
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password.trim()
      });
      
      if (error) {
        return { error };
      }
      
      if (!data.user) {
        return { error: new Error('Login failed') };
      }

      setState(prev => ({
        ...prev,
        user: data.user,
        emailVerified: true
      }));
      
      return { data };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
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