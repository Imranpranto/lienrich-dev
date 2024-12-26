import { toast } from './toast';

interface UrlValidationResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export function extractLinkedInPostId(url: string): UrlValidationResult {
  if (!url) {
    return {
      success: false,
      error: 'Please check your URL'
    };
  }

  try {
    // Validate URL format
    new URL(url);
  } catch {
    return {
      success: false,
      error: 'Please enter a valid URL'
    };
  }

  // Check if it's a LinkedIn URL
  if (!url.includes('linkedin.com')) {
    return {
      success: false,
      error: 'Please enter a LinkedIn URL'
    };
  }

  // Extract 19-digit post ID using regex
  // Look for any sequence of exactly 19 digits that appears after 'activity' or 'ugcPost'
  const postIdMatch = url.match(/(?:activity|ugcPost)[-:]?(\d{19})/);
  
  if (!postIdMatch || !postIdMatch[1]) {
    return {
      success: false,
      error: 'Could not extract post ID. Please ensure the URL contains a valid LinkedIn post ID'
    };
  }

  const postId = postIdMatch[1];

  // Validate exact length
  if (postId.length !== 19) {
    return {
      success: false,
      error: 'The extracted post ID is not in the correct format'
    };
  }

  return {
    success: true,
    postId
  };
}

export function handleUrlValidation(url: string): string | null {
  const result = extractLinkedInPostId(url);

  if (!result.success) {
    // Show error toast with appropriate styling
    toast.error(result.error || 'Something went wrong');
    return null;
  }

  return result.postId;
}