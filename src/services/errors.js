const FRIENDLY_MESSAGES = {
  AUTHENTICATION_REQUIRED: 'Your session has expired. Please sign in again.',
  INVALID_CREDENTIALS: 'Incorrect email or password. Please try again.',
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "We couldn't find what you're looking for.",
  DUPLICATE_RESOURCE: 'An account with these details may already exist.',
  FILE_TOO_LARGE: 'This file is too large. Please choose a smaller file.',
  UNSUPPORTED_FILE_TYPE: "This file type isn't supported. Please upload a JPEG or PNG image.",
  INVALID_IMAGE: "We couldn't read this image. Please choose a clear JPEG or PNG image.",
  MODEL_UNAVAILABLE: 'Plant disease analysis is temporarily unavailable. Please try again later.',
  DIAGNOSIS_FAILED: "We couldn't complete the plant analysis. Please try again.",
  RATE_LIMITED: "You've made too many requests. Please wait a moment and try again.",
  VALIDATION_ERROR: 'Please check the highlighted fields and correct the information.',
  SERVICE_UNAVAILABLE: "We couldn't access your information right now. Please try again shortly.",
  SERVER_ERROR: 'Something went wrong on our end. Please try again shortly.',
  MALFORMED_RESPONSE: 'We received an unexpected response. Please try again shortly.',
  REQUEST_TIMEOUT: 'This is taking longer than expected. Please try again.',
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection and try again.',
  UNKNOWN_ERROR: 'Something unexpected happened. Please try again.',
};

function getStatusMessage(status, url = '') {
  if (status === 401) {
    return url.includes('/auth/login')
      ? FRIENDLY_MESSAGES.INVALID_CREDENTIALS
      : FRIENDLY_MESSAGES.AUTHENTICATION_REQUIRED;
  }
  if (status === 403) return FRIENDLY_MESSAGES.FORBIDDEN;
  if (status === 404) return FRIENDLY_MESSAGES.NOT_FOUND;
  if (status === 409) return FRIENDLY_MESSAGES.DUPLICATE_RESOURCE;
  if (status === 413) return FRIENDLY_MESSAGES.FILE_TOO_LARGE;
  if (status === 415) return FRIENDLY_MESSAGES.UNSUPPORTED_FILE_TYPE;
  if (status === 422) return FRIENDLY_MESSAGES.VALIDATION_ERROR;
  if (status === 429) return FRIENDLY_MESSAGES.RATE_LIMITED;
  if (status >= 500) return FRIENDLY_MESSAGES.SERVER_ERROR;
  if (status >= 400) return 'We couldn’t complete that request. Please check your information and try again.';
  return FRIENDLY_MESSAGES.UNKNOWN_ERROR;
}

export function getFriendlyErrorMessage(error, context = '') {
  if (typeof error === 'string') {
    return 'Something unexpected happened. Please try again.';
  }

  const responseData = error?.response?.data;
  const responseCode = responseData?.code;
  if (responseCode && FRIENDLY_MESSAGES[responseCode]) return FRIENDLY_MESSAGES[responseCode];
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return FRIENDLY_MESSAGES.REQUEST_TIMEOUT;
  }
  if (error?.code && FRIENDLY_MESSAGES[error.code]) return FRIENDLY_MESSAGES[error.code];

  const url = error?.config?.url || '';
  const status = error?.response?.status || error?.status;
  if (status) {
    if (status === 400 && context === 'diagnosis') {
      return "We couldn't analyze this image. Please check the image and try again.";
    }
    if (status === 503 && context === 'diagnosis') {
      return FRIENDLY_MESSAGES.MODEL_UNAVAILABLE;
    }
    return getStatusMessage(status, url);
  }

  if (
    error?.code === 'ERR_NETWORK'
    || (error?.isAxiosError && error?.request && !error?.response)
  ) {
    return FRIENDLY_MESSAGES.NETWORK_ERROR;
  }
  return FRIENDLY_MESSAGES.UNKNOWN_ERROR;
}

export function getValidationFieldErrors(error) {
  const fieldNames = new Set([
    'name',
    'email',
    'password',
    'role',
    'category',
    'rating',
    'message',
    'diagnosis_id',
    'file',
    'q',
    'skip',
    'limit',
  ]);
  const errors = error?.response?.data?.errors;
  if (!errors || typeof errors !== 'object') return {};
  return Object.keys(errors).reduce((result, field) => {
    if (fieldNames.has(field)) result[field] = 'Please check this field.';
    return result;
  }, {});
}

export function createMalformedResponseError() {
  const error = new Error(FRIENDLY_MESSAGES.MALFORMED_RESPONSE);
  error.code = 'MALFORMED_RESPONSE';
  return error;
}
