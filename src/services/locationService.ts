import { API_CONFIG } from '../config/api';

const MIN_QUERY_LENGTH = 2;

export interface LocationSuggestion {
  id: string;
  name: string;
  geoUrn: string;
  type: 'city' | 'region' | 'country' | 'metro' | 'worldwide';
  countryCode?: string;
  regionName?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const locationCache = new Map<string, { data: LocationSuggestion[], timestamp: number }>();

const normalizeLocationName = (location: any): string => {
  const parts = [];
  if (location.name) parts.push(location.name);
  if (location.regionName && !location.name.includes(location.regionName)) {
    parts.push(location.regionName);
  }
  if (location.countryName) parts.push(location.countryName);
  return parts.join(', ');
};

export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (!query.trim()) return [];
  if (query.length < MIN_QUERY_LENGTH) return [];

  // Check cache first
  const cacheKey = query.toLowerCase();
  const cached = locationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/search-locations?query=${encodeURIComponent(query)}&limit=10`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_CONFIG.RAPID_API_KEY,
        'x-rapidapi-host': API_CONFIG.RAPID_API_HOST,
        'Accept': 'application/json'
      }
    });

    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch location suggestions');
    }

    const data = await response.json();
    if (!data?.success) {
      throw new Error(data.message || 'Failed to fetch locations');
    }

    const suggestions: LocationSuggestion[] = (data.data?.items || [])
      .filter(item => item.geoUrn && item.name)
      .map(item => ({
        id: item.geoUrn,
        name: normalizeLocationName(item),
        geoUrn: item.geoUrn,
        type: item.type || 'city',
        countryCode: item.countryCode,
        regionName: item.regionName,
        coordinates: item.coordinates || null
      }) as LocationSuggestion)
      .slice(0, 10); // Limit to top 10 results

    // Cache the results
    locationCache.set(cacheKey, {
      data: suggestions,
      timestamp: Date.now()
    });

    return suggestions;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Location search error:', {
        message: error.message,
        query,
        timestamp: new Date().toISOString()
      });
    }
    return [];
  }
}