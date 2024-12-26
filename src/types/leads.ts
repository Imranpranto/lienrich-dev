export interface Lead {
  id: string;
  audienceId?: string;
  fullName: string;
  profileUrl: string;
  headline?: string;
  sourceOperation: string;
  createdAt?: string;
}

export interface Audience {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  leads: Lead[];
  totalLeads: number;
}

export interface LeadLimit {
  plan: string;
  used: number;
  total: number;
  remaining: number;
}