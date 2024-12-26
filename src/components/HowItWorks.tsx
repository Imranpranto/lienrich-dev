import React from 'react';
import { Link2, Search, Database, Download, Send, X } from 'lucide-react';

interface Step {
  icon: typeof Link2;
  title: string;
  description: string;
  tips?: string[];
}

interface HowItWorksProps {
  steps: Step[];
  title?: string;
  onClose?: () => void;
}

export default function HowItWorks({ steps, title = "How does it work?", onClose }: HowItWorksProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="p-6">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <step.icon className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{step.description}</p>
                  {step.tips && step.tips.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Tips:</h4>
                      <ul className="space-y-2">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-sm text-gray-600 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}