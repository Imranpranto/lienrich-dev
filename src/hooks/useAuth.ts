import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const signIn = async (email: string, password: string) => {
  if (!email?.trim()) {
    throw new Error('Email is required');
  }
  if (!password?.trim()) {
    throw new Error('Password is required');
  }
  
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password: password.trim()
    });
    
    if (error) {
      // Map Supabase errors to user-friendly messages
      const errorMessage = error.message === 'Invalid login credentials'
        ? 'Invalid email or password'
        : error.message;

      setError(error.message);
      return { error };
    }
    
    if (!data.user) {
      setError('Unable to sign in. Please try again.');
      return { error: new Error('Login failed') };
    }

    setState(prev => ({
      ...prev,
      user: data.user,
      loading: false
    }));
    
    return { data };
  } catch (error) {
    console.error('Sign in error:', error);
    const message = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred. Please try again.';
    setError(message);
    return { error };
  }
};