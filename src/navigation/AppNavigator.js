import React, { useCallback, useState } from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import SignupScreen from '../screens/SignupScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import SplashScreen from '../screens/SplashScreen';
import { colors } from '../theme';
import MainTabs from './MainTabs';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

const Stack = createNativeStackNavigator();

function LoginStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

/**
 * Splash, then onboarding for signed-out people, then the existing login stack.
 * A person who is already signed in goes from the splash screen to Home.
 */
export default function AppNavigator() {
  const { isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const finishSplash = useCallback(() => setShowSplash(false), []);
  const finishOnboarding = useCallback(() => setShowOnboarding(false), []);

  return (
    <NavigationContainer theme={navTheme}>
      {showSplash ? (
        <SplashScreen onFinish={finishSplash} />
      ) : isAuthenticated ? (
        <MainTabs />
      ) : showOnboarding ? (
        <OnboardingScreen onDone={finishOnboarding} />
      ) : (
        <LoginStack />
      )}
    </NavigationContainer>
  );
}
