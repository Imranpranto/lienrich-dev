import { useState, useEffect, useMemo } from 'react';
import type { Service } from '../contexts/ServicesContext';

export function useSearch(services: Service[], query: string) {
  const [suggestions, setSuggestions] = useState<Service[]>([]);

  const searchServices = useMemo(() => {
    return (searchQuery: string) => {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      
      if (!normalizedQuery) return [];

      return services
        .map(service => {
          const titleMatch = service.title.toLowerCase().includes(normalizedQuery);
          const descriptionMatch = service.description.toLowerCase().includes(normalizedQuery);
          
          // Calculate relevance score
          let score = 0;
          if (titleMatch) score += 3;
          if (service.title.toLowerCase().startsWith(normalizedQuery)) score += 2;
          if (descriptionMatch) score += 1;
          
          return { ...service, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(({ score, ...service }) => service);
    };
  }, [services]);

  useEffect(() => {
    setSuggestions(searchServices(query));
  }, [query, searchServices]);

  return suggestions;
}