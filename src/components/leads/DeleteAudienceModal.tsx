import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteAudienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  audienceName: string;
  loading?: boolean;
}

export default function DeleteAudienceModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  audienceName,
  loading 
}: DeleteAudienceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Audience</h3>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-medium">"{audienceName}"</span>? 
              This action cannot be undone and all leads in this audience will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete Audience'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}