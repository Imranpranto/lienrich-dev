import React from 'react';

interface LoadingOverlayProps {
  isOpen: boolean;
}

export default function LoadingOverlay({ isOpen }: LoadingOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl animate-pulse" />
          <div className="relative">
            <div className="p-4 bg-white rounded-xl shadow-lg">
              <img
                src="https://rkcdvqdkuwgfdnbizbzi.supabase.co/storage/v1/object/public/public-storage/lienrich-logo.svg"
                alt="LiEnrich Logo"
                className="h-8 w-8 animate-bounce"
              />
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            LiEnrich is Working
          </h3>
          <p className="text-gray-600">
            We are preparing your data...
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}