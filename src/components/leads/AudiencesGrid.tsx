import React, { useState } from 'react';
import { Users, MoreHorizontal, Send, Trash2 } from 'lucide-react';
import type { Audience } from '../../types/leads';
import SendToWebhookModal from './SendToWebhookModal';
import DeleteAudienceModal from './DeleteAudienceModal';
import ViewAudienceLeadsModal from './ViewAudienceLeadsModal';
import { useLeads } from '../../hooks/useLeads';
import { toast } from '../../utils/toast';

export default function AudiencesGrid() {
  const { audiences, deleteAudience, loading, error } = useLeads();
  const [selectedAudience, setSelectedAudience] = useState<Audience | null>(null);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [audienceToDelete, setAudienceToDelete] = useState<Audience | null>(null);
  const [viewLeadsAudience, setViewLeadsAudience] = useState<Audience | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-8 w-8 bg-gray-200 rounded-lg mb-4" />
            <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-48 bg-gray-200 rounded mb-4" />
            <div className="h-8 w-full bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }
  const handleDelete = async () => {
    if (!audienceToDelete) return;
    setDeleteLoading(audienceToDelete.id);
    
    try {
      await deleteAudience(audienceToDelete.id);
      toast.success('Audience deleted successfully');
      setAudienceToDelete(null);
    } catch (error) {
      toast.error('Failed to delete audience');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteClick = (audience: Audience) => {
    setAudienceToDelete(audience);
  };

  const handleWebhookClick = (audience: Audience) => {
    setSelectedAudience(audience);
    setShowWebhookModal(true);
  };

  const handleCloseWebhook = () => {
    setShowWebhookModal(false);
    setSelectedAudience(null);
  };

  const handleViewLeads = (audience: Audience) => {
    setViewLeadsAudience(audience);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {error && (
        <div className="col-span-3 bg-red-50 text-red-600 p-6 rounded-xl mb-4 flex items-center gap-3">
          <div className="h-2 w-2 bg-red-600 rounded-full" />
          {error}
        </div>
      )}

      {loading && audiences.length === 0 && (
        <div className="col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-8 w-8 bg-gray-200 rounded-lg mb-4" />
                <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-48 bg-gray-200 rounded mb-4" />
                <div className="h-8 w-full bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && audiences.length === 0 && (
        <div className="col-span-3 text-center py-12">
          <div className="bg-gray-50 rounded-xl p-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Audiences Yet</h3>
            <p className="text-gray-500">Create your first audience to start organizing your leads</p>
          </div>
        </div>
      )}

      {audiences.map((audience) => (
        <div
          key={audience.id}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <button
                onClick={() => handleDeleteClick(audience)}
                disabled={deleteLoading === audience.id}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
              >
                {deleteLoading === audience.id ? (
                  <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
            <button
              onClick={() => handleViewLeads(audience)}
              className="mt-4 text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors text-left w-full truncate"
            >
              {audience.name}
            </button>
            <p className="mt-1 text-sm text-gray-500">{audience.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-sm">
                <Users className="h-3.5 w-3.5" />
                {audience.leads?.length || 0} {(audience.leads?.length || 0) === 1 ? 'lead' : 'leads'}
              </span>
              <div className="text-sm text-gray-500">
                {new Date(audience.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex gap-2">
              <button 
                onClick={() => handleViewLeads(audience)}
                className="flex-1 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                View Leads
              </button>
              <button
                onClick={() => handleWebhookClick(audience)}
                className="px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {selectedAudience && (
        <SendToWebhookModal
          isOpen={showWebhookModal}
          onClose={handleCloseWebhook}
          leads={selectedAudience.leads}
          mode="audience"
          audienceName={selectedAudience.name}
        />
      )}
      
      {viewLeadsAudience && (
        <ViewAudienceLeadsModal
          isOpen={!!viewLeadsAudience}
          onClose={() => setViewLeadsAudience(null)}
          audienceName={viewLeadsAudience.name}
          leads={viewLeadsAudience.leads}
        />
      )}
      
      {audienceToDelete && (
        <DeleteAudienceModal
          isOpen={!!audienceToDelete}
          onClose={() => setAudienceToDelete(null)}
          onConfirm={handleDelete}
          audienceName={audienceToDelete.name}
          loading={deleteLoading === audienceToDelete.id}
        />
      )}
    </div>
  );
}