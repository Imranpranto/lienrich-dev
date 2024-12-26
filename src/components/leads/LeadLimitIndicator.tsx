import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { LeadLimit } from '../../types/leads';

export interface LeadLimitIndicatorProps {
  limit: LeadLimit | null;
}

export default function LeadLimitIndicator ({ limit }: LeadLimitIndicatorProps) {
  if (!limit) return null;

  const percentage = (limit?.total || 0) > 0 ? ((limit?.used || 0) / limit.total) * 100 : 0;
  const isNearLimit = percentage >= 80 || limit.remaining <= 50;
  const isAtLimit = limit.remaining === 0;

  return (
    <div className="bg-white px-5 py-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="flex items-center text-sm">
          <span className="font-semibold text-gray-900">{limit?.plan || 'Trial'}</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-600">Plan Limit</span>
          <span className="text-gray-400 mx-2">|</span>
        </h3>
        <span className="text-sm">
          <span className="font-medium text-gray-900">{(limit?.used || 0).toLocaleString()}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{(limit?.total || 0).toLocaleString()}</span>
        </span>
      </div>
      
      <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`absolute left-0 top-0 h-full transition-all duration-300 rounded-full ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {(isNearLimit || isAtLimit) && (
        <div className={`mt-3 flex items-center gap-2 ${
          isAtLimit ? 'text-red-600' : 'text-amber-600'
        }`}>
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs font-medium leading-tight">
            {isAtLimit
              ? `Lead limit reached for ${limit.plan} plan (${limit.total.toLocaleString()} leads)`
              : `${limit.remaining.toLocaleString()} leads remaining (${limit.total.toLocaleString()} total)`
            }
          </span>
        </div>
      )}
    </div>
  );
}