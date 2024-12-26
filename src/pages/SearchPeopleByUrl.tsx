import React from 'react';
import { ArrowLeft, Link2, Database, UserCheck, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchPeopleByUrl } from '../services/linkedinApi';
import SearchPeopleTable from '../components/SearchPeopleTable';

const steps = [
  {
    icon: Link2,
    title: 'Paste LinkedIn Search URL',
  },
  {
    icon: Database,
    title: 'Extract Profile Data',
  },
  {
    icon: UserCheck,
    title: 'Get Profile Details',
  }
];

export default function SearchPeopleByUrl() {
  const [url, setUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [data, setData] = React.useState<any[]>([]);
  const [error, setError] = React.useState('');

  const handleSearch = async (page: number = 1) => {
    if (!url) {
      setError('Please enter a LinkedIn search URL');
      setData([]);
      return;
    }

    if (!url.includes('linkedin.com/search')) {
      setError('Please enter a valid LinkedIn search URL');
      setData([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const profiles = await searchPeopleByUrl(url, page);
      if (!profiles || profiles.length === 0) {
        setError('No profiles found. Please verify the search URL and try again.');
        setData([]);
        return;
      }
      setData(page === 1 ? profiles : [...data, ...profiles]);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profiles';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <Link 
        to="/" 
        className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Search People by URL</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Extract profile data from LinkedIn search results without logging in
          </p>
        </div>

        <div className="flex justify-center items-center gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                {index + 1}
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                {React.createElement(step.icon, { className: "h-5 w-5 text-indigo-600" })}
                <span className="text-sm font-medium text-gray-900">{step.title}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste LinkedIn search URL here..."
              className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-red-500 text-sm">{error}</p>
          )}
        </div>

        <div className="mb-12 -mx-4">
          <SearchPeopleTable 
            data={data}
            onLoadMore={() => handleSearch(currentPage + 1)}
            loading={loading}
          />

          <div className="mt-12 bg-gradient-to-br from-indigo-50 to-purple-50 p-12 rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Start extracting valuable LinkedIn data with LiEnrich today.
              No login required, instant access to the information you need.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}