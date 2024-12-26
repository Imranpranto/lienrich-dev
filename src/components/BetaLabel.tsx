import React from 'react';

interface BetaLabelProps {
  theme?: 'light' | 'dark';
  className?: string;
}

export default function BetaLabel({ theme = 'light', className = '' }: BetaLabelProps) {
  const isDark = theme === 'dark';
  
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded blur-[2px] transition-opacity duration-200 group-hover:opacity-100 opacity-0" />
      <div className={`relative px-2 py-0.5 rounded text-[0.65rem] font-medium tracking-wide uppercase
        ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-indigo-600'}
        shadow-sm border border-indigo-100/50 transition-all duration-200
        group-hover:border-indigo-200/50 group-hover:shadow-md`}>
        beta
      </div>
    </div>
  );
}