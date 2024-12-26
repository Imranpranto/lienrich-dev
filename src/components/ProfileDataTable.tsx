import React from 'react';
import { Download, ExternalLink, Send } from 'lucide-react';
import TableCell from './TableCell';
import WebhookModal from './modals/WebhookModal';
import { useWebhook } from '../hooks/useWebhook';
import { serializeData } from '../utils/serializer';

interface ProfileDataTableProps {
  data: any;
  loading?: boolean;
}

export default function ProfileDataTable({ data, loading }: ProfileDataTableProps) {
  const [isWebhookModalOpen, setIsWebhookModalOpen] = React.useState(false);
  const { sendWebhook } = useWebhook();

  const headers = [
    'Full Name',
    'Username',
    'Headline',
    'Summary',
    'Location',
    'Hiring Status',
    'Company Name',
    'Company Industry',
    'Company Size',
    'Role Description',
    'Previous Roles',
    'Education History',
    'Skills',
    'Actions'
  ];

  const prepareExportData = (profileData: any) => {
    if (!profileData) return [];
    
    return [{
      fullName: `${profileData.firstName} ${profileData.lastName}`,
      username: profileData.username || '',
      headline: profileData.headline || '',
      summary: profileData.summary || '',
      location: profileData.geo ? `${profileData.geo.city}, ${profileData.geo.country}` : '',
      isHiring: profileData.isHiring ? 'Yes' : 'No',
      currentRole: profileData.position?.[0]?.title || '',
      companyDetails: profileData.position?.[0] ? 
        `${profileData.position[0].companyName} (${profileData.position[0].companyIndustry}) - ${profileData.position[0].companyStaffCountRange}` : '',
      previousRoles: profileData.position?.slice(1).map((pos: any) => 
        `${pos.title} at ${pos.companyName}`).join('; ') || '',
      educationHistory: profileData.educations?.map((edu: any) =>
        `${edu.degree} at ${edu.schoolName}`).join('; ') || '',
      skills: profileData.skills?.map((skill: any) => skill.name).join(', ') || '',
      companyUrl: profileData.position?.[0]?.companyURL || '',
      profileUrl: `https://linkedin.com/in/${profileData.username}`
    }];
  };

  const exportToCsv = () => {
    if (!data) return;
    
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }).replace(/:/g, '');
    const date = new Date().toISOString().split('T')[0];
    
    const exportData = prepareExportData(data);
    const username = data.username || 'unknown';
    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...serializeData(exportData).map(row =>
        Object.values(row).map(value => `"${value}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `linkedin_profile_${username}_${date}_${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (!data && !loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-[95vw] mx-auto">
        <div className="p-4 flex justify-between items-center border-b border-gray-200 bg-white sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            Profile Data Preview
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsWebhookModalOpen(true)}
              disabled={true}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              Send to Webhook
            </button>
            <button
              onClick={exportToCsv}
              disabled={true}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>
        </div>
        <div className="p-8 text-center text-gray-500">
          Enter a LinkedIn profile URL to see profile data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-[95vw] mx-auto">
      <div className="p-4 flex justify-between items-center border-b border-gray-200 bg-white sticky top-0 z-10">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          Profile Data Preview
          {loading && (
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent"></div>
          )}
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsWebhookModalOpen(true)}
            disabled={!data || loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            Send to Webhook
          </button>
          <button
            onClick={exportToCsv}
            disabled={!data || loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-gray-50">
            <tr>
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
            {data ? (
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="font-medium">{`${data.firstName} ${data.lastName}`}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {data.username || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  <TableCell
                    content={data.headline || '-'}
                    type="headline"
                    maxLength={25}
                    className="block font-medium"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  <TableCell
                    content={data.summary || '-'}
                    type="text"
                    maxLength={25}
                    className="block"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {data.geo ? `${data.geo.city}, ${data.geo.country}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    data.isHiring 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-gray-50 text-gray-600'
                  }`}>
                    {data.isHiring ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <TableCell
                    content={data.position?.[0]?.companyName || '-'}
                    maxLength={25}
                    className="block"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <TableCell
                    content={data.position?.[0]?.companyIndustry || '-'}
                    type="text"
                    maxLength={25}
                    className="block"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <TableCell
                    content={data.position?.[0]?.companyStaffCountRange || '-'}
                    type="text"
                    maxLength={25}
                    className="block"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <TableCell
                    content={data.position?.[0]?.description || '-'}
                    type="text"
                    maxLength={25}
                    className="block"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <TableCell
                    content={data.position?.slice(1).map((pos: any) => 
                      `${pos.title} at ${pos.companyName}`).join('; ') || '-'}
                    type="text"
                    maxLength={25}
                    className="block"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <TableCell
                    content={data.educations?.map((edu: any) =>
                      `${edu.degree} at ${edu.schoolName}`).join('; ') || '-'}
                    type="text"
                    maxLength={25}
                    className="block"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <TableCell
                    content={data.skills?.map((skill: any) => skill.name).join(', ') || '-'}
                    type="text"
                    maxLength={25}
                    className="block"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                  <div className="flex flex-col gap-2">
                    <a 
                      href={`https://linkedin.com/in/${data.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    {data.position?.[0]?.companyURL && (
                      <a 
                        href={data.position[0].companyURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        <span>View Company</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={12} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="block">Loading profile data...</span>
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
        onSend={(webhookConfig) => sendWebhook(prepareExportData(data), webhookConfig)}
      />
    </div>
  );
}