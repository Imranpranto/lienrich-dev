import { useState, useEffect, useCallback } from 'react';
import { searchLocations } from '../services/hereLocationService';
import { popularLocations, LocationSuggestion } from '../utils/locations';

export function useLocationSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>(popularLocations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches] = useState<LocationSuggestion[]>([]);

  const searchWithDebounce = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([...recentSearches, ...popularLocations]);
      setLoading(false);
      return;
    }

    if (searchQuery.length < 2) {
      setSuggestions([...recentSearches, ...popularLocations]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchLocations(searchQuery);
      setSuggestions([...results, ...recentSearches]);
      setError(null);
    } catch (error) {
      console.error('Location search failed:', error);
      setError('Failed to load locations. Please try again.');
      setSuggestions([...recentSearches, ...popularLocations]);
    } finally {
      setLoading(false);
    }
  }, [recentSearches]);

  const addToRecentSearches = useCallback((location: LocationSuggestion) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.geoUrn !== location.geoUrn);
      return [location, ...filtered].slice(0, 5);
    });
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchWithDebounce(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, searchWithDebounce]);

  return {
    query,
    setQuery,
    suggestions,
    recentSearches,
    addToRecentSearches,
    loading,
    error
  };
}