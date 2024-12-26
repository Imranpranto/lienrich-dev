import React, { useState } from 'react';
import { MoreHorizontal, ExternalLink, Users, Download, Send } from 'lucide-react';
import type { Lead } from '../../types/leads';
import SaveToAudienceModal from './SaveToAudienceModal';
import { serializeData } from '../../utils/serializer';
import WebhookModal from '../modals/WebhookModal';
import { useWebhook } from '../../hooks/useWebhook';
import { toast } from '../../utils/toast';

interface LeadsTableProps {
  leads: Lead[];
  onSaveToAudience?: (leads: Lead[]) => void;
}

export default function LeadsTable({ leads }: LeadsTableProps) {
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const { sendWebhook } = useWebhook();

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
    link.download = `all_leads_${date}_${timestamp}.csv`;
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">All Leads</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={exportToCsv}
            disabled={leads.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedLeads.length === leads.length}
                  onChange={(e) => setSelectedLeads(e.target.checked ? leads : [])}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Headline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedLeads.some(l => l.id === lead.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeads([...selectedLeads, lead]);
                      } else {
                        setSelectedLeads(selectedLeads.filter(l => l.id !== lead.id));
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{lead.fullName}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="relative group">
                    <span className="text-sm text-gray-500 truncate block max-w-xs">
                      {lead.headline || '-'}
                    </span>
                    {lead.headline && lead.headline.length > 40 && (
                      <div className="absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 bottom-full left-0 mb-2 w-80">
                        <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg">
                          {lead.headline}
                          <div className="absolute left-4 -bottom-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{lead.sourceOperation}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-3">
                      <a
                        href={lead.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <span>Browse Profile</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SaveToAudienceModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        leads={selectedLeads}
        sourceOperation="manual_add"
      />
    </div>
  );
}