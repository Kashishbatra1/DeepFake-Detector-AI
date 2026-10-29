import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import * as authApi from '../api/auth';
import { getErrorMessage, TOKEN_KEY } from '../api/client';
import { colors, fontSize, spacing } from '../theme';
import * as storage from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  // On launch: restore token and confirm it still works via /auth/me
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const stored = await storage.getItem(TOKEN_KEY);
        if (!stored) return;

        // Ensure token is in storage so the interceptor can send it
        await storage.setItem(TOKEN_KEY, stored);
        const me = await authApi.getMe();
        if (!cancelled) {
          setToken(stored);
          setUser(me);
        }
      } catch {
        // Invalid / expired token — clear storage
        await storage.deleteItem(TOKEN_KEY);
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistSession = useCallback(async (accessToken, nextUser) => {
    await storage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await authApi.login(email, password);
      await persistSession(data.access_token, data.user);
      return data;
    },
    [persistSession],
  );

  const signup = useCallback(
    async (payload) => {
      const data = await authApi.signup(payload);
      await persistSession(data.access_token, data.user);
      return data;
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    await storage.deleteItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout,
      getErrorMessage,
    }),
    [token, user, login, signup, logout],
  );

  // Full-screen loader while we verify a stored session
  if (bootstrapping) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.bootText}>Loading Deepfake Detector…</Text>
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  bootText: {
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: fontSize.md,
  },
});
