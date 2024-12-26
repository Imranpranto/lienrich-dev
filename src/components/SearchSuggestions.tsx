import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Service } from '../contexts/ServicesContext';

interface SearchSuggestionsProps {
  suggestions: Service[];
  onSelect: (service: Service) => void;
  visible: boolean;
}

export default function SearchSuggestions({ suggestions, onSelect, visible }: SearchSuggestionsProps) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
      <ul className="py-2 max-h-[280px] overflow-y-auto">
        {suggestions.map((service) => (
          <li key={service.id}>
            <button
              onClick={() => onSelect(service)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-indigo-50 rounded-md">
                  <service.icon className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{service.title}</div>
                  <div className="text-xs text-gray-500">{service.description}</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}