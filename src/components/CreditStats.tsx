import React, { useEffect } from 'react';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const defaultStats = {
  totalCredits: 250,
  usedCredits: 0,
  remainingCredits: 250
};

export default function CreditStats() {
  const { totalCredits, usedCredits, remainingCredits } = defaultStats;

  const stats = [
    {
      icon: CreditCard,
      label: 'Total Credits',
      value: totalCredits.toLocaleString(),
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: CheckCircle,
      label: 'Used Credits',
      value: usedCredits.toLocaleString(),
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: AlertCircle,
      label: 'Credits Left',
      value: remainingCredits.toLocaleString(),
      color: 'from-violet-500 to-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r opacity-75 blur-sm transition duration-300 group-hover:opacity-100 rounded-xl"
               style={{
                 backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                background: stat.color
              }}
          />
          <div className="relative bg-white p-6 rounded-xl flex items-center gap-4 transition-transform duration-300 hover:-translate-y-0.5">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}