import { useNavigate } from 'react-router-dom';
import { useCreditsStats } from './useCreditsStats';
import { useCallback } from 'react';
import { toast } from '../utils/toast';

interface OperationRequirements {
  [key: string]: {
    minCredits: number;
    name: string;
  };
}

const OPERATION_REQUIREMENTS: OperationRequirements = {
  'get-post-reactions': { minCredits: 10, name: 'Get Post Reactions' },
  'profile-post-commentators': { minCredits: 10, name: 'Post Commentators' },
  'article-comments': { minCredits: 10, name: 'Article Comments' },
  'article-reactions': { minCredits: 10, name: 'Article Reactions' },
  'profile-posts': { minCredits: 50, name: 'Profile Posts' },
  'company-posts': { minCredits: 50, name: 'Company Posts' },
  'profile-data-by-url': { minCredits: 3, name: 'Profile Data by URL' }
};

export function useOperationAccess() {
  const { remainingCredits } = useCreditsStats();
  const navigate = useNavigate();

  const checkAccess = useCallback((operationId: string): boolean => {
    const requirements = OPERATION_REQUIREMENTS[operationId];
    if (!requirements) return true;

    if (remainingCredits < requirements.minCredits) {
      toast.error(
        `You need at least ${requirements.minCredits} credits to use ${requirements.name}. ` +
        `You currently have ${remainingCredits} credits.`
      );
      navigate('/pricing');
      return false;
    }

    return true;
  }, [remainingCredits]);

  const getRequiredCredits = useCallback((operationId: string): number => {
    return OPERATION_REQUIREMENTS[operationId]?.minCredits || 0;
  }, []);

  const hasEnoughCredits = useCallback((operationId: string): boolean => {
    const minCredits = getRequiredCredits(operationId);
    return remainingCredits >= minCredits;
  }, [remainingCredits]);

  return { 
    checkAccess,
    getRequiredCredits,
    hasEnoughCredits
  };
}