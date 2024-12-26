import { LinkedInProfile } from '../types/linkedin';

/**
 * Validates and processes the raw API response data
 * @param apiResponse Raw response from the LinkedIn API
 * @returns Processed and validated data ready for the DataTable
 */
export function processLinkedInData(apiResponse: any): LinkedInProfile[] {
  if (!apiResponse || typeof apiResponse !== 'object') {
    throw new Error('Invalid API response format');
  }

  // Handle the nested data structure from the API
  const items = apiResponse.data?.items || [];

  return items.map((item: any) => {
    // Validate required fields
    if (!item.fullName || !item.profileUrl) {
      console.warn('Missing required fields in profile data:', item);
    }

    // Get the first profile picture URL if available
    const profilePicture = Array.isArray(item.profilePicture) && item.profilePicture.length > 0
      ? item.profilePicture[0].url
      : '';

    return {
      profilePicture,
      fullName: sanitizeString(item.fullName || item.full_name),
      profileUrl: sanitizeUrl(item.profileUrl || item.profile_url),
      profileType: normalizeProfileType(item.profileType || item.profile_type),
      reactionType: normalizeReactionType(item.reactionType || item.reaction_type),
      headline: sanitizeString(item.headline),
      urn: item.urn || ''
    };
  }).filter(profile => profile.fullName && profile.profileUrl);
}

/**
 * Sanitizes and validates URLs
 */
function sanitizeUrl(url: string): string {
  if (!url) return '';
  try {
    const sanitized = new URL(url).toString();
    return sanitized;
  } catch {
    return '';
  }
}

/**
 * Sanitizes string inputs
 */
function sanitizeString(str: string): string {
  return str ? String(str).trim() : '';
}

/**
 * Normalizes profile type values
 */
function normalizeProfileType(type: string): string {
  const validTypes = ['User', 'Company', 'Group'];
  const normalized = type?.trim() || 'User';
  return validTypes.includes(normalized) ? normalized : 'User';
}

/**
 * Normalizes reaction type values
 */
function normalizeReactionType(type: string): string {
  const validTypes = ['Like', 'Celebrate', 'Support', 'Love', 'Insightful', 'Curious'];
  const normalized = type?.trim() || 'Like';
  return validTypes.includes(normalized) ? normalized : 'Like';
}