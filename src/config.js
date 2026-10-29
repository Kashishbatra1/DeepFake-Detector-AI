import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Manual fallback if Expo cannot detect the host.
 * On Windows: open PowerShell and run `ipconfig`, then use the
 * "IPv4 Address" under your active Wi-Fi / Ethernet adapter.
 */
const MANUAL_LAN_IP = '192.168.0.113';

/** Prefer the IP Expo uses to serve Metro (phone reaches this host). */
function resolveLanIp() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri && typeof hostUri === 'string') {
    // hostUri looks like "192.168.0.113:8081"
    const host = hostUri.split(':')[0];
    if (host) return host;
  }
  return MANUAL_LAN_IP;
}

/** Web talks to the API on the same machine; phones use the LAN IP. */
export const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8000'
    : `http://${resolveLanIp()}:8000`;
