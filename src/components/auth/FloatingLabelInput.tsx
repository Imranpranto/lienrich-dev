import React from 'react';

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function FloatingLabelInput({ 
  label, 
  error, 
  id,
  ...props 
}: FloatingLabelInputProps) {
  return (
    <div className="relative">
      <input
        {...props}
        id={id}
        placeholder=" "
        className={`
          block w-full px-4 py-3 text-gray-900 bg-white border rounded-lg
          peer placeholder-transparent focus:outline-none focus:ring-2 transition-all
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
          }
        `}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 -top-2.5 px-1 text-sm transition-all 
          peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 
          peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm
          pointer-events-none bg-white
          ${error 
            ? 'text-red-500 peer-focus:text-red-500' 
            : 'text-gray-500 peer-focus:text-indigo-600'
          }
        `}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}