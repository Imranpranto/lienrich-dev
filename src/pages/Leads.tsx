import React from 'react';
import { Users, Plus, Search, Filter } from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import LeadsTable from '../components/leads/LeadsTable';
import AudiencesGrid from '../components/leads/AudiencesGrid';
import CreateAudienceModal from '../components/leads/CreateAudienceModal';
import LeadLimitIndicator from '../components/leads/LeadLimitIndicator';

export default function Leads() {
  const [activeTab, setActiveTab] = React.useState<'leads' | 'audiences'>('leads');
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { leads, audiences, leadLimit = null, loading } = useLeads();

  const filteredLeads = React.useMemo(() => {
    if (!searchQuery) return leads;
    const query = searchQuery.toLowerCase();
    return leads.filter(lead => 
      lead.fullName.toLowerCase().includes(query) ||
      (lead.headline?.toLowerCase().includes(query)) ||
      (lead.location?.toLowerCase().includes(query))
    );
  }, [leads, searchQuery]);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Leads Management</h1>
            <p className="text-gray-500">Organize and manage your LinkedIn leads</p>
          </div>
          <div className="flex items-center gap-4">
            <LeadLimitIndicator limit={leadLimit} />
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Audience
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex items-center gap-8 px-6">
              <button
                onClick={() => setActiveTab('leads')}
                className={`py-4 px-2 border-b-2 font-medium ${
                  activeTab === 'leads'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All Leads ({leads.length})
              </button>
              <button
                onClick={() => setActiveTab('audiences')}
                className={`py-4 px-2 border-b-2 font-medium ${
                  activeTab === 'audiences' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Audiences ({audiences.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search leads..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg">
                <Filter className="h-5 w-5" />
              </button>
            </div>

            {activeTab === 'leads' ? (
              <LeadsTable 
                leads={filteredLeads}
                loading={loading}
              />
            ) : (
              <AudiencesGrid />
            )}
          </div>
        </div>
      </div>

      <CreateAudienceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}