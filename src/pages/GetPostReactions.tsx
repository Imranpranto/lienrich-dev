import React from 'react';
import { ArrowLeft, Link2, Database, ThumbsUp, Search, HelpCircle, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPostReactions } from '../services/linkedinApi';
import DataTable from '../components/DataTable';
import { useCredits } from '../hooks/useCredits';
import LoadingOverlay from '../components/LoadingOverlay';
import HowItWorks from '../components/HowItWorks';

const steps = [
  {
    icon: Link2,
    title: 'Paste LinkedIn Post URL',
  },
  {
    icon: Database,
    title: 'Extract Reactions Data',
  },
  {
    icon: ThumbsUp,
    title: 'Get Profile Details',
  }
];

const howItWorksSteps = [
  {
    icon: Link2,
    title: "Find a LinkedIn Post",
    description: "Navigate to the LinkedIn post you want to analyze and copy its URL from your browser's address bar.",
    tips: [
      "Make sure the post is public or accessible",
      "The URL should start with 'linkedin.com/posts' or similar",
      "You can use both desktop and mobile post URLs",
      "Each request can extract up to 100 contacts, but you can make multiple requests for unlimited data extraction"
    ]
  },
  {
    icon: Search,
    title: "Paste the URL",
    description: "Paste the copied URL into the search field and specify how many reactions you want to analyze.",
    tips: [
      "You can analyze unlimited reactions per request",
      "Start with a smaller number to test the results",
      "The tool will automatically validate the URL format"
    ]
  },
  {
    icon: Database,
    title: "Extract Profile Data",
    description: "Click the 'Analyze' button to start extracting profile data from the post reactions.",
    tips: [
      "The process usually takes a few seconds",
      "Results include profile pictures, names, and headlines",
      "All data is retrieved in real-time"
    ]
  },
  {
    icon: Download,
    title: "Export or Process Results",
    description: "Once the data is retrieved, you can export it to CSV or send it to a webhook for further processing.",
    tips: [
      "CSV exports include all available profile data",
      "Configure webhooks in the Integrations section for automated processing",
      "Data is formatted for easy import into CRM systems",
      "Use webhooks to process unlimited contacts in batches"
    ]
  }
];

export default function GetPostReactions() {
  const [url, setUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [data, setData] = React.useState<any[]>([]);
  const [hasMore, setHasMore] = React.useState(true);
  const [error, setError] = React.useState('');
  const [isHowItWorksOpen, setIsHowItWorksOpen] = React.useState(false);
  const { deductCredits } = useCredits();
  const [creditsDeducted, setCreditsDeducted] = React.useState(false);

  const handleAnalyze = async (page: number = 1) => {
    if (!url) {
      setError('Please enter a LinkedIn post URL');
      setData([]);
      return;
    }

    if (!url.includes('linkedin.com')) {
      setError('Please enter a valid LinkedIn URL');
      setData([]);
      return;
    }

    setLoading(true);
    setError('');
    setCreditsDeducted(false);

    try {
      const reactions = await getPostReactions({ url, page });
      if (!reactions || reactions.length === 0) {
        if (page === 1) {
          setError('No reactions found. Please check the URL and try again.');
          setData([]);
          setHasMore(false);
        }
        return;
      }
      
      // Deduct credits only after successfully fetching data
      if (reactions.length > 0) {
        const success = await deductCredits(reactions.length, 'data_preview', {
          operation: 'post_reactions',
          count: reactions.length
        });
        if (success) {
          setCreditsDeducted(true);
        }
      }
      
      setData(page === 1 ? reactions : [...data, ...reactions]);
      setCurrentPage(page);
      setHasMore(reactions.length === 10); // Assuming 10 items per page
    } catch (err) {
      console.error('Analysis Error:', err);
      setError(err.message === 'Invalid response format from API' 
        ? 'Please enter a valid LinkedIn post URL' 
        : err.message || 'Failed to fetch reactions. Please try again.');
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Get Post Reactions</h1>
            <p className="text-xl text-gray-600">
              Extract valuable profile data from LinkedIn post reactions without logging in
            </p>
          </div>
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
              placeholder="Paste LinkedIn post URL here..."
              className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <button
              onClick={() => handleAnalyze(1)}
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
          <DataTable 
            data={data}
            hasMore={hasMore}
            onLoadMore={() => handleAnalyze(currentPage + 1)}
            loading={loading}
          />
          
          {isHowItWorksOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="divide-y divide-gray-100">
                  <HowItWorks
                    steps={howItWorksSteps}
                    onClose={() => setIsHowItWorksOpen(false)}
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Video Tutorial</h3>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-500 mb-2">Video tutorial coming soon!</p>
                        <p className="text-sm text-gray-400">We're working on creating a detailed video guide</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}