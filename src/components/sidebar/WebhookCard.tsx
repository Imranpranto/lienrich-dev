import React, { useState } from 'react';
import { Cable, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useWebhook } from '../../hooks/useWebhook';
import { toast } from '../../utils/toast';
import type { WebhookConfig } from '../../types/webhook';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  webhookName: string;
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, webhookName }: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Webhook</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete the webhook "{webhookName}"? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Webhook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WebhookCard() {
  const { config, savedWebhooks, updateConfig, testWebhook, deleteWebhook } = useWebhook();
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = React.useState(false);
  const [localConfig, setLocalConfig] = React.useState<WebhookConfig>(config);
  const [selectedWebhook, setSelectedWebhook] = React.useState<WebhookConfig | null>(null);
  const [webhookToDelete, setWebhookToDelete] = React.useState<WebhookConfig | null>(null);

  const handleSave = () => {
    updateConfig(localConfig);
    setIsEditing(false);
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await testWebhook();
      toast.success('Webhook test successful!');
    } catch (error) {
      toast.error(`Webhook test failed: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!webhookToDelete?.id) return;

    try {
      await deleteWebhook(webhookToDelete.id);
      toast.success('Webhook deleted successfully');
      setWebhookToDelete(null);
    } catch (error) {
      toast.error('Failed to delete webhook');
    }
  };

  if (!isEditing && savedWebhooks.length === 0) {
    return (
      <button
        onClick={() => { setIsEditing(true); setLocalConfig(config); }}
        className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors group"
      >
        <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-indigo-600">
          <Plus className="h-6 w-6" />
          <span className="text-sm font-medium">Add Webhook</span>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cable className="h-5 w-5 text-indigo-600" />
            <h3 className="font-medium text-gray-900">Webhook Integration</h3>
            <span className="text-xs text-gray-500">({savedWebhooks.length} saved)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsEditing(true);
                setLocalConfig(config);
                setSelectedWebhook(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Webhook
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                {selectedWebhook ? 'Edit Webhook' : 'New Webhook'}
              </h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={localConfig.name}
                onChange={(e) => setLocalConfig({ ...localConfig, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="My Webhook"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                value={localConfig.url}
                onChange={(e) => setLocalConfig({ ...localConfig, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://your-webhook.com/endpoint"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={localConfig.description || ''}
                onChange={(e) => setLocalConfig({ ...localConfig, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter webhook description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authentication
              </label>
              <select
                value={localConfig.authType}
                onChange={(e) => setLocalConfig({ ...localConfig, authType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
              >
                <option value="none">None</option>
                <option value="basic">Basic Auth</option>
                <option value="bearer">Bearer Token</option>
              </select>

              {localConfig.authType !== 'none' && (
                <input
                  type="password"
                  value={localConfig.authValue || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, authValue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={localConfig.authType === 'basic' ? 'username:password' : 'Bearer token'}
                />
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {savedWebhooks.map((webhook) => (
              <div 
                key={webhook.id} 
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedWebhook?.id === webhook.id
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : 'border-gray-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{webhook.name}</h4>
                    <p className="text-sm text-gray-500 truncate">{webhook.url}</p>
                    {webhook.description && (
                      <p className="text-sm text-gray-500 mt-1">{webhook.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setLocalConfig(webhook);
                        setSelectedWebhook(webhook);
                        setIsEditing(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50"
                      title="Edit webhook"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setWebhookToDelete(webhook)}
                      className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Delete webhook"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">Method:</span>
                    <span className="font-medium text-gray-900">{webhook.method}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">Auth:</span>
                    <span className="font-medium text-gray-900 capitalize">{webhook.authType}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedWebhook(webhook);
                      handleTest();
                    }}
                    disabled={isTesting}
                    className="px-3 py-1.5 text-sm text-indigo-600 bg-white rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    {isTesting ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={!!webhookToDelete}
        onClose={() => setWebhookToDelete(null)}
        onConfirm={handleDelete}
        webhookName={webhookToDelete?.name || ''}
      />

    </div>
  );
}