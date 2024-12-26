import React, { createContext, useContext, useState } from 'react';
import type { LinkedInProfile } from '../types/linkedin';

export interface Audience {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  leads: LinkedInProfile[];
}

interface LeadsContextType {
  leads: LinkedInProfile[];
  audiences: Audience[];
  addLeads: (newLeads: LinkedInProfile[]) => void;
  removeLeads: (leadIds: string[]) => void;
  createAudience: (name: string, description: string) => void;
  updateAudience: (id: string, updates: Partial<Audience>) => void;
  deleteAudience: (id: string) => void;
  addLeadsToAudience: (audienceId: string, leads: LinkedInProfile[]) => void;
  removeLeadsFromAudience: (audienceId: string, leadIds: string[]) => void;
}

const LeadsContext = createContext<LeadsContextType | null>(null);

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<LinkedInProfile[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);

  const addLeads = (newLeads: LinkedInProfile[]) => {
    setLeads(prev => {
      const uniqueLeads = newLeads.filter(
        newLead => !prev.some(lead => lead.profileURL === newLead.profileURL)
      );
      return [...prev, ...uniqueLeads];
    });
  };

  const removeLeads = (leadIds: string[]) => {
    setLeads(prev => prev.filter(lead => !leadIds.includes(lead.profileURL)));
  };

  const createAudience = (name: string, description: string) => {
    const newAudience: Audience = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: new Date().toISOString(),
      leads: []
    };
    setAudiences(prev => [...prev, newAudience]);
  };

  const updateAudience = (id: string, updates: Partial<Audience>) => {
    setAudiences(prev => prev.map(audience => 
      audience.id === id ? { ...audience, ...updates } : audience
    ));
  };

  const deleteAudience = (id: string) => {
    setAudiences(prev => prev.filter(audience => audience.id !== id));
  };

  const addLeadsToAudience = (audienceId: string, leadsToAdd: LinkedInProfile[]) => {
    setAudiences(prev => prev.map(audience => {
      if (audience.id !== audienceId) return audience;
      const uniqueLeads = leadsToAdd.filter(
        newLead => !audience.leads.some(lead => lead.profileURL === newLead.profileURL)
      );
      return {
        ...audience,
        leads: [...audience.leads, ...uniqueLeads]
      };
    }));
  };

  const removeLeadsFromAudience = (audienceId: string, leadIds: string[]) => {
    setAudiences(prev => prev.map(audience => {
      if (audience.id !== audienceId) return audience;
      return {
        ...audience,
        leads: audience.leads.filter(lead => !leadIds.includes(lead.profileURL))
      };
    }));
  };

  return (
    <LeadsContext.Provider value={{
      leads,
      audiences,
      addLeads,
      removeLeads,
      createAudience,
      updateAudience,
      deleteAudience,
      addLeadsToAudience,
      removeLeadsFromAudience
    }}>
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
}