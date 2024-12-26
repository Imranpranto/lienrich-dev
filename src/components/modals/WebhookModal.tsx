import React from 'react';
import { X, Send, AlertCircle, Code, FileText } from 'lucide-react';
import { useWebhook } from '../../hooks/useWebhook';
import { toast } from '../../utils/toast';
import type { WebhookConfig } from '../../types/webhook';

interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (config: WebhookConfig) => Promise<void>;
}

export default function WebhookModal({ isOpen, onClose, onSend }: WebhookModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const { savedWebhooks, selectedWebhook, selectWebhook, updateConfig } = useWebhook();
  const [selectedType, setSelectedType] = React.useState<'existing' | 'new'>('existing');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [newConfig, setNewConfig] = React.useState<WebhookConfig>(() => ({
    url: '',
    name: '',
    description: '',
    authType: 'none',
    method: 'POST',
    headers: {},
    retryAttempts: 3,
    retryDelay: 1000
  }));

  const [loading, setLoading] = React.useState(false);

  const filteredWebhooks = React.useMemo(() => {
    if (!searchQuery.trim()) return savedWebhooks;
    const query = searchQuery.toLowerCase();
    const filtered = savedWebhooks.filter(webhook => 
      webhook.name.toLowerCase().includes(query) ||
      webhook.description?.toLowerCase().includes(query) ||
      webhook.url.toLowerCase().includes(query)
    );
    return filtered.slice(0, 3); // Limit to 3 results
  }, [savedWebhooks, searchQuery]);

  // Get only first 3 webhooks when not searching
  const displayedWebhooks = React.useMemo(() => {
    return searchQuery.trim() ? filteredWebhooks : savedWebhooks.slice(0, 3);
  }, [savedWebhooks, filteredWebhooks, searchQuery]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSend = async () => {
    setLoading(true);
    setSaving(false);
    try {
      let configToUse: WebhookConfig;
      
      if (selectedType === 'existing') {
        if (!selectedWebhook) {
          throw new Error('Please select a webhook');
        }
        configToUse = selectedWebhook;
      } else {
        if (!newConfig.name?.trim()) {
          throw new Error('Please enter a webhook name');
        }
        configToUse = newConfig;
      }
      
      if (!configToUse.url) {
        throw new Error('Webhook URL is required');
      }

      try {
        new URL(configToUse.url);
      } catch {
        throw new Error('Invalid webhook URL format');
      }

      // Save new webhook config if needed
      if (selectedType === 'new' && newConfig.url) {
        setSaving(true);
        await updateConfig(newConfig);
        setSaving(false);
      }

      // Attempt to send data
      await onSend(configToUse);
      toast.success('Data sent successfully');
      onClose();
    } catch (error) {
      const errorMessage = error.message?.includes('Failed to fetch') 
        ? 'Unable to reach webhook URL. Please check the URL and try again.'
        : error.message || 'Failed to send data';
      toast.error(errorMessage);
      console.error('Webhook send error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div ref={modalRef} className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Send to Webhook</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedType('existing')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  selectedType === 'existing'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-200'
                }`}
              >
                <h4 className="font-medium text-gray-900 mb-1">Use Existing Webhook</h4>
                <p className="text-sm text-gray-500">Send data to a previously configured webhook</p>
              </button>
              <button
                onClick={() => setSelectedType('new')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  selectedType === 'new'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-200'
                }`}
              >
                <h4 className="font-medium text-gray-900 mb-1">Create New Webhook</h4>
                <p className="text-sm text-gray-500">Configure and save a new webhook</p>
              </button>
            </div>

            {selectedType === 'existing' ? (
              savedWebhooks.length > 0 ? (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search webhooks..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {searchQuery && filteredWebhooks.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No webhooks found matching "{searchQuery}"
                    </div>
                  )}
                  {displayedWebhooks.map((webhook) => (
                    <button
                      key={webhook.id}
                      onClick={() => {
                        selectWebhook(webhook);
                        setSelectedType('existing');
                      }}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                        selectedWebhook?.id === webhook.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{webhook.name}</div>
                      <div className="text-sm text-gray-500 truncate">{webhook.url}</div>
                      {webhook.description && (
                        <div className="text-sm text-gray-400 truncate mt-1">{webhook.description}</div>
                      )}
                    </button>
                  ))}
                  {!searchQuery && savedWebhooks.length > 3 && (
                    <div className="text-center py-2 text-sm text-gray-500">
                      {savedWebhooks.length - 3} more webhook{savedWebhooks.length - 3 !== 1 ? 's' : ''} available
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No webhook configured. Please create a new one.
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook URL
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="url"
                    value={newConfig.url}
                    onChange={(e) => setNewConfig({ ...newConfig, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter webhook URL"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={newConfig.name}
                    onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter webhook name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newConfig.description || ''}
                    onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter webhook description"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || 
              (selectedType === 'existing' && !selectedWebhook) || 
              (selectedType === 'new' && (!newConfig.url || !newConfig.name))}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                {saving ? 'Saving...' : 'Sending...'}
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}