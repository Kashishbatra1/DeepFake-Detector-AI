import axios from 'axios';

import { API_BASE_URL } from '../config';
import * as storage from '../utils/storage';

const TOKEN_KEY = 'deepfake_detector_access_token';

const FIELD_LABELS = {
  first_name: 'First name',
  last_name: 'Last name',
  email: 'Email',
  phone: 'Phone',
  password: 'Password',
  accept_terms: 'Terms',
};

/** Turn a Pydantic loc path into a short field label. */
function labelForLocation(loc) {
  const parts = Array.isArray(loc) ? loc : [loc];
  const key = [...parts].reverse().find((part) => part !== 'body' && part !== 'query');
  if (key == null) return 'Form';
  return FIELD_LABELS[key] || String(key).replace(/_/g, ' ');
}

/** "First name: Must be 2–50 characters" */
function formatValidationItem(item) {
  if (typeof item === 'string') return item;
  const message = String(item?.msg || 'Validation error').replace(/^Value error,\s*/i, '');
  return `${labelForLocation(item?.loc)}: ${message}`;
}

/** Shared axios client pointed at the FastAPI backend. */
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from storage on every request when present
client.interceptors.request.use(async (config) => {
  const token = await storage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Turn axios / FastAPI errors into a short user-facing string.
 * Handles network failures, string detail, and Pydantic 422 list detail.
 */
export function getErrorMessage(error) {
  if (!error.response) {
    return 'Cannot reach server. Is the backend running and your phone on the same Wi-Fi?';
  }

  const detail = error.response.data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  // FastAPI validation errors: [{ loc, msg, type }, ...]
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map(formatValidationItem).join('\n');
  }

  return 'Something went wrong. Please try again.';
}

export { TOKEN_KEY };
export default client;
