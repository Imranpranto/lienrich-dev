import React from 'react';
import { ArrowLeft, Search, Database, Filter, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchPeopleByKeywords } from '../services/linkedinApi';
import SearchPeopleTable from '../components/SearchPeopleTable';

const steps = [
  {
    icon: Search,
    title: 'Enter Keywords',
    description: 'Enter keywords to search LinkedIn profiles'
  },
  {
    icon: Filter,
    title: 'Apply Filters',
    description: 'Refine your search with location filters'
  },
  {
    icon: Database,
    title: 'Get Profile Data',
    description: 'Extract detailed profile information'
  }
];

export default function SearchPeopleByKeywords() {
  const [keywords, setKeywords] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [data, setData] = React.useState<any[]>([]);
  const [error, setError] = React.useState('');

  const handleSearch = async (page: number = 1) => {
    const trimmedKeywords = keywords.trim();
    if (!trimmedKeywords) {
      setError('Please enter keywords to search');
      setData([]);
      return;
    }
    if (trimmedKeywords.length < 2) {
      setError('Please enter at least 2 characters');
      setData([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const profiles = await searchPeopleByKeywords({
        keywords: trimmedKeywords,
        location: location.trim(),
        page
      });

      if (!profiles || profiles.length === 0) {
        setError('No profiles found. Please try different keywords.');
        setData([]);
        return;
      }

      setData(page === 1 ? profiles : [...data, ...profiles]);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profiles';
      console.error('Search Error:', err);
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Search People by Keywords</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find and extract LinkedIn profiles using keywords and filters
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
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Enter keywords (e.g., job title, skills, company)..."
                className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (optional)..."
                className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => handleSearch(1)}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search Profiles'}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-center text-red-500 text-sm">{error}</p>
          )}
        </div>

        <div className="mb-12 -mx-4">
          <SearchPeopleTable 
            data={data}
            onLoadMore={() => handleSearch(currentPage + 1)}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}