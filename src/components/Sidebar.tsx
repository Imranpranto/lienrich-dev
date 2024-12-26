import React, { useState } from 'react';
import { Home, LayoutGrid, BarChart2, Cable, Settings, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import WebhookCard from './sidebar/WebhookCard';
import UserProfile from './sidebar/UserProfile';
import Logo from './Logo';

const COLLAPSED_WIDTH = '64px';
const EXPANDED_WIDTH = '256px';

const mainMenuItems = [
  { icon: Home, label: 'Dashboard', to: '/' },
  { icon: LayoutGrid, label: 'Operations', to: '/operations' },
  { icon: Users, label: 'Leads', to: '/leads' },
  { icon: Cable, label: 'Integrations', to: '/integrations' },
  { icon: BarChart2, label: 'Analytics', to: '/analytics' }
];

const bottomMenuItems = [
  { icon: Settings, label: 'Settings', to: '/settings' }
];

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div 
      className="fixed top-0 left-0 h-screen bg-gray-900 flex flex-col overflow-hidden transition-all duration-300 ease-in-out z-50"
      style={{ width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="p-4 mb-4 border-b border-gray-800">
        <Link to="/" className="flex items-center justify-center">
          <Logo 
            theme="dark" 
            variant={isExpanded ? 'default' : 'small'} 
            showText={isExpanded}
          />
        </Link>
      </div>
      <nav className="flex-1 flex flex-col px-2 py-4">
        {/* Main menu items */}
        <ul className="space-y-2">
          {mainMenuItems.map((item, index) => (
            <li key={item.label}>
              <Link
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 overflow-hidden ${
                  isActive(item.to)
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <item.icon className={`h-6 w-6 min-w-[24px] ${!isExpanded ? 'mx-auto' : ''}`} />
                <span className={`whitespace-nowrap transition-opacity duration-200 ${
                  isExpanded ? 'opacity-100' : 'opacity-0 w-0'
                }`}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Bottom menu items */}
        <ul className="mt-auto pt-4 space-y-2 border-t border-gray-800">
          {bottomMenuItems.map((item, index) => (
            <li key={item.label}>
              <Link
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 overflow-hidden ${
                  isActive(item.to)
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <item.icon className={`h-6 w-6 min-w-[24px] ${!isExpanded ? 'mx-auto' : ''}`} />
                <span className={`whitespace-nowrap transition-opacity duration-200 ${
                  isExpanded ? 'opacity-100' : 'opacity-0 w-0'
                }`}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <UserProfile />
    </div>
  );
}