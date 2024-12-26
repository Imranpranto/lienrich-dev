import React from 'react';
import { Download, ExternalLink, Send, Calendar } from 'lucide-react';
import TableCell from './TableCell';
import { serializeData } from '../utils/serializer';
import WebhookModal from './modals/WebhookModal';
import { useWebhook } from '../hooks/useWebhook';

interface CompanyPost {
  text: string;
  totalReactionCount: number;
  postUrl: string;
  postedDate: string;
  repostsCount: number;
}

interface ExportablePost {
  text: string;
  postedDate: string;
  totalReactionCount: number;
  postUrl: string;
  repostsCount: number;
}

interface CompanyPostsTableProps {
  data: CompanyPost[];
  loading?: boolean;
}

export default function CompanyPostsTable({ data, loading }: CompanyPostsTableProps) {
  const [isWebhookModalOpen, setIsWebhookModalOpen] = React.useState(false);
  const [dateRange, setDateRange] = React.useState({ from: '', to: '' });

  const { config, sendWebhook } = useWebhook();

  const prepareExportData = (posts: CompanyPost[]): ExportablePost[] => {
    return posts.map(post => ({
      text: post.text,
      postedDate: post.postedDate,
      totalReactionCount: post.totalReactionCount,
      postUrl: post.postUrl,
      repostsCount: post.repostsCount || 0
    }));
  };

  const filteredData = React.useMemo(() => {
    return data.filter(post => {
      const postDate = new Date(post.postedDate);
      const fromDate = dateRange.from ? new Date(dateRange.from) : null;
      const toDate = dateRange.to ? new Date(dateRange.to) : null;

      if (fromDate && postDate < fromDate) return false;
      if (toDate && postDate > toDate) return false;
      return true;
    });
  }, [data, dateRange]);

  const headers = [
    'Company Post',
    'Posted At',
    'Reactions',
    'Reposts',
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
      ...serializeData(prepareExportData(filteredData)).map(post =>
        [
          `"${post.text.replace(/"/g, '""')}"`,
          `"${new Date(post.postedDate).toLocaleDateString('en-GB')}"`,
          post.totalReactionCount,
          post.repostsCount,
          `"${post.postUrl}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `linkedin_company_posts_${date}_${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-[95vw] mx-auto">
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>Company Posts</span>
          <span className="text-sm font-normal text-gray-500">
            (Total Posts Found: {filteredData.length})
          </span>
          {loading && (
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent"></div>
          )}
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWebhookModalOpen(true)}
              disabled={filteredData.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              Send to Webhook
            </button>
            <button
              onClick={exportToCsv}
              disabled={filteredData.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full min-w-full">
          <thead>
            <tr className="bg-gray-50">
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
            {filteredData.length > 0 ? (
              filteredData.map((post, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                    <TableCell
                      content={post.text || '-'}
                      type="text"
                      maxLength={40}
                      className="block"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.postedDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.totalReactionCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.repostsCount?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                    <a 
                      href={post.postUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                    >
                      <span>Browse Post</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="block">No posts available</span>
                    <span className="text-sm text-gray-400">Enter a LinkedIn company URL to see posts</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <WebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        onSend={(webhookConfig) => sendWebhook(prepareExportData(filteredData), webhookConfig)}
      />
    </div>
  );
}