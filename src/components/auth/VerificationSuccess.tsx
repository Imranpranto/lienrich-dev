import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VerificationSuccess() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
        <p className="text-gray-600 mb-6">
          Your email has been successfully verified. You can now access all features of LiEnrich.
        </p>
        
        <Link
          to="/auth"
          className="inline-flex justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Continue to Login
        </Link>
      </div>
    </div>
  );
}