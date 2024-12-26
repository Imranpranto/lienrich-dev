import React from 'react';
import { Download, ExternalLink, Send } from 'lucide-react';
import TableCell from './TableCell';
import { serializeData } from '../utils/serializer';
import WebhookModal from './modals/WebhookModal';
import SaveToLeadsButton from './SaveToLeadsButton';
import { useWebhook } from '../hooks/useWebhook';
import { toast } from '../utils/toast';
import type { Lead } from '../types/leads';

interface DataTableProps {
  data: {
    profilePicture: string;
    fullName: string;
    headline: string;
    profileUrl: string;
    profileType: string;
  }[];
  hasMore?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
}

export default function DataTable({ data, hasMore, onLoadMore, loading }: DataTableProps) {
  const { config, updateConfig, testWebhook, deliveries, sendWebhook } = useWebhook();
  const [isWebhookModalOpen, setIsWebhookModalOpen] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<typeof data>([]);

  const headers = [
    'Profile Picture',
    'Full Name',
    'Headline',
    'Profile URL',
    'Profile Type',
    'Reaction Type'
  ];

  const exportToCsv = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }).replace(/:/g, '');
    const date = new Date().toISOString().split('T')[0];
    
    const csvContent = [
      headers.join(','),
      ...serializeData(data).map(row =>
        [
          row.profilePicture,
          row.fullName,
          row.headline || '',
          row.profileUrl,
          row.profileType,
          row.reactionType
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `linkedin_post_reactions_${date}_${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleWebhookSend = async (webhookConfig: WebhookConfig) => {
    try {
      await sendWebhook(data, webhookConfig);
      toast.success('Data sent to webhook successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to send data to webhook');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-[95vw] mx-auto">
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          Post Reaction Data Preview
          {loading && (
            <div className="inline-block h-4 w-4 ml-2 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent"></div>
          )}
        </h3>
        <div className="flex items-center gap-4">
          <SaveToLeadsButton
            selectedData={selectedRows}
            sourceOperation="post_reactions"
            transformData={(rows) => rows.map(row => ({
              fullName: row.fullName,
              profileUrl: row.profileUrl,
              headline: row.headline || '',
              sourceOperation: 'post_reactions'
            }))}
          />
          <button
            onClick={() => setIsWebhookModalOpen(true)}
            disabled={data.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            Send to Webhook
          </button>
          <button
            onClick={exportToCsv}
            disabled={data.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length}
                  onChange={(e) => setSelectedRows(e.target.checked ? data : [])}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.some(r => r.profileUrl === row.profileUrl)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows([...selectedRows, row]);
                        } else {
                          setSelectedRows(selectedRows.filter(r => r.profileUrl !== row.profileUrl));
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={row.profilePicture}
                      alt={`${row.fullName}'s profile`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32x32';
                      }}
                      className="h-8 w-8 rounded-full"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-medium">{row.fullName}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                    <TableCell
                      content={row.headline || '-'}
                      type="headline"
                      className="block"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                    <a 
                      href={row.profileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                    >
                      <span>Browse Profile</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="capitalize">{row.profileType.toLowerCase()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-full">
                      {row.reactionType.charAt(0).toUpperCase() + row.reactionType.slice(1).toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="block">No data available</span>
                    <span className="text-sm text-gray-400">Enter a LinkedIn post URL to see reactions</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {data.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <span>Showing {data.length} reaction{data.length !== 1 ? 's' : ''}</span>
            {hasMore && (
              <button
                onClick={onLoadMore}
                disabled={loading}
                className="text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More Results'}
              </button>
            )}
          </div>
        </div>
      )}
      <WebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        onSend={handleWebhookSend}
      />
    </div>
  );
}