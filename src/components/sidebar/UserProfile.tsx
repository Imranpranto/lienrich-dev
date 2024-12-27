import React, { useState } from 'react';
import { ChevronRight, LogOut, Edit2, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getGravatarUrl } from '../../utils/gravatar';
import { supabase } from '../../lib/supabase';
import { toast } from '../../utils/toast';

export default function UserProfile() {
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState<string>(() => 
    user?.user_metadata?.display_name || user?.email?.split('@')[0] || ''
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileCompletion, setProfileCompletion] = React.useState(0);

  React.useEffect(() => {
    if (!user) return;
    
    // Calculate profile completion percentage
    let completed = 0;
    const total = 4; // Total number of profile fields

    if (user.email) completed++;
    if (user.user_metadata?.display_name) completed++;
    if (user.user_metadata?.avatar_url) completed++;
    if (user.user_metadata?.bio) completed++;

    setProfileCompletion(Math.round((completed / total) * 100));
  }, [user]);

  if (!user) return null;

  const gravatarUrl = user.email ? getGravatarUrl(user.email) : '';

  return (
    <div className="mt-auto pt-4 border-t border-gray-800 space-y-2">
      <div className="group px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700">
            {user.user_metadata?.avatar_url || gravatarUrl ? (
              <img
                src={user.user_metadata?.avatar_url || gravatarUrl}
                alt={user.user_metadata?.display_name || user.email}
                className="w-full h-full rounded-full"
              />
            ) : (
              <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full text-sm bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-indigo-500"
                  disabled={isUpdating}
                />
                <button
                  onClick={async () => {
                    if (!displayName.trim()) return;
                    setIsUpdating(true);
                    try {
                      const { error } = await supabase.auth.updateUser({
                        data: { display_name: displayName.trim() }
                      });
                      if (error) throw error;
                      setIsEditing(false);
                    } catch (err) {
                      console.error('Failed to update display name:', err);
                      toast.error('Failed to update display name');
                    }
                    setIsUpdating(false);
                  }}
                  disabled={isUpdating}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <Check className="h-4 w-4 text-green-500" />
                </button>
                <button
                  onClick={() => {
                    setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || '');
                    setIsEditing(false);
                  }}
                  disabled={isUpdating}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-gray-200 truncate">
                  {user.user_metadata?.display_name || user.email?.split('@')[0]}
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="h-3 w-3 text-gray-400" />
                </button>
              </div>
            )}
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

          <div className="flex items-center gap-2">
            <Link to="/settings">
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
            </Link>
            <button
              onClick={async () => {
                try {
                  await signOut();
                } catch (err) {
                  console.error('Failed to sign out:', err);
                  toast.error('Failed to sign out');
                }
              }}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <LogOut className="h-4 w-4 text-gray-400 hover:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
