import React from 'react';
import { Download, ExternalLink, Send } from 'lucide-react';
import TableCell from './TableCell';
import { serializeData } from '../utils/serializer';
import WebhookModal from './modals/WebhookModal';
import SaveToLeadsButton from './SaveToLeadsButton'; 
import { useWebhook } from '../hooks/useWebhook';
import { toast } from '../utils/toast';

interface ArticleCommentsTableProps {
  data: Array<{
    authorProfile: {
      fullName: string;
      headline?: string;
      profilePicture?: Array<{ url: string }>;
      username?: string;
      url?: string;
    };
    text: string;
  }>;
  onLoadMore: () => void;
  loading: boolean;
  hasMore: boolean;
}

export default function ArticleCommentsTable({ data, onLoadMore, loading, hasMore }: ArticleCommentsTableProps) {
  const { sendWebhook } = useWebhook();
  const [isWebhookModalOpen, setIsWebhookModalOpen] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<typeof data>([]);
  const headers = [
    'Profile Picture',
    'Full Name',
    'Headline',
    'Username',
    'Actions'
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
          row.authorProfile?.profilePicture?.[0]?.url || '',
          row.authorProfile?.fullName || '',
          row.authorProfile?.headline || '',
          row.authorProfile?.username || '',
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `linkedin_article_comments_${date}_${timestamp}.csv`;
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
          <span>Article Comments</span>
          {loading && (
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent"></div>
          )}
        </h3>
        <div className="flex items-center gap-4">
          <SaveToLeadsButton
            selectedData={selectedRows}
            sourceOperation="article_comments"
            transformData={(rows) => rows.map(row => ({
              fullName: row.authorProfile.fullName,
              profileUrl: row.authorProfile.url || '',
              headline: row.authorProfile.headline || '',
              sourceOperation: 'article_comments'
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
                      checked={selectedRows.some(r => r.authorProfile.url === row.authorProfile.url)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows([...selectedRows, row]);
                        } else {
                          setSelectedRows(selectedRows.filter(r => r.authorProfile.url !== row.authorProfile.url));
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={row.authorProfile?.profilePicture?.[0]?.url || 'https://via.placeholder.com/32x32'}
                      alt={`${row.authorProfile?.fullName}'s profile`}
                      className="h-8 w-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32x32';
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-medium">{row.authorProfile?.fullName || '-'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                    <TableCell
                      content={row.authorProfile?.headline || '-'}
                      type="headline"
                      className="block"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.authorProfile?.username || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                    {row.authorProfile?.url && (
                      <a 
                        href={row.authorProfile.url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        <span>View Profile</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="block">No comments available</span>
                    <span className="text-sm text-gray-400">Enter a LinkedIn article URL to see comments</span>
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
            <span>Found {data.length} comment{data.length !== 1 ? 's' : ''}</span>
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