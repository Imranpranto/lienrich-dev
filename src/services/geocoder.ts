import { API_CONFIG } from '../config/api';

const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours
const locationCache = new Map<string, { data: GeocodedLocation[], timestamp: number }>();

export interface GeocodedLocation {
  id: string;
  geoUrn: string;
  name: string;
  formattedAddress: string;
  type: 'city' | 'state' | 'country';
}

export async function searchLocations(query: string): Promise<GeocodedLocation[]> {
  if (!query.trim() || query.length < 2) return [];

  const cacheKey = query.toLowerCase();
  const cached = locationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/search-locations`, {
      method: 'POST',
      headers: {
        'x-rapidapi-key': API_CONFIG.RAPID_API_KEY,
        'x-rapidapi-host': API_CONFIG.RAPID_API_HOST,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Invalid response from location service');
    }

    const locations = data.data.items.map((item: any) => ({
      id: item.id || generateLocationId(item),
      geoUrn: item.geoUrn || generateGeoUrn(item),
      name: item.name || formatLocationName(item),
      formattedAddress: item.formattedAddress || item.name,
      type: item.type || determineLocationType(item)
    }));

    // Cache results
    locationCache.set(cacheKey, {
      data: locations,
      timestamp: Date.now()
    });

    return locations;
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
}

function generateLocationId(item: any): string {
  return `loc-${Math.random().toString(36).substr(2, 9)}`;
}

function generateGeoUrn(item: any): string {
  return item.id || `urn:li:geo:${Math.random().toString(36).substr(2, 9)}`;
}

function formatLocationName(item: any): string {
  const parts = [];
  if (item.city) parts.push(item.city);
  if (item.region && !item.city?.includes(item.region)) {
    parts.push(item.region);
  }
  if (item.country && parts.length < 2) parts.push(item.country);
  return parts.join(', ') || item.name || 'Unknown Location';
}

function determineLocationType(item: any): 'city' | 'state' | 'country' {
  if (item.type === 'city' || item.city) return 'city';
  if (item.type === 'state' || item.region) return 'state';
  return 'country';
}

export function clearLocationCache(): void {
  locationCache.clear();
}