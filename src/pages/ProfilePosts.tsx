import React from 'react';
import { ArrowLeft, Link2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfilePostsTable from '../components/ProfilePostsTable';
import { useCredits } from '../hooks/useCredits';
import LoadingOverlay from '../components/LoadingOverlay';
import { API_CONFIG } from '../config/api';

const steps = [
  {
    icon: Link2,
    title: 'Enter LinkedIn Profile URL',
    description: 'Paste the URL of any LinkedIn profile you want to analyze'
  }
];

export default function ProfilePosts() {
  const [username, setUsername] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any[]>([]);
  const [error, setError] = React.useState('');
  const { deductCredits } = useCredits();
  const [creditsDeducted, setCreditsDeducted] = React.useState(false);

  const extractUsername = (url: string): string | null => {
    const match = url.match(/linkedin\.com\/in\/([^/]+)/);
    return match ? match[1] : null;
  };

  const fetchProfilePosts = async (username: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/get-profile-posts?username=${username}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': API_CONFIG.RAPID_API_KEY,
          'x-rapidapi-host': API_CONFIG.RAPID_API_HOST,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile posts');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch posts');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  };

  const handleAnalyze = async () => {
    if (!username) {
      setError('Please enter a LinkedIn profile URL');
      setData([]);
      return;
    }

    const extractedUsername = extractUsername(username);
    if (!extractedUsername) {
      setError('Please enter a valid LinkedIn profile URL');
      setData([]);
      return;
    }

    setLoading(true);
    setError('');
    setCreditsDeducted(false);

    try {
      const posts = await fetchProfilePosts(extractedUsername);
      
      // Deduct credits only after successfully fetching data
      if (posts.length > 0) {
        const success = await deductCredits(posts.length, 'data_preview', {
          operation: 'profile_posts',
          count: posts.length
        });
        if (success) {
          setCreditsDeducted(true);
        }
      }
      
      setData(posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Profile Posts</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Extract and analyze posts from any LinkedIn profile
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter LinkedIn profile URL (e.g., https://linkedin.com/in/username)"
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
          <ProfilePostsTable data={data} loading={loading} />
        </div>
      </div>
    </div>
  );
}