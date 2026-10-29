import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ToastContext = createContext(null);

const TONE = {
  success: {
    icon: 'checkmark-circle',
    color: '#22C55E',
    borderColor: 'rgba(34,197,94,0.6)',
  },
  error: {
    icon: 'alert-circle',
    color: '#EF4444',
    borderColor: 'rgba(239,68,68,0.6)',
  },
};

export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;
  const hideTimer = useRef(null);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    opacity.stopAnimation();
    translateY.stopAnimation();
    const kind = type === 'error' ? 'error' : 'success';
    setToast({ message, type: kind });
    opacity.setValue(0);
    translateY.setValue(-16);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
    hideTimer.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, kind === 'error' ? 2500 : 2000);
  }, [opacity, translateY]);

  const tone = TONE[toast?.type] || TONE.success;

  return (
    <ToastContext.Provider value={{ showToast }}>
      <View style={styles.host} pointerEvents="box-none">
        {children}
        {toast ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.dock,
              {
                top: insets.top + 12,
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={[styles.toast, { borderColor: tone.borderColor }]}>
              <Ionicons name={tone.icon} size={18} color={tone.color} />
              <Text style={styles.message}>{toast.message}</Text>
            </View>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return value;
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  toast: {
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#182447',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28)' }
      : {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.28,
          shadowRadius: 16,
          elevation: 8,
        }),
  },
  message: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
