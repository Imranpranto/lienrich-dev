import React from 'react';
import { Download, ExternalLink, Send } from 'lucide-react';
import TableCell from './TableCell';
import { serializeData } from '../utils/serializer';
import WebhookModal from './modals/WebhookModal';
import SaveToLeadsButton from './SaveToLeadsButton';
import { useWebhook } from '../hooks/useWebhook';
import { toast } from '../utils/toast';

interface CommentatorsTableProps {
  data: Array<{
    author: {
      fullName: string;
      headline?: string;
      profileUrl: string;
      username?: string;
    };
  }>;
  onLoadMore: () => void;
  loading: boolean;
}

export default function CommentatorsTable({ data, onLoadMore, loading }: CommentatorsTableProps) {
  const { config, updateConfig, testWebhook, deliveries, sendWebhook } = useWebhook();
  const [isWebhookModalOpen, setIsWebhookModalOpen] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<typeof data>([]);
  const headers = [
    'Name',
    'Title',
    'Comments',
    'LinkedIn URL',
    'Username'
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
          row.author.fullName,
          row.author.headline,
          row.text || '',
          row.author.profileUrl,
          row.author.username || ''
        ].map(field => `"${field || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `linkedin_post_comments_${date}_${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleWebhookSend = async (webhookConfig: WebhookConfig) => {
    try {
      // Validate webhook URL before sending
      if (!webhookConfig.url) {
        throw new Error('Please enter a webhook URL');
      }

      try {
        new URL(webhookConfig.url);
      } catch {
        throw new Error('Invalid webhook URL format');
      }

      await sendWebhook(data, webhookConfig);
      toast.success('Data sent to webhook successfully');
    } catch (error) {
      const errorMessage = error.message?.includes('Failed to fetch')
        ? `Unable to reach webhook endpoint${webhookConfig.corsEnabled ? '. The server may not support CORS.' : '.'}`
        : error.message || 'Failed to send data to webhook';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-[95vw] mx-auto">
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>Commentators Data</span>
          {loading && (
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent"></div>
          )}
        </h3>
        <div className="flex items-center gap-4">
          <SaveToLeadsButton
            selectedData={selectedRows}
            sourceOperation="post_commentators"
            transformData={(rows) => rows.map(row => ({
              fullName: row.author.fullName,
              profileUrl: row.author.profileUrl,
              headline: row.author.headline || '',
              sourceOperation: 'post_commentators'
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <th className="w-12 px-3 py-3 text-left">
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
                  <td className="w-12 px-3 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.some(r => r.author.profileUrl === row.author.profileUrl)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows([...selectedRows, row]);
                        } else {
                          setSelectedRows(selectedRows.filter(r => r.author.profileUrl !== row.author.profileUrl));
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-medium">{row.author.fullName}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                    <TableCell
                      content={row.author.headline || '-'}
                      type="headline"
                      className="block"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                    <TableCell
                      content={row.text || '-'}
                      type="text"
                      maxLength={25}
                      className="block"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                    <a 
                      href={row.author.profileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                    >
                      <span>Browse Profile</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.author.username || '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                    <span className="block">No data available</span>
                    <span className="text-sm text-gray-400">Enter a LinkedIn post URL to see commentators</span>
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
            <span>Showing {data.length} commentator{data.length !== 1 ? 's' : ''}</span>
            <button
              onClick={onLoadMore}
              disabled={loading}
              className="text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More Results'}
            </button>
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