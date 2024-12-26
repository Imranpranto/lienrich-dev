import React from 'react';
import { Download, ExternalLink } from 'lucide-react';
import TableCell from './TableCell';
import { serializeData } from '../utils/serializer';
import type { LinkedInProfile } from '../types/linkedin';

interface SearchPeopleTableProps {
  data: LinkedInProfile[];
  onLoadMore: () => void;
  loading: boolean;
}

export default function SearchPeopleTable({ data, onLoadMore, loading }: SearchPeopleTableProps) {
  const headers = [
    'Profile Picture',
    'Full Name',
    'Headline',
    'Location',
    'Profile URL',
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
          row.profilePicture,
          row.fullName,
          row.headline || '',
          row.location || '',
          row.profileURL,
          row.username || ''
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `linkedin_search_results_${date}_${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-[95vw] mx-auto">
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Search Results
        </h3>
        <button
          onClick={exportToCsv}
          disabled={data.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Export Data
        </button>
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
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.location || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                    <a 
                      href={row.profileURL || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                    >
                      <span>Browse Profile</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.username || '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="block">No data available</span>
                    <span className="text-sm text-gray-400">Enter a LinkedIn search URL to see results</span>
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
            <span>Showing {data.length} result{data.length !== 1 ? 's' : ''}</span>
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
    </div>
  );
}