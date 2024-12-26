import { API_CONFIG } from '../config/api';
import type { LocationSuggestion } from '../utils/locations';
import { popularLocations } from '../utils/locations';

interface HereLocation {
  id: string;
  title: string;
  address: {
    label: string;
    countryCode: string;
    countryName: string;
    stateCode: string;
    state: string;
    city: string;
  };
  position: {
    lat: number;
    lng: number;
  };
}

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const locationCache = new Map<string, { data: LocationSuggestion[], timestamp: number }>();

export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (!query || query.length < 2) return [];

  const cacheKey = query.toLowerCase();
  const cached = locationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch( 
      `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(query)}&limit=10`,
      {
        method: 'GET',
        headers: {
          'apiKey': API_CONFIG.HERE_API_KEY,
          'Accept': 'application/json'
        },
        cache: 'no-cache'
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Here API Error:', errorData);
      throw new Error(errorData.message || `Location search failed (${response.status})`);
    }

    const data = await response.json();
    if (!data?.items || !Array.isArray(data.items)) {
      console.error('Invalid HERE API Response:', data);
      throw new Error('Invalid response format from location service');
    }

    const locations: LocationSuggestion[] = data.items.map((item: HereLocation) => ({
      id: `here-${item.id}`,
      geoUrn: generateGeoUrn(item),
      name: formatLocationName(item),
      formattedAddress: item.address.label,
      coordinates: {
        latitude: item.position.lat,
        longitude: item.position.lng
      },
      countryCode: item.address.countryCode,
      city: item.address.city,
      state: item.address.state
    }));

    if (!locations.length) return popularLocations;

    // Cache the results
    locationCache.set(cacheKey, {
      data: locations,
      timestamp: Date.now()
    });

    return locations;
  } catch (error) {
    console.error('Location search error:', error);
    return popularLocations;
  }
}

function generateGeoUrn(item: HereLocation): string {
  // Generate LinkedIn-compatible GeoUrn based on location type
  const cityCode = item.address.city ? '102' : '';
  const stateCode = item.address.stateCode ? '103' : '';
  const countryCode = item.address.countryCode ? '104' : '';
  const randomId = Math.floor(Math.random() * 1000000);
  return `urn:li:geo:${cityCode || stateCode || countryCode}${randomId}`;
}

function formatLocationName(item: HereLocation): string {
  const parts = [];
  if (item.address.city) parts.push(item.address.city);
  if (item.address.state && !item.address.city?.includes(item.address.state)) {
    parts.push(item.address.state);
  }
  if (item.address.countryName && parts.length < 2) {
    parts.push(item.address.countryName);
  }
  return parts.join(', ') || item.address.label;
}