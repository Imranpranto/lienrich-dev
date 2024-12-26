import { useState, useEffect } from 'react';
import { toast } from '../utils/toast';
import type { Lead, Audience, LeadLimit } from '../types/leads';

const STORAGE_KEY = 'user_leads';
const AUDIENCE_KEY = 'user_audiences';

interface LeadsState {
  leads: Lead[];
  audiences: Audience[];
}

function getStoredData(): LeadsState {
  try {
    const storedLeads = localStorage.getItem(STORAGE_KEY);
    const storedAudiences = localStorage.getItem(AUDIENCE_KEY);
    return {
      leads: storedLeads ? JSON.parse(storedLeads) : [],
      audiences: storedAudiences ? JSON.parse(storedAudiences) : []
    };
  } catch (error) {
    console.error('Error reading stored leads:', error);
    return { leads: [], audiences: [] };
  }
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const { leads, audiences } = getStoredData();
    setLeads(leads);
    setAudiences(audiences);
    setLoading(false);
  }, []);

  const createAudience = async (name: string, description?: string) => {
    try {
      if (!name.trim()) {
        throw new Error('Audience name is required');
      }

      if (name.length > 100) {
        throw new Error('Audience name must be less than 100 characters');
      }

      // Check for duplicate names
      if (audiences.some(a => a.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('An audience with this name already exists');
      }

      const newAudience: Audience = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description?.trim(),
        createdAt: new Date().toISOString(),
        leads: [],
        totalLeads: 0
      };

      const updatedAudiences = [...audiences, newAudience];
      setAudiences(updatedAudiences);
      localStorage.setItem(AUDIENCE_KEY, JSON.stringify(updatedAudiences));

      toast.success('Audience created successfully');
      return newAudience;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create audience';
      toast.error(message);
      throw error;
    }
  };

  const addLeadsToAudience = async (audienceId: string, newLeads: Partial<Lead>[]) => {
    try {
      const audience = audiences.find(a => a.id === audienceId);
      if (!audience) {
        throw new Error('Audience not found');
      }

      const leadsToAdd = newLeads.map(lead => ({
        id: crypto.randomUUID(),
        audienceId,
        fullName: lead.fullName || '',
        profileUrl: lead.profileUrl || '',
        headline: lead.headline,
        sourceOperation: lead.sourceOperation || 'manual',
        createdAt: new Date().toISOString()
      }));

      // Update audience
      const updatedAudiences = audiences.map(a => {
        if (a.id === audienceId) {
          return {
            ...a,
            leads: [...a.leads, ...leadsToAdd],
            totalLeads: a.leads.length + leadsToAdd.length
          };
        }
        return a;
      });

      setAudiences(updatedAudiences);
      localStorage.setItem(AUDIENCE_KEY, JSON.stringify(updatedAudiences));

      // Update leads
      const updatedLeads = [...leads, ...leadsToAdd];
      setLeads(updatedLeads);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));

      toast.success('Leads added successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add leads';
      toast.error(message);
      throw error;
    }
  };

  const deleteAudience = async (id: string) => {
    try {
      const updatedAudiences = audiences.filter(a => a.id !== id);
      setAudiences(updatedAudiences);
      localStorage.setItem(AUDIENCE_KEY, JSON.stringify(updatedAudiences));

      // Remove leads associated with this audience
      const updatedLeads = leads.filter(l => l.audienceId !== id);
      setLeads(updatedLeads);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));

      toast.success('Audience deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete audience';
      toast.error(message);
      throw error;
    }
  };

  const refreshLeads = async () => {
    try {
      const { leads, audiences } = getStoredData();
      setLeads(leads);
      setAudiences(audiences);
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh leads';
      setError(message);
      throw error;
    }
  };

  return {
    leads,
    audiences,
    leadLimit: null, // No limit in local storage version
    error,
    loading,
    createAudience,
    deleteAudience,
    addLeadsToAudience,
    refreshLeads
  };
}