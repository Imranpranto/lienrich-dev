import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { SyncLog } from '../../types/hubspot';

interface HubSpotSyncHistoryProps {
  userId?: string;
}

export default function HubSpotSyncHistory({ userId }: HubSpotSyncHistoryProps) {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadSyncHistory();
  }, [userId]);

  const loadSyncHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('hubspot_sync_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading sync history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h4 className="font-medium text-gray-900 mb-4">Sync History</h4>
      
      {logs.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No sync history available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-4">
              <div className={`p-2 rounded-full ${
                log.status === 'success' 
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-600'
              }`}>
                {log.status === 'success' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  {log.operation === 'create' ? 'Created new contact' : 'Updated contact'}
                  {log.contactId && (
                    <a
                      href={`https://app.hubspot.com/contacts/${log.contactId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-indigo-600 hover:text-indigo-700"
                    >
                      View in HubSpot →
                    </a>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
                {log.status === 'error' && (
                  <p className="text-xs text-red-600 mt-1">{log.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}