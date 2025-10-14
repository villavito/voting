// Centralized error handling utility

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
}

/**
 * Parse Firebase Auth errors into user-friendly messages
 */
export function parseAuthError(error: any): AppError {
  const code = error.code || 'unknown';
  let userMessage = 'An unexpected error occurred. Please try again.';

  switch (code) {
    case 'auth/email-already-in-use':
      userMessage = 'This email is already registered. Please use a different email or login.';
      break;
    case 'auth/invalid-email':
      userMessage = 'Invalid email address. Please check and try again.';
      break;
    case 'auth/weak-password':
      userMessage = 'Password should be at least 6 characters long.';
      break;
    case 'auth/user-not-found':
      userMessage = 'No account found with this email. Please register first.';
      break;
    case 'auth/wrong-password':
      userMessage = 'Incorrect password. Please try again.';
      break;
    case 'auth/too-many-requests':
      userMessage = 'Too many failed attempts. Please try again later.';
      break;
    case 'auth/network-request-failed':
      userMessage = 'Network error. Please check your internet connection.';
      break;
    case 'auth/user-disabled':
      userMessage = 'This account has been disabled. Please contact support.';
      break;
    case 'auth/requires-recent-login':
      userMessage = 'Please log out and log in again to perform this action.';
      break;
    default:
      userMessage = error.message || 'Authentication failed. Please try again.';
  }

  return {
    code,
    message: error.message || 'Unknown error',
    userMessage
  };
}

/**
 * Parse Firebase Firestore errors into user-friendly messages
 */
export function parseFirestoreError(error: any): AppError {
  const code = error.code || 'unknown';
  let userMessage = 'An unexpected error occurred. Please try again.';

  switch (code) {
    case 'permission-denied':
      userMessage = 'You do not have permission to perform this action.';
      break;
    case 'not-found':
      userMessage = 'The requested data was not found.';
      break;
    case 'already-exists':
      userMessage = 'This record already exists.';
      break;
    case 'failed-precondition':
      userMessage = 'Operation failed due to invalid state. Please refresh and try again.';
      break;
    case 'aborted':
      userMessage = 'Operation was aborted. Please try again.';
      break;
    case 'unavailable':
      userMessage = 'Service is temporarily unavailable. Please try again later.';
      break;
    case 'data-loss':
      userMessage = 'Data loss detected. Please contact support.';
      break;
    case 'unauthenticated':
      userMessage = 'You must be logged in to perform this action.';
      break;
    case 'resource-exhausted':
      userMessage = 'Too many requests. Please try again later.';
      break;
    default:
      userMessage = error.message || 'Database operation failed. Please try again.';
  }

  return {
    code,
    message: error.message || 'Unknown error',
    userMessage
  };
}

/**
 * Parse voting-specific errors
 */
export function parseVotingError(error: any): AppError {
  const message = error.message || '';
  let userMessage = 'An error occurred while processing your vote.';

  if (message.includes('already voted')) {
    userMessage = 'You have already voted for this position.';
  } else if (message.includes('No active voting cycle')) {
    userMessage = 'There is no active voting session at this time.';
  } else if (message.includes('not approved')) {
    userMessage = 'Your account needs to be approved before you can vote.';
  } else if (message.includes('permission')) {
    userMessage = 'You do not have permission to vote.';
  } else {
    userMessage = message || 'Failed to submit your vote. Please try again.';
  }

  return {
    code: 'voting-error',
    message,
    userMessage
  };
}

/**
 * Parse network errors
 */
export function parseNetworkError(error: any): AppError {
  return {
    code: 'network-error',
    message: error.message || 'Network error',
    userMessage: 'Network connection error. Please check your internet connection and try again.'
  };
}

/**
 * Generic error parser - tries to determine the error type
 */
export function parseError(error: any, context?: string): AppError {
  console.error(`Error in ${context || 'unknown context'}:`, error);

  // Check error type
  if (error.code?.startsWith('auth/')) {
    return parseAuthError(error);
  }
  
  if (error.code?.startsWith('firestore/') || error.code === 'permission-denied') {
    return parseFirestoreError(error);
  }

  if (error.message?.toLowerCase().includes('network')) {
    return parseNetworkError(error);
  }

  if (context === 'voting') {
    return parseVotingError(error);
  }

  // Default error
  return {
    code: 'unknown',
    message: error.message || 'Unknown error',
    userMessage: error.message || 'An unexpected error occurred. Please try again.'
  };
}

/**
 * Log error to console (can be extended to log to external service)
 */
export function logError(error: any, context?: string, additionalInfo?: any) {
  console.error('=== Error Log ===');
  console.error('Context:', context || 'unknown');
  console.error('Error:', error);
  if (additionalInfo) {
    console.error('Additional Info:', additionalInfo);
  }
  console.error('Timestamp:', new Date().toISOString());
  console.error('================');
}

export default {
  parseError,
  parseAuthError,
  parseFirestoreError,
  parseVotingError,
  parseNetworkError,
  logError
};
