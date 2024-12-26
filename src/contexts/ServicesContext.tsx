import React, { createContext, useContext } from 'react';
import { Building, User, MessagesSquare, ThumbsUp, UserSearch, BookOpen, Heart, CreditCard } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Service {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  path?: string;
  isMostPopular?: boolean;
}

export const services: Service[] = [
  {
    id: 'post-reactions',
    icon: ThumbsUp,
    title: "Get Post Reactions",
    description: "Extract valuable profile data from LinkedIn post reactions",
    features: [
      "Access reaction profiles instantly",
      "Export data in multiple formats",
      "Webhook integration support"
    ],
    path: "/get-post-reactions",
    isMostPopular: true,
  },
  {
    id: 'post-commentators',
    icon: MessagesSquare,
    title: "Post Commentators",
    description: "Discover engaged professionals from post comments",
    features: [
      "Extract commentator profiles",
      "Access engagement insights",
      "Real-time data processing"
    ],
    path: "/profile-post-commentators",
    isMostPopular: true
  },
  {
    id: 'profile-posts',
    icon: User,
    title: "Profile Posts", 
    description: "Analyze content from any LinkedIn profile",
    features: [
      "Track post performance",
      "Monitor engagement metrics",
      "Historical post analysis"
    ],
    path: "/profile-posts"
  },
  {
    id: 'company-posts',
    icon: Building,
    title: "Company Posts",
    description: "Monitor and analyze company page content",
    features: [
      "Company post analytics",
      "Engagement tracking",
      "Content performance metrics"
    ],
    path: "/company-posts"
  },
  {
    id: 'profile-data-by-url',
    icon: UserSearch,
    title: "Profile Data by URL",
    description: "Extract comprehensive profile data from any LinkedIn profile URL",
    features: [
      "Detailed profile information",
      "Education and work history",
      "Skills and endorsements"
    ],
    path: "/profile-data-by-url"
  },
  {
    id: 'article-comments',
    icon: BookOpen,
    title: "Article Comments",
    description: "Extract profile data from LinkedIn article comments",
    features: [
      "Access commentator profiles",
      "View engagement insights",
      "Real-time data processing"
    ],
    path: "/article-comments"
  },
  {
    id: 'article-reactions',
    icon: Heart,
    title: "Article Reactions",
    description: "Extract profile data from LinkedIn article reactions",
    features: [
      "Access reaction profiles",
      "View reaction types",
      "Real-time data processing"
    ],
    path: "/article-reactions"
  },
];

const ServicesContext = createContext<{ services: Service[] }>({ services });

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  return (
    <ServicesContext.Provider value={{ services }}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  return useContext(ServicesContext);
}