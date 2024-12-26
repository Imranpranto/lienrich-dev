import { config } from '../config/hubspot';
import { supabase } from '../lib/supabase';
import type { HubSpotConfig, HubSpotContact, SyncLog } from '../types/hubspot';

const BASE_URL = 'https://api.hubapi.com';

export async function createOrUpdateContact(contact: HubSpotContact, accessToken: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/crm/v3/objects/contacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        firstname: contact.firstname,
        lastname: contact.lastname,
        jobtitle: contact.jobtitle,
        company: contact.company,
        linkedin_url: contact.linkedin_url,
        source: 'LiEnrich'
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create/update contact');
  }

  const data = await response.json();
  return data.id;
}

export async function refreshAccessToken(refreshToken: string): Promise<HubSpotConfig> {
  const response = await fetch(`${BASE_URL}/oauth/v1/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
    portalId: data.hub_id,
    scope: data.scope.split(' ')
  };
}

export async function logSync(userId: string, log: Omit<SyncLog, 'id' | 'timestamp'>): Promise<void> {
  await supabase
    .from('hubspot_sync_logs')
    .insert({
      user_id: userId,
      status: log.status,
      operation: log.operation,
      details: log.details,
      contact_id: log.contactId
    });
}

export async function getContactByLinkedInUrl(linkedinUrl: string, accessToken: string): Promise<HubSpotContact | null> {
  const response = await fetch(
    `${BASE_URL}/crm/v3/objects/contacts/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: 'linkedin_url',
            operator: 'EQ',
            value: linkedinUrl
          }]
        }]
      })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to search contacts');
  }

  const data = await response.json();
  if (data.total === 0) return null;

  const contact = data.results[0];
  return {
    id: contact.id,
    firstname: contact.properties.firstname,
    lastname: contact.properties.lastname,
    jobtitle: contact.properties.jobtitle,
    company: contact.properties.company,
    linkedin_url: contact.properties.linkedin_url
  };
}