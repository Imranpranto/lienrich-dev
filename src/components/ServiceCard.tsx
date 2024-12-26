import React from 'react';
import { LucideIcon, Linkedin } from 'lucide-react';
import type { Service } from '../contexts/ServicesContext';

interface ServiceCardProps {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  path?: string;
  isMostPopular?: boolean;
  domain?: string;
  onClick?: () => void;
}

export default function ServiceCard({
  id,
  title,
  description,
  icon: Icon,
  path,
  features,
  domain = "linkedin.com",
  isMostPopular = false,
  onClick
}: ServiceCardProps) {

  return (
    <div 
      className="group relative cursor-pointer perspective-1000"
      onClick={() => onClick?.()} 
    >
      <div className="relative bg-white rounded-xl transition-all duration-500 preserve-3d hover:shadow-2xl border border-gray-100">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
                <Icon className="h-6 w-6 text-indigo-600" />
              </div>
              {isMostPopular && (
                <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-sm">
                  Most Popular
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn.com</span>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 text-sm mb-6">{description}</p>
          
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-500">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-100 rounded-b-xl">
          <button 
            onClick={() => onClick?.()}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2 group"
          >
            Enrich
            <svg 
              className="w-4 h-4 transition-transform duration-200 transform group-hover:translate-x-0.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}