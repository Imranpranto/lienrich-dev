export interface HubSpotConfig {
  id?: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  portalId: string;
  scope: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HubSpotContact {
  id?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  jobtitle?: string;
  linkedin_url?: string;
  source?: string;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  isRequired: boolean;
  defaultValue?: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  status: 'success' | 'error';
  operation: 'create' | 'update';
  details: string;
  contactId?: string;
}

export interface SyncConfig {
  enabled: boolean;
  frequency: 'manual' | 'hourly' | 'daily' | 'weekly';
  updateExisting: boolean;
  fieldMappings: FieldMapping[];
  lastSyncAt?: string;
}