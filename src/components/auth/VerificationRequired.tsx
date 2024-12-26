import React from 'react';
import { Mail } from 'lucide-react';

export default function VerificationRequired() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-indigo-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
        <p className="text-gray-600 mb-4">
          We've sent a verification link to your email address. Please click the link to verify your account.
        </p>
        
        <div className="bg-amber-50 p-4 rounded-lg text-sm text-amber-800 mb-6">
          <p>Don't see the email? Check your spam folder or contact support if you need help.</p>
        </div>
        
        <p className="text-sm text-gray-500">
          You can close this window and check your email to complete verification.
        </p>
      </div>
    </div>
  );
}