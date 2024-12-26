export interface LocationSuggestion {
  id: string;
  name: string;
  geoUrn: string;
  formattedAddress?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  countryCode?: string;
  city?: string;
  state?: string;
}

export const popularLocations: LocationSuggestion[] = [
  { 
    id: '1', 
    name: 'New York, NY', 
    geoUrn: '102571732',
    formattedAddress: 'New York, New York, United States',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    countryCode: 'US',
    city: 'New York',
    state: 'New York'
  },
  { 
    id: '2', 
    name: 'San Francisco Bay Area',
    geoUrn: '102277331',
    formattedAddress: 'San Francisco Bay Area, California, United States',
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
    countryCode: 'US',
    city: 'San Francisco',
    state: 'California'
  }
];

export function formatGeoParam(geoUrns: string[]): string | null {
  // Filter out any empty or invalid geoUrns
  const validGeoUrns = geoUrns.filter(urn => urn && urn.trim());
  return validGeoUrns.length > 0 ? validGeoUrns[0] : null;
}