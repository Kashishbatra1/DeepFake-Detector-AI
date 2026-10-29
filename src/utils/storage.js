import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Cross-platform key/value storage.
 * Web: localStorage (SecureStore is unavailable in browsers).
 * Native: expo-secure-store (encrypted on device).
 */
export async function getItem(key) {
  if (Platform.OS === 'web') {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function setItem(key, value) {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteItem(key) {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
