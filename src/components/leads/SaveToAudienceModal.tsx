import React, { useState } from 'react';
import { X, Plus, Users, RefreshCw } from 'lucide-react';
import { useLeads } from '../../hooks/useLeads';
import type { Lead } from '../../types/leads';
import { toast } from '../../utils/toast';

interface SaveToAudienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  sourceOperation: string;
}

export default function SaveToAudienceModal({ isOpen, onClose, leads, sourceOperation }: SaveToAudienceModalProps) {
  const { audiences, createAudience, addLeadsToAudience, leadLimit, refreshLeads } = useLeads();
  const [selectedAudienceId, setSelectedAudienceId] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAudienceName, setNewAudienceName] = useState('');
  const [newAudienceDescription, setNewAudienceDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshLeads();
      toast.success('Audiences refreshed');
    } catch (error) {
      toast.error('Failed to refresh audiences');
    } finally {
      setRefreshing(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedAudienceId) {
      toast.error('Please select an audience');
      return;
    }

    setLoading(true);
    try {
      await addLeadsToAudience(selectedAudienceId, leads.map(lead => ({
        fullName: lead.fullName,
        profileUrl: lead.profileUrl,
        headline: lead.headline,
        sourceOperation
      })));
      toast.success(`Added ${leads.length} leads to audience`);
      onClose();
    } catch (error) {
      console.error('Error saving leads:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save leads');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAudience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAudienceName.trim()) {
      toast.error('Please enter an audience name');
      return;
    }

    setLoading(true);
    try {
      const audience = await createAudience(newAudienceName.trim(), newAudienceDescription.trim());
      setSelectedAudienceId(audience.id);
      setShowCreateForm(false);
      toast.success('Audience created successfully');
    } catch (error) {
      console.error('Error creating audience:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create audience');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Save to Audience</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {showCreateForm ? (
            <form onSubmit={handleCreateAudience} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audience Name
                </label>
                <input
                  type="text"
                  value={newAudienceName}
                  onChange={(e) => setNewAudienceName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter audience name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newAudienceDescription}
                  onChange={(e) => setNewAudienceDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter audience description"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newAudienceName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Create Audience
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Audience
                  </label>
                  <select
                    value={selectedAudienceId}
                    onChange={(e) => setSelectedAudienceId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select an audience</option>
                    {audiences.map((audience) => (
                      <option key={audience.id} value={audience.id}>
                        {audience.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Create New Audience
                </button>

                <div className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Users className="h-4 w-4" />
                    <span>{leads.length} leads selected</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !selectedAudienceId}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Save to Audience
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}