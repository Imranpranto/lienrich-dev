import React from 'react';
import { ArrowLeft, Link2, MessageSquare, Users, Search, Download, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPostComments } from '../services/linkedinApi';
import CommentatorsTable from '../components/CommentatorsTable';
import { useCredits } from '../hooks/useCredits';
import LoadingOverlay from '../components/LoadingOverlay';
import { handleUrlValidation } from '../utils/linkedinUrl';
import HowItWorks from '../components/HowItWorks';

const steps = [
  {
    icon: Link2,
    title: 'Paste LinkedIn Post URL',
    description: 'Copy and paste the URL of any LinkedIn post'
  },
  {
    icon: MessageSquare,
    title: 'Extract Comments',
    description: 'Get all comments from the post'
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
    title: "Find a LinkedIn Post",
    description: "Navigate to any LinkedIn post and copy its URL from your browser's address bar.",
    tips: [
      "Make sure the post is public or accessible",
      "The URL should contain 'activity-' followed by numbers",
      "You can use both desktop and mobile post URLs"
    ]
  },
  {
    icon: MessageSquare,
    title: "Extract Comments",
    description: "Our system will analyze the post and extract all comments.",
    tips: [
      "Comments are sorted by relevance by default",
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

export default function ProfilePostCommentators() {
  const [url, setUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [data, setData] = React.useState<any[]>([]);
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

    const postId = handleUrlValidation(url);
    if (!postId) {
      setData([]);
      return;
    }

    setLoading(true);
    setError('');
    setCreditsDeducted(false);

    try {
      console.log('Fetching comments for post:', postId);
      const comments = await getPostComments({
        urn: postId,
        sort: 'mostRelevant',
        page
      });

      if (!comments || comments.length === 0) {
        if (page === 1) {
          setError('No comments found for this post');
          setData([]);
        }
        return;
      }

      // Transform the data to match the table structure
      const transformedComments = comments.map(comment => {
        console.log('Processing comment:', comment);
        return {
          text: comment.text,
          author: {
            fullName: comment.author.name,
            headline: comment.author.title,
            profileUrl: comment.author.linkedinUrl,
            username: comment.author.username
          }
        };
      });

      console.log('Transformed comments:', transformedComments);

      setData(page === 1 ? transformedComments : [...data, ...transformedComments]);
      
      // Deduct credits only after successfully fetching data
      if (transformedComments.length > 0) {
        const success = await deductCredits(transformedComments.length, 'data_preview', {
          operation: 'post_commentators',
          count: transformedComments.length
        });
        if (success) {
          setCreditsDeducted(true);
        }
      }
      setCurrentPage(page);
    } catch (err) {
      console.error('Analysis Error:', err);
      setError(err.message || 'Failed to fetch comments. Please try again.');
      if (page === 1) {
        setData([]);
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Profile Post Commentators</h1>
            <p className="text-xl text-gray-600">
              Extract valuable profile data from LinkedIn post comments without logging in
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
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder="Enter LinkedIn post URL (e.g., https://www.linkedin.com/posts/username_activity-7264646415795077121)"
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
          <CommentatorsTable
            data={data}
            onLoadMore={() => handleAnalyze(currentPage + 1)}
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