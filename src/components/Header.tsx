import React from 'react';
import { Search, X, Bell } from 'lucide-react';
import Logo from './Logo';
import MobileMenu from './MobileMenu';
import SearchSuggestions from './SearchSuggestions';
import { useServices } from '../contexts/ServicesContext';
import { useSearch } from '../hooks/useSearch';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const { services } = useServices();
  const navigate = useNavigate();
  const suggestions = useSearch(services, searchQuery);

  const handleServiceSelect = (service: typeof services[0]) => {
    setSearchQuery('');
    setIsFocused(false);
    navigate(service.path || `/service/${service.id}`);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="md:hidden flex items-center gap-4">
          <Logo variant="small" theme="light" />
          <MobileMenu />
        </div>
        <div className="relative hidden md:block w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search operations..."
              className="w-full pl-10 pr-10 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <SearchSuggestions
            suggestions={suggestions}
            onSelect={handleServiceSelect}
            visible={isFocused && searchQuery.length > 0}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}