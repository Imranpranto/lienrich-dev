import React from 'react';
import { X, ExternalLink, Download, Send } from 'lucide-react';
import type { Lead } from '../../types/leads';
import { serializeData } from '../../utils/serializer';
import WebhookModal from '../modals/WebhookModal';
import { useWebhook } from '../../hooks/useWebhook';
import { toast } from '../../utils/toast';

interface ViewAudienceLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audienceName: string;
  leads: Lead[];
}

export default function ViewAudienceLeadsModal({ 
  isOpen, 
  onClose, 
  audienceName, 
  leads 
}: ViewAudienceLeadsModalProps) {
  if (!isOpen) return null;

  const { sendWebhook } = useWebhook();
  const [isWebhookModalOpen, setIsWebhookModalOpen] = React.useState(false);

  const exportToCsv = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }).replace(/:/g, '');
    const date = new Date().toISOString().split('T')[0];
    
    const csvContent = [
      ['Full Name', 'Headline', 'Profile URL', 'Source'].join(','),
      ...serializeData(leads).map(lead =>
        [
          lead.fullName || lead.full_name,
          lead.headline || '',
          lead.profileUrl || lead.profile_url,
          lead.sourceOperation || lead.source_operation
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audience_leads_${audienceName}_${date}_${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleWebhookSend = async (webhookConfig: WebhookConfig) => {
    try {
      await sendWebhook(leads, webhookConfig);
      toast.success('Data sent to webhook successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to send data to webhook');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{audienceName}</h3>
            <p className="text-sm text-gray-500">{leads.length} leads</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsWebhookModalOpen(true)}
              disabled={leads.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              Send to Webhook
            </button>
            <button
              onClick={exportToCsv}
              disabled={leads.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Headline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="font-medium text-gray-900">{lead.fullName || lead.full_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{lead.headline || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 capitalize">{lead.sourceOperation || lead.source_operation || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={lead.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        <span>View Profile</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No leads in this audience yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      </div>
      
      <WebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        onSend={handleWebhookSend}
      />
    </div>
  );
}