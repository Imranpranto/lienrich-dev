import React from 'react';
import { ArrowLeft, Link2, Search, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileDataTable from '../components/ProfileDataTable';
import { getProfileDataByUrl } from '../services/linkedinApi';
import LoadingOverlay from '../components/LoadingOverlay';
import { useCredits } from '../hooks/useCredits';
import HowItWorks from '../components/HowItWorks';

const steps = [
  {
    icon: Link2,
    title: 'Enter LinkedIn Profile URL',
    description: 'Paste the URL of any LinkedIn profile you want to analyze'
  }
];

const howItWorksSteps = [
  {
    icon: Link2,
    title: "Find a LinkedIn Profile",
    description: "Navigate to any LinkedIn profile and copy its URL from your browser's address bar.",
    tips: [
      "Make sure the profile is public or accessible",
      "The URL should contain 'linkedin.com/in/'",
      "You can use both desktop and mobile URLs"
    ]
  }
];

export default function ProfileDataByUrl() {
  const [url, setUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState('');
  const [isHowItWorksOpen, setIsHowItWorksOpen] = React.useState(false);
  const { deductCredits } = useCredits();
  const [creditsDeducted, setCreditsDeducted] = React.useState(false);

  const handleAnalyze = async () => {
    if (!url) {
      setError('Please enter a LinkedIn profile URL');
      setData(null);
      return;
    }

    if (!url.includes('linkedin.com/in/')) {
      setError('Please enter a valid LinkedIn profile URL');
      setData(null);
      return;
    }

    setLoading(true);
    setError('');
    setCreditsDeducted(false);

    try {
      const profileData = await getProfileDataByUrl(url);
      
      // Only deduct credits if we successfully got profile data
      if (profileData) {
        const success = await deductCredits(3, 'data_preview', {
          operation: 'profile_data',
          type: 'flat_rate'
        });
        if (success) {
          setCreditsDeducted(true);
        }
      }
      
      setData(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile data. Please try again.');
      setData(null);
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Profile Data by URL</h1>
            <p className="text-xl text-gray-600">
              Extract comprehensive profile data from any LinkedIn profile URL
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
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
          <ProfileDataTable data={data} loading={loading} />
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