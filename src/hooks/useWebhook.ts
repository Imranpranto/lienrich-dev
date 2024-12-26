import { useState, useCallback, useEffect } from 'react';
import { toast } from '../utils/toast';
import type { WebhookConfig, WebhookDelivery } from '../types/webhook';

const STORAGE_KEY = 'webhooks';

const DEFAULT_CONFIG: WebhookConfig = {
  url: '',
  name: '',
  authType: 'none',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  retryAttempts: 3,
  retryDelay: 1000
};

export function useWebhook() {
  const [config, setConfig] = useState<WebhookConfig>(DEFAULT_CONFIG);
  const [savedWebhooks, setSavedWebhooks] = useState<WebhookConfig[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);

  // Load saved webhooks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedWebhooks(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading webhooks:', error);
      }
    }
  }, []);

  const selectWebhook = useCallback((webhook: WebhookConfig) => {
    setSelectedWebhook(webhook);
    setConfig(webhook);
  }, []);

  const updateConfig = useCallback(async (newConfig: WebhookConfig) => {
    // Validate webhook name
    if (!newConfig.name?.trim()) {
      toast.error('Webhook name is required');
      return;
    }

    try {
      const webhookData = {
        id: newConfig.id || crypto.randomUUID(),
        name: newConfig.name.trim(),
        url: newConfig.url,
        description: newConfig.description?.trim(),
        authType: newConfig.authType,
        authValue: newConfig.authValue,
        method: newConfig.method,
        headers: newConfig.headers,
        retryAttempts: newConfig.retryAttempts,
        retryDelay: newConfig.retryDelay,
        createdAt: newConfig.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedWebhooks: WebhookConfig[];
      if (webhookData.id && savedWebhooks.some(w => w.id === webhookData.id)) {
        // Update existing webhook
        updatedWebhooks = savedWebhooks.map(w => 
          w.id === webhookData.id ? webhookData : w
        );
      } else {
        // Add new webhook
        updatedWebhooks = [...savedWebhooks, webhookData];
      }

      setSavedWebhooks(updatedWebhooks);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWebhooks));
      setConfig(webhookData);
      toast.success('Webhook saved successfully');
      return webhookData;
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast.error('Failed to save webhook');
      throw error;
    }
  }, [savedWebhooks]);

  const deleteWebhook = useCallback(async (id: string) => {
    try {
      const updatedWebhooks = savedWebhooks.filter(webhook => webhook.id !== id);
      setSavedWebhooks(updatedWebhooks);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWebhooks));
      toast.success('Webhook deleted successfully');
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast.error('Failed to delete webhook');
    }
  }, [savedWebhooks]);

  const addDelivery = useCallback((delivery: WebhookDelivery) => {
    setDeliveries(prev => [delivery, ...prev].slice(0, 10));
  }, []);

  const sendWebhook = useCallback(async (data: any, webhookConfig: WebhookConfig) => {
    const delivery: WebhookDelivery = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      responseStatus: 0,
      message: 'Initiating webhook request'
    };
    addDelivery(delivery);

    try {
      if (!webhookConfig.url) {
        throw new Error('Webhook URL is required');
      }

      if (!data || (Array.isArray(data) && data.length === 0)) { 
        throw new Error('No data available to send');
      }

      // Validate URL format
      try {
        new URL(webhookConfig.url);
      } catch {
        throw new Error('Invalid webhook URL format');
      }

      let attempt = 0;
      while (attempt <= webhookConfig.retryAttempts) {
        try { 
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...webhookConfig.headers
          };
          
          if (webhookConfig.authType === 'basic' && webhookConfig.authValue) {
            headers['Authorization'] = `Basic ${btoa(webhookConfig.authValue)}`;
          } else if (webhookConfig.authType === 'bearer' && webhookConfig.authValue) {
            headers['Authorization'] = `Bearer ${webhookConfig.authValue}`;
          }
          
          const payload = {
            data: Array.isArray(data) ? data : [data],
            source: 'LiEnrich',
            timestamp: new Date().toISOString()
          };

          const response = await fetch(webhookConfig.url, {
            method: webhookConfig.method,
            headers,
            body: JSON.stringify(payload),
            credentials: 'omit'
          });

          const responseStatus = response.status;
          const responseText = await response.text();
          
          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = responseText;
          }

          if (responseStatus >= 200 && responseStatus < 300) {
            delivery.status = 'success';
            delivery.responseData = responseData;
            addDelivery({ ...delivery });
            return delivery;
          }

          throw new Error(`Request failed with status ${responseStatus}: ${responseText}`);
        } catch (error) {
          const errorDetails = {
            message: error.message || 'Unknown error occurred',
            type: error.name,
            attempt: attempt + 1,
            timestamp: new Date().toISOString()
          };
          console.error('Webhook request error:', errorDetails);

          if (attempt === webhookConfig.retryAttempts) {
            const finalError = error.message === 'Failed to fetch' 
              ? 'Unable to reach endpoint. Please verify the URL and server accessibility.'
              : error.message;
              
            delivery.status = 'error';
            delivery.message = finalError;
            addDelivery({ ...delivery });
            throw new Error(finalError);
          }
          
          delivery.status = 'retrying'; 
          delivery.message = `Retrying... Attempt ${attempt + 1}/${webhookConfig.retryAttempts}`;
          addDelivery({ ...delivery });

          await new Promise(resolve => setTimeout(resolve, webhookConfig.retryDelay));
          attempt++;
        }
      }
    } catch (error) {
      delivery.status = 'error'; 
      delivery.message = error.message;
      addDelivery({ ...delivery });
      throw error;
    }
  }, [addDelivery]);

  const testWebhook = useCallback(async () => {
    const testData = { test: true, timestamp: new Date().toISOString(), message: 'Test webhook request' };
    try {
      if (!config.url) {
        throw new Error('Please enter a webhook URL before testing');
      }
      
      try {
        new URL(config.url);
      } catch {
        throw new Error('Invalid webhook URL format');
      }

      await sendWebhook(testData, config);
      toast.success('Webhook test completed successfully');
    } catch (error) {
      toast.error('Webhook test failed: ' + error.message);
      throw error;
    }
  }, [sendWebhook, config]);

  return {
    config,
    savedWebhooks,
    selectedWebhook,
    selectWebhook,
    updateConfig,
    deleteWebhook,
    testWebhook,
    sendWebhook,
    deliveries
  };
}