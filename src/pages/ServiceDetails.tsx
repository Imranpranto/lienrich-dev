import React from 'react';
import { ArrowLeft, ThumbsUp, Users, Lock, Zap } from 'lucide-react';
import { useServices } from '../contexts/ServicesContext';
import { Link, useParams } from 'react-router-dom';

export default function ServiceDetails() {
  const { serviceId } = useParams();
  const { services } = useServices();
  const service = services.find(s => s.id === serviceId);

  if (!service) {
    return <div>Service not found</div>;
  }

  return (
    <div className="p-8">
      <Link 
        to="/" 
        className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>
      
      <div className="max-w-4xl">
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <service.icon className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
            <p className="text-lg text-gray-600">{service.description}</p>
          </div>
        </div>

      </div>
    </div>
  );
}