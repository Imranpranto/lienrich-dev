export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  // Check for common network error types
  if (error instanceof TypeError && error.message === 'Failed to fetch') return true;
  if (error.name === 'NetworkError') return true;
  if (error.message?.includes('network')) return true;
  if (error.message?.includes('Failed to fetch')) return true;
  
  // Check for specific error codes
  const errorCode = error.code || error.status;
  if (errorCode === 'ECONNREFUSED') return true;
  if (errorCode === 'ECONNRESET') return true;
  if (errorCode === 'ETIMEDOUT') return true;
  
  return false;
}

export function getErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred';
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}