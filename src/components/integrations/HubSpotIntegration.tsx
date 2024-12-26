import React, { useState, useEffect } from 'react';
import { Link2, Settings, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { toast } from '../../utils/toast';
import type { HubSpotConfig, SyncConfig } from '../../types/hubspot';
import HubSpotFieldMapping from './HubSpotFieldMapping';
import HubSpotSyncHistory from './HubSpotSyncHistory';
import { config } from '../../config/hubspot';

const defaultSyncConfig: SyncConfig = {
  enabled: false,
  frequency: 'manual',
  updateExisting: true,
  fieldMappings: [
    { sourceField: 'fullName', targetField: 'firstname', isRequired: true },
    { sourceField: 'headline', targetField: 'jobtitle', isRequired: false },
    { sourceField: 'profileUrl', targetField: 'linkedin_url', isRequired: true }
  ]
};

export default function HubSpotIntegration() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [hubspotConfig, setHubspotConfig] = useState<HubSpotConfig | null>(null);
  const [syncConfig, setSyncConfig] = useState<SyncConfig>(defaultSyncConfig);
  const [showFieldMapping, setShowFieldMapping] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadHubSpotConfig();
  }, [user]);

  const loadHubSpotConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('hubspot_config') // This table will be created by the migration
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
        throw error;
      }
      
      if (data) {
        setHubspotConfig(data);
        setConnected(true);
        
        // Load sync config
        const { data: syncData, error: syncError } = await supabase
          .from('hubspot_sync_config')
          .select('*')
          .eq('user_id', user?.id)
          .single();
          
        if (syncError && syncError.code !== 'PGRST116') {
          throw syncError;
        }

        if (syncData) {
          setSyncConfig(syncData.config);
        }
      }
    } catch (error) {
      console.error('Error loading HubSpot config:', error);
      // Don't show error to user for initial load
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    const scope = config.scopes.join(' ');
    
    const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${encodeURIComponent(scope)}`;

    window.location.href = authUrl;
  };

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase
        .from('hubspot_config')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;

      setHubspotConfig(null);
      setConnected(false);
      toast.success('HubSpot disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting HubSpot:', error);
      toast.error('Failed to disconnect HubSpot');
    }
  };

  const handleSyncConfigChange = async (newConfig: Partial<SyncConfig>) => {
    try {
      const updatedConfig = { ...syncConfig, ...newConfig };
      setSyncConfig(updatedConfig);

      const { error } = await supabase
        .from('hubspot_sync_config')
        .upsert({
          user_id: user?.id,
          config: updatedConfig
        });

      if (error) throw error;
      toast.success('Sync settings saved successfully');
    } catch (error) {
      console.error('Error saving sync config:', error);
      toast.error('Failed to save sync settings');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png"
              alt="HubSpot"
              className="w-8 h-8"
            />
            <div>
              <h3 className="font-medium text-gray-900">HubSpot</h3>
              <p className="text-sm text-gray-500">Sync leads to HubSpot CRM</p>
            </div>
          </div>
          
          {!loading && (
            connected ? (
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                  <Check className="h-4 w-4" />
                  Connected
                </span>
                <button
                  onClick={handleDisconnect}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff7a59] text-white rounded-lg hover:bg-[#ff8f73] transition-colors"
              >
                <Link2 className="h-4 w-4" />
                Connect HubSpot
              </button>
            )
          )}
        </div>
      </div>

      {connected && (
        <>
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-medium text-gray-900">Sync Settings</h4>
              <button
                onClick={() => setShowFieldMapping(!showFieldMapping)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                <Settings className="h-4 w-4" />
                Configure Fields
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Automatic Sync</label>
                  <p className="text-sm text-gray-500">Automatically sync new leads to HubSpot</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncConfig.enabled}
                    onChange={(e) => handleSyncConfigChange({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {syncConfig.enabled && (
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Sync Frequency</label>
                    <p className="text-sm text-gray-500">How often to sync leads</p>
                  </div>
                  <select
                    value={syncConfig.frequency}
                    onChange={(e) => handleSyncConfigChange({ frequency: e.target.value as any })}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="manual">Manual</option>
                    <option value="hourly">Every Hour</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Update Existing Contacts</label>
                  <p className="text-sm text-gray-500">Update contact if LinkedIn URL matches</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncConfig.updateExisting}
                    onChange={(e) => handleSyncConfigChange({ updateExisting: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          {showFieldMapping && (
            <HubSpotFieldMapping
              fieldMappings={syncConfig.fieldMappings}
              onUpdate={(mappings) => handleSyncConfigChange({ fieldMappings: mappings })}
            />
          )}

          <HubSpotSyncHistory userId={user?.id} />
        </>
      )}
    </div>
  );
}