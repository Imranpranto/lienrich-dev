import { isNetworkError } from './errorHelpers';

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  shouldRetry?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  delayMs: 1000,
  shouldRetry: (error) => {
    // Retry on network errors or specific API errors
    if (isNetworkError(error)) return true;
    if (error?.message?.includes('Failed to fetch')) return true;
    if (error?.message?.includes('Network request failed')) return true;
    return false;
  }
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === opts.maxRetries - 1 || !opts.shouldRetry(error)) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, opts.delayMs));
    }
  }

  throw lastError;
}