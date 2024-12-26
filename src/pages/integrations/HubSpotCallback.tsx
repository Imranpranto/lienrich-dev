import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { config } from '../../config/hubspot';
import { toast } from '../../utils/toast';
import { Loader2 } from 'lucide-react';

export default function HubSpotCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (!code) {
          throw new Error('No authorization code received');
        }

        if (!user) {
          throw new Error('User not authenticated');
        }

        // Exchange code for tokens
        const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: config.redirectUri,
            code
          })
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          throw new Error(errorData.message || 'Failed to exchange authorization code');
        }

        const tokenData = await tokenResponse.json();

        // Save HubSpot configuration
        const { error: dbError } = await supabase
          .from('hubspot_config')
          .upsert({
            user_id: user.id,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: Date.now() + (tokenData.expires_in * 1000),
            portal_id: tokenData.hub_id,
            scope: tokenData.scope.split(' ')
          });

        if (dbError) throw dbError;

        // Create default sync config if it doesn't exist
        const { error: syncError } = await supabase
          .from('hubspot_sync_config')
          .upsert({
            user_id: user.id,
            config: {
              enabled: false,
              frequency: 'manual',
              updateExisting: true,
              fieldMappings: [
                { sourceField: 'fullName', targetField: 'firstname', isRequired: true },
                { sourceField: 'headline', targetField: 'jobtitle', isRequired: false },
                { sourceField: 'profileUrl', targetField: 'linkedin_url', isRequired: true }
              ]
            }
          });

        if (syncError) throw syncError;

        toast.success('Successfully connected to HubSpot');
        navigate('/integrations');
      } catch (error) {
        console.error('HubSpot callback error:', error);
        setError(error instanceof Error ? error.message : 'Failed to connect to HubSpot');
        setTimeout(() => navigate('/integrations'), 3000);
      }
    };

    handleCallback();
  }, [user, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting back to integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Connecting to HubSpot</h3>
        <p className="text-gray-600">Please wait while we complete the connection...</p>
      </div>
    </div>
  );
}