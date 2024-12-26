import { useState } from 'react';
import { toast } from '../utils/toast';

const STORAGE_KEY = 'user_credits';
const DEFAULT_CREDITS = 250;

interface UseCreditsResult {
  deductCredits: (amount: number, operation: string, details?: any) => Promise<boolean>;
  loading: boolean;
}

interface CreditState {
  total: number;
  used: number;
  remaining: number;
}

function getStoredCredits(): CreditState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading stored credits:', error);
  }
  
  return {
    total: DEFAULT_CREDITS,
    used: 0,
    remaining: DEFAULT_CREDITS
  };
}

export function useCredits(): UseCreditsResult {
  const [loading, setLoading] = useState(false);

  const deductCredits = async (amount: number, operation: string, details: any = {}) => {
    if (amount <= 0) return true;

    setLoading(true);
    try {
      const currentCredits = getStoredCredits();
      
      if (currentCredits.remaining < amount) {
        throw new Error(`Insufficient credits. You need ${amount} credits but have ${currentCredits.remaining} remaining.`);
      }

      const updatedCredits = {
        total: currentCredits.total,
        used: currentCredits.used + amount,
        remaining: currentCredits.remaining - amount
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCredits));
      return true;
    } catch (error) {
      console.error('Error deducting credits:', error);
      
      let errorMessage = 'Failed to deduct credits';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deductCredits, loading };
}