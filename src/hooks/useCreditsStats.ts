import { useState, useEffect } from 'react';
import { toast } from '../utils/toast';

const STORAGE_KEY = 'credits_stats';
const DEFAULT_CREDITS = 250;
const CACHE_DURATION = 5000; // 5 seconds

interface CreditStats {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  plan: string;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  loading: boolean;
  error: string | null;
}

const defaultStats: CreditStats = {
  totalCredits: DEFAULT_CREDITS,
  usedCredits: 0,
  remainingCredits: DEFAULT_CREDITS,
  plan: 'Trial',
  trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days trial
  subscriptionEndsAt: null,
  loading: false,
  error: null
};

export function useCreditsStats() {
  const [stats, setStats] = useState<CreditStats>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored credits:', error);
      }
    }
    return defaultStats;
  });

  // Save stats to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving credits:', error);
      toast.error('Failed to save credit stats');
    }
  }, [stats]);

  const updateCredits = (amount: number) => {
    setStats(prev => {
      const newUsed = prev.usedCredits + amount;
      const newRemaining = prev.totalCredits - newUsed;
      
      if (newRemaining < 0) {
        toast.error('Insufficient credits');
        return prev;
      }

      return {
        ...prev,
        usedCredits: newUsed,
        remainingCredits: newRemaining,
        updated_at: new Date().toISOString()
      };
    });
  };

  return {
    ...stats,
    updateCredits
  };
}