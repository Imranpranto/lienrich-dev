export interface WebhookConfig {
  url: string;
  name: string;
  id?: string;
  description?: string;
  authType: 'none' | 'basic' | 'bearer';
  authValue?: string;
  method: 'POST' | 'PUT';
  headers: Record<string, string>;
  retryAttempts: number;
  retryDelay: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WebhookDelivery {
  id: string;
  timestamp: string;
  status: 'pending' | 'success' | 'error' | 'retrying';
  message?: string;
  responseStatus?: number;
  responseData?: string;
}

export interface WebhookState {
  config: WebhookConfig;
  savedWebhooks: WebhookConfig[];
  deliveries: WebhookDelivery[];
}