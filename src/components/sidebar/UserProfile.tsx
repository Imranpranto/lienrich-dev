import React from 'react';
import { Settings, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getGravatarUrl } from '../../utils/gravatar';

export default function UserProfile() {
  const { user } = useAuth();
  const [profileCompletion, setProfileCompletion] = React.useState(0);

  React.useEffect(() => {
    if (!user) return;
    
    // Calculate profile completion percentage
    let completed = 0;
    let total = 4; // Total number of profile fields

    if (user.email) completed++;
    if (user.user_metadata?.display_name) completed++;
    if (user.user_metadata?.avatar_url) completed++;
    if (user.user_metadata?.bio) completed++;

    setProfileCompletion(Math.round((completed / total) * 100));
  }, [user]);

  if (!user) return null;

  const gravatarUrl = getGravatarUrl(user.email);

  return (
    <div className="mt-auto pt-4 border-t border-gray-800">
      <Link
        to="/settings"
        className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors"
      >
        <div className="relative">
          <img
            src={user.user_metadata?.avatar_url || gravatarUrl}
            alt={user.user_metadata?.display_name || user.email}
            className="w-10 h-10 rounded-full bg-gray-700"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-200 truncate">
            {user.user_metadata?.display_name || user.email?.split('@')[0]}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{profileCompletion}%</span>
          </div>
        </div>

        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
      </Link>
    </div>
  );
}