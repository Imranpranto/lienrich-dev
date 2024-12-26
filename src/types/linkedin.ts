export interface LinkedInProfile {
  profilePicture: string;
  fullName: string;
  headline?: string;
  location?: string;
  profileURL?: string;
  username?: string;
}

export interface SearchPeopleApiResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    items: Array<{
      fullName: string;
      headline?: string;
      summary?: string;
      profilePicture?: string;
      location?: string;
      profileURL: string;
      username?: string;
    }>;
  };
}

export interface SearchPeopleResponse {
  success: boolean;
  profiles: LinkedInProfile[];
  message?: string;
}

export interface KeywordSearchParams {
  keywords: string;
  location?: string;
  page?: number;
}