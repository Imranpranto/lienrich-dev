import React from 'react';
import { Activity } from 'lucide-react';

const activities = [
  {
    type: 'profile_view',
    user: 'Sarah Miller',
    time: '2 minutes ago',
  },
  {
    type: 'connection',
    user: 'John Davidson',
    time: '15 minutes ago',
  },
  {
    type: 'email_found',
    user: 'Tech Solutions Inc.',
    time: '1 hour ago',
  },
  {
    type: 'post_engagement',
    user: 'Marketing Weekly',
    time: '3 hours ago',
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <Activity className="h-5 w-5 text-indigo-600" />
      </div>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-indigo-600" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">{activity.user}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}