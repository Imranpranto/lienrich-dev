import React from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { useServices } from '../contexts/ServicesContext';
import { Link, useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import type { Service } from '../contexts/ServicesContext';

export default function Operations() {
  const { services } = useServices();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredServices = React.useMemo(() => {
    if (!searchQuery.trim()) return services;
    
    const query = searchQuery.toLowerCase();
    return services.filter(service => 
      service.title.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query)
    );
  }, [services, searchQuery]);

  const handleServiceClick = (service: Service) => {
    if (service.path) {
      navigate(service.path);
    } else {
      navigate(`/service/${service.id}`);
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

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Operations</h1>
          <p className="text-gray-500">Access all LinkedIn data enrichment operations in one place</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search operations..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard 
              key={service.id} 
              {...service}
              onClick={() => handleServiceClick(service)}
            />
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No operations found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}