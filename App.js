import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from './src/components/Toast';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.style.backgroundColor = colors.background;
  document.body.style.backgroundColor = colors.background;
  document.body.style.margin = '0';
}

/** App root: providers + navigation. */
export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.background }}>
      <AuthProvider>
        <ToastProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
