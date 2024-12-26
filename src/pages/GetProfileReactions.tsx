import React from 'react';
import { ArrowLeft, UserCircle, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: UserCircle,
    title: 'Enter the LinkedIn profile URL',
    description: 'Paste the URL of any LinkedIn profile you want to analyze'
  },
  {
    icon: Users,
    title: 'Extract profile data',
    description: 'Our system automatically extracts profile information and engagement data'
  },
  {
    icon: Shield,
    title: 'Get detailed information',
    description: 'Access comprehensive profile details without authentication'
  }
];

export default function GetProfileReactions() {
  return (
    <div className="p-8">
      <Link 
        to="/" 
        className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get Profile Reactions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Extract profile data from post reactions without login - perfect for lead generation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300" />
              <div className="relative bg-white p-8 rounded-xl transform transition duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100">
                <span className="absolute -top-4 -left-4 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </span>
                <div className="p-3 bg-indigo-50 rounded-lg inline-flex mb-6">
                  {React.createElement(step.icon, { className: "h-6 w-6 text-indigo-600" })}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-12 rounded-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Start extracting valuable LinkedIn data with LiEnrich today.
            No login required, instant access to the information you need.
          </p>
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            Try it Now
          </button>
        </div>
      </div>
    </div>
  );
}