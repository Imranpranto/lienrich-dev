import React from 'react';
import { ArrowLeft, Link2, MessageSquare, Users, Search, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ArticleCommentsTable from '../components/ArticleCommentsTable';
import HowItWorks from '../components/HowItWorks';
import LoadingOverlay from '../components/LoadingOverlay';
import { useCredits } from '../hooks/useCredits';
import { API_CONFIG } from '../config/api';

const steps = [
  {
    icon: Link2,
    title: 'Paste LinkedIn Article URL',
    description: 'Copy and paste the URL of any LinkedIn article'
  },
  {
    icon: MessageSquare,
    title: 'Extract Comments',
    description: 'Get all comments from the article'
  },
  {
    icon: Users,
    title: 'Get Commentator Profiles',
    description: 'Access detailed profile information'
  }
];

const howItWorksSteps = [
  {
    icon: Link2,
    title: "Find a LinkedIn Article",
    description: "Navigate to any LinkedIn article and copy its URL from your browser's address bar.",
    tips: [
      "Make sure the article is public or accessible",
      "The URL should contain '/pulse/' in the path",
      "You can use both desktop and mobile article URLs"
    ]
  },
  {
    icon: MessageSquare,
    title: "Extract Comments",
    description: "Our system will analyze the article and extract all comments.",
    tips: [
      "Comments are sorted chronologically by default",
      "Load more comments using pagination",
      "Access to both primary and reply comments"
    ]
  },
  {
    icon: Users,
    title: "Access Profile Data",
    description: "Get detailed information about each commentator.",
    tips: [
      "View professional titles and current positions",
      "Access direct LinkedIn profile URLs",
      "Export data in CSV format for further analysis"
    ]
  }
];

export default function ArticleComments() {
  const [url, setUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [data, setData] = React.useState<any[]>([]);
  const [hasMore, setHasMore] = React.useState(true);
  const [error, setError] = React.useState('');
  const [isHowItWorksOpen, setIsHowItWorksOpen] = React.useState(false);
  const { deductCredits } = useCredits();
  const [creditsDeducted, setCreditsDeducted] = React.useState(false);

  const fetchComments = async (page: number = 1) => {
    if (!url) {
      setError('Please enter a LinkedIn article URL');
      setData([]);
      return;
    }

    if (!url.includes('linkedin.com/pulse/')) {
      setError('Please enter a valid LinkedIn article URL');
      setData([]);
      return;
    }

    setLoading(true);
    setError('');
    setCreditsDeducted(false);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/get-article-comments?url=${encodeURIComponent(url)}&page=${page}&sort=REVERSE_CHRONOLOGICAL`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': API_CONFIG.RAPID_API_KEY,
          'x-rapidapi-host': API_CONFIG.RAPID_API_HOST,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch article comments');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch comments');
      }

      const comments = result.data.items;
      
      // Deduct credits only after successfully fetching data
      if (comments.length > 0) {
        const success = await deductCredits(comments.length, 'data_preview', {
          operation: 'article_comments',
          count: comments.length
        });
        if (success) {
          setCreditsDeducted(true);
        }
      }
      
      const totalPages = parseInt(result.data.totalPages) || 1;
      
      if (!comments || comments.length === 0) {
        if (page === 1) {
          setError('No comments found for this article');
          setData([]);
          setHasMore(false);
        }
        return;
      }

      setData(page === 1 ? comments : [...data, ...comments]);
      setCurrentPage(page);
      setHasMore(page < totalPages);
    } catch (err) {
      console.error('Analysis Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
      if (page === 1) {
        setData([]);
        setHasMore(false);
      }
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">LinkedIn Article Comments</h1>
            <p className="text-xl text-gray-600">
              Extract valuable profile data from LinkedIn article comments
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
              placeholder="Enter LinkedIn article URL (e.g., https://www.linkedin.com/pulse/...)"
              className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <button
              onClick={() => fetchComments(1)}
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
          <ArticleCommentsTable
            data={data}
            hasMore={hasMore}
            onLoadMore={() => fetchComments(currentPage + 1)}
            loading={loading}
          />
        </div>

        {isHowItWorksOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <HowItWorks
                steps={howItWorksSteps}
                onClose={() => setIsHowItWorksOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}