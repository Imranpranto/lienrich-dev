import React from 'react';

interface LogoProps {
  variant?: 'default' | 'small';
  theme?: 'light' | 'dark';
  showText?: boolean;
}

export default function Logo({ variant = 'default', theme = 'light', showText = true }: LogoProps) {
  const isSmall = variant === 'small';
  const isDark = theme === 'dark';
  const logoSize = isSmall ? 'h-8 w-8' : showText ? 'h-8 w-8' : 'h-8 w-8';

  return (
    <div className="flex items-center gap-2">
      <div className="group">
        <div className={`p-2 rounded-lg transition-colors duration-200 
          ${isDark ? 'bg-gray-800' : 'bg-indigo-50/50'} 
          ${isDark ? 'group-hover:bg-gray-700' : 'group-hover:bg-indigo-100/50'}`}>
          <img
            src="https://rkcdvqdkuwgfdnbizbzi.supabase.co/storage/v1/object/public/public-storage/lienrich-logo.svg"
            alt="LiEnrich Logo"
            className={`${logoSize} transition-opacity duration-200 object-contain`}
          />
        </div>
      </div>
      {showText && <div className="flex items-center gap-2">
        <span className={`font-bold ${isSmall ? 'text-lg' : 'text-xl'} 
          ${isDark ? 'text-white' : 'text-gray-900'}`}>
          LiEnrich
        </span>
      </div>}
    </div>
  );
}