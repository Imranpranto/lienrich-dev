import React, { useRef, useEffect } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';
import { useLocationSearch } from '../hooks/useLocationSearch';
import type { LocationSuggestion } from '../utils/locations';

interface LocationSearchProps {
  selectedLocations: string[];
  onLocationChange: (locations: string[]) => void;
}

export default function LocationSearch({ selectedLocations, onLocationChange }: LocationSearchProps) {
  const {
    query,
    setQuery,
    suggestions,
    loading,
    error
  } = useLocationSearch();
  
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (geoUrn: string) => {
    if (!geoUrn) return;
    onLocationChange([geoUrn]);
    setQuery('');
    setShowDropdown(false);
  };

  const removeLocation = (geoUrn: string) => {
    onLocationChange(selectedLocations.filter(id => id !== geoUrn));
  };

  const getLocationName = (geoUrn: string): string => {
    try {
      const location = suggestions.find(loc => loc.geoUrn === geoUrn);
      if (!location) {
        const popularLocation = popularLocations.find(loc => loc.geoUrn === geoUrn);
        return popularLocation?.name || 'Unknown Location';
      }
      return location.formattedAddress || location.name || location.city || 'Unknown Location';
    } catch (error) {
      console.error('Error getting location name:', error);
      return 'Unknown Location';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <MapPin className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Enter city, region, or country..."
          className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      {selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedLocations.map(geoUrn => {
            return (
              <div key={geoUrn} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm">
                  <span>{getLocationName(geoUrn)}</span>
                  <button
                    onClick={() => removeLocation(geoUrn)}
                    className="p-0.5 hover:bg-indigo-100 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
              </div>
            );
          })}
        </div>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2">
            {suggestions.map((location) => (
              <button
                key={location.geoUrn}
                onClick={() => handleLocationSelect(location.geoUrn)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
                  selectedLocations.includes(location.geoUrn)
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
                title={location.formattedAddress}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="font-medium">{location.name}</span>
                    {location.formattedAddress && location.formattedAddress !== location.name && (
                      <span className="text-xs text-gray-500">{location.formattedAddress}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}