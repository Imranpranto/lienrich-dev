import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCreditsStats } from '../../hooks/useCreditsStats';
import { useNavigate, useLocation } from 'react-router-dom';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  operationName: string;
  requiredCredits: number;
}

export default function InsufficientCreditsModal({
  isOpen,
  onClose,
  operationName,
  requiredCredits,
}: InsufficientCreditsModalProps) {
  const { remainingCredits } = useCreditsStats();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    if (!isHomePage) {
      navigate('/');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Insufficient Credits</h3>
            
            <p className="text-gray-600 mb-4">
              You need at least <span className="font-medium text-amber-600">{requiredCredits.toLocaleString()} credits</span> to use {operationName}.
              You currently have <span className="font-medium">{remainingCredits.toLocaleString()} credits</span>.
            </p>

            <div className="w-full p-4 bg-amber-50 rounded-lg mb-6">
              <p className="text-sm text-amber-700">
                Upgrade your subscription to access this feature and get more credits. Your remaining credits will be preserved.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <Link
                to="/pricing"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                onClick={onClose}
              >
                View Pricing Plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}