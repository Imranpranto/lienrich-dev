import { API_CONFIG } from '../config/api';
import { processLinkedInData } from '../utils/dataProcessor';
import type { LinkedInProfile, SearchPeopleResponse, SearchPeopleApiResponse, KeywordSearchParams } from '../types/linkedin';

export async function getProfileDataByUrl(url: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/get-profile-data-by-url?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_CONFIG.RAPID_API_KEY,
        'x-rapidapi-host': API_CONFIG.RAPID_API_HOST,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch profile data (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

interface GetReactionsParams {
  url: string;
  page?: number;
}

interface GetCommentsParams {
  urn: string;
  sort: 'mostRelevant' | 'newest';
  page: number;
}

export async function searchPeopleByUrl(url: string, page: number = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/search-people-by-url`, {
      method: 'POST',
      headers: {
        'x-rapidapi-key': API_CONFIG.RAPID_API_KEY,
        'x-rapidapi-host': API_CONFIG.RAPID_API_HOST,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ url, page }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch profiles (${response.status})`);
    }

    const data: SearchPeopleApiResponse = await response.json();
    
    if (!data?.success) {
      throw new Error(data.message || 'Invalid response format from API');
    }

    // Map the API response to our interface
    const profiles = data.data.items.map(item => ({
      profilePicture: item.profilePicture || '',
      fullName: item.fullName,
      headline: item.headline || '',
      location: item.location || '',
      profileURL: item.profileURL,
      username: item.username || ''
    })).filter(profile => profile.fullName && profile.profileURL);

    if (profiles.length === 0) {
      throw new Error('No profiles found in the search results');
    }

    return profiles;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchPeopleByKeywords({ keywords, location, page = 1 }: KeywordSearchParams) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  if (!keywords || !keywords.trim()) {
    throw new Error('Keywords are required');
  }

  const encodedKeywords = encodeURIComponent(keywords.trim().replace(/\s+/g, '_'));
  const start = (page - 1) * 10;
  const geoParam = location ? `&geo=${encodeURIComponent(location)}` : '';
  const url = `${API_CONFIG.BASE_URL}/search-people?keywords=${encodedKeywords}&start=${start}${geoParam}`;

  console.log('Searching with URL:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_CONFIG.RAPID_API_KEY,
        'x-rapidapi-host': API_CONFIG.RAPID_API_HOST,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      console.error('Search API Error:', errorData);
      throw new Error(errorData.message || `Failed to fetch profiles (${response.status})`);
    }

    const data: SearchPeopleApiResponse = await response.json();
    
    if (!data?.success) {
      console.error('Invalid API Response:', data);
      throw new Error(data.message || 'Invalid response format from API');
    }

    // Map and filter the response data
    const profiles = data.data.items.map(item => ({
      profilePicture: item.profilePicture || '',
      fullName: item.fullName,
      headline: item.headline || '',
      location: item.location || '',
      profileURL: item.profileURL,
      username: item.username || ''
    })).filter(profile => profile.fullName && profile.profileURL);

    if (profiles.length === 0 && page === 1) {
      throw new Error('No profiles found. Please try different keywords.');
    }

    return profiles;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getPostReactions({ url, page = 1 }: GetReactionsParams) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/get-post-reactions`, {
      method: 'POST',
      headers: {
        'x-rapidapi-key': API_CONFIG.RAPID_API_KEY,
        'x-rapidapi-host': API_CONFIG.RAPID_API_HOST,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        url,
        page
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch reactions (${response.status})`);
    }

    const rawData = await response.json();
    if (!rawData?.success) {
      throw new Error('Invalid response format from API');
    }

    const transformedData = processLinkedInData(rawData);
    
    if (!transformedData || transformedData.length === 0) {
      return [];
    }

    return transformedData;

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getPostComments({ urn, sort, page }: GetCommentsParams) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  const cleanUrn = urn.replace(/[^\d]/g, '');
  const url = `${API_CONFIG.BASE_URL}/get-profile-posts-comments?urn=${cleanUrn}&sort=${sort}&page=${page}`;

  console.log('Requesting URL:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_CONFIG.RAPID_API_KEY,
        'x-rapidapi-host': API_CONFIG.RAPID_API_HOST,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }, 
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      throw new Error(errorData.message || `Failed to fetch comments (${response.status})`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    if (!data?.success) {
      console.error('Invalid API Response:', data);
      throw new Error(data.message || 'Invalid response format from API');
    }

    return data.data;
  } catch (error) {
    console.error('API Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getCompanyPosts(username: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  // Clean and validate the username
  const cleanUsername = username.trim().replace(/^\/|\/$/g, '');
  
  if (!cleanUsername) {
    throw new Error('Invalid company username');
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/get-company-posts?username=${cleanUsername}&start=0`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_CONFIG.RAPID_API_KEY,
        'x-rapidapi-host': API_CONFIG.RAPID_API_HOST,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    const responseText = await response.text();
    console.log('Raw API Response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', responseText);
      throw new Error('Failed to parse server response');
    }

    if (!response.ok) {
      throw new Error(data?.message || `Failed to fetch company posts (${response.status})`);
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response structure from API');
    }

    // Handle both direct array response and nested data structure
    const posts = Array.isArray(data) ? data : 
                 Array.isArray(data.data) ? data.data :
                 Array.isArray(data.data?.items) ? data.data.items : 
                 null;

    if (!posts) {
      throw new Error('No posts found for this company');
    }

    return posts.map(post => ({
      text: post.text,
      totalReactionCount: post.totalReactionCount || 0,
      postUrl: post.postUrl,
      postedDate: post.postedDate,
      repostsCount: post.repostsCount || 0
    })).filter(post => post.text && post.postUrl);

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    console.error('Company posts error:', {
      error,
      username: cleanUsername
    });
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}