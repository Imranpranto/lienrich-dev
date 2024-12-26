import React from 'react';
import { ThumbsUp, Users, Lock, Zap } from 'lucide-react';

const features = [
  {
    icon: ThumbsUp,
    title: 'Extract Reactions',
    description: 'Get profile data from post reactions instantly'
  },
  {
    icon: Users,
    title: 'Lead Generation',
    description: 'Convert reactions into qualified leads'
  },
  {
    icon: Lock,
    title: 'No Login Required',
    description: 'Access data without authentication'
  },
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'Get results in real-time'
  }
];

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {features.map((feature, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <feature.icon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}