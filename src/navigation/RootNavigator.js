import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useHealthStore } from '../store/healthStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';

export default function RootNavigator() {
  const { isAuthenticated, isLoading, initialize, token } = useAuthStore();
  const { initialize: initTheme } = useThemeStore();
  const { loadFromBackend, clearData } = useHealthStore();
  const [onboardingDone, setOnboardingDone] = useState(null);

  useEffect(() => {
    initialize();
    initTheme();
    SecureStore.getItemAsync('onboarding_done').then(val => {
      setOnboardingDone(val === 'true');
    });
  }, []);

  // Load health data in background — do NOT block app launch
  useEffect(() => {
    if (isAuthenticated && token && token !== 'demo_token') {
      loadFromBackend(token); // background load, no spinner
    } else if (!isAuthenticated) {
      clearData();
    }
  }, [isAuthenticated, token]);

  if (isLoading || onboardingDone === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDF4' }}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  if (!onboardingDone) return <OnboardingScreen onDone={() => setOnboardingDone(true)} />;
  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}
