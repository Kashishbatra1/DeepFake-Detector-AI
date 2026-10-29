import { API_BASE_URL } from '../config';
import { TOKEN_KEY } from './client';
import * as storage from '../utils/storage';

/**
 * Send the chosen video to the backend.
 * `file` is a browser File. On a phone, pass uri/name/mime instead.
 */
export async function uploadVideo({ file, uri, name, mime }) {
  const body = new FormData();
  if (file) {
    body.append('file', file, name);
  } else {
    body.append('file', {
      uri,
      name,
      type: mime || 'video/mp4',
    });
  }

  const token = await storage.getItem(TOKEN_KEY);
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/videos/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body,
    });
  } catch {
    throw new Error(
      'Cannot reach server. Is the backend running and your phone on the same Wi-Fi?',
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail = data?.detail;
    throw new Error(typeof detail === 'string' ? detail : 'Could not upload the video.');
  }

  return data;
}
