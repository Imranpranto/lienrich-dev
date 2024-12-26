import React from 'react';
import { ArrowLeft, Link2, Search, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCompanyPosts } from '../services/linkedinApi';
import CompanyPostsTable from '../components/CompanyPostsTable';
import LoadingOverlay from '../components/LoadingOverlay';
import { useCredits } from '../hooks/useCredits';
import { API_CONFIG } from '../config/api';

const steps = [
  {
    icon: Link2,
    title: 'Enter LinkedIn Company URL',
    description: 'Paste the URL of any LinkedIn company you want to analyze'
  }
];

const howItWorksSteps = [
  {
    icon: Link2,
    title: "Find a Company Page",
    description: "Navigate to any LinkedIn company page and copy its URL from your browser's address bar.",
    tips: [
      "Make sure the company page is public or accessible",
      "The URL should contain 'linkedin.com/company/'",
      "You can use both desktop and mobile URLs"
    ]
  },
  {
    icon: Search,
    title: "Extract Posts",
    description: "Our system will analyze the company page and extract all posts.",
    tips: [
      "Posts are sorted by date by default",
      "Filter posts by date range",
      "Access to engagement metrics for each post"
    ]
  }
];

export default function CompanyPosts() {
  const [url, setUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any[]>([]);
  const [error, setError] = React.useState('');
  const [isHowItWorksOpen, setIsHowItWorksOpen] = React.useState(false);
  const { deductCredits } = useCredits();
  const [creditsDeducted, setCreditsDeducted] = React.useState(false);

  const extractCompanyUsername = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const companyIndex = pathParts.indexOf('company');
      
      if (companyIndex !== -1 && pathParts[companyIndex + 1]) {
        return pathParts[companyIndex + 1];
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const handleAnalyze = async () => {
    if (!url) {
      setError('Please enter a LinkedIn company URL');
      setData([]);
      return;
    }

    const username = extractCompanyUsername(url);
    if (!username) {
      setError('Please enter a valid LinkedIn company URL');
      setData([]);
      return;
    }

    setLoading(true);
    setError('');
    setCreditsDeducted(false);

    try {
      const posts = await getCompanyPosts(username);
      
      // Deduct credits only after successfully fetching data
      if (posts.length > 0) {
        const success = await deductCredits(posts.length, 'data_preview', {
          operation: 'company_posts',
          count: posts.length
        });
        if (success) {
          setCreditsDeducted(true);
        }
      }
      
      setData(posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch company posts');
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
        <LoadingOverlay isOpen={loading} />
        <div className="relative mb-12">
          <div className="absolute right-0 top-0">
            <button
              onClick={() => setIsHowItWorksOpen(true)}
              className="group relative bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur" />
              <div className="relative flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-900">How does it work?</span>
              </div>
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Company Posts</h1>
            <p className="text-xl text-gray-600">
              Extract and analyze posts from any LinkedIn company page
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter LinkedIn company URL (e.g., https://linkedin.com/company/smartlead-ai)"
              className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-red-500 text-sm">{error}</p>
          )}
        </div>

        <div className="mb-12 -mx-4">
          <CompanyPostsTable data={data} loading={loading} />
        </div>
      </div>
    </div>
  );
}