import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { WardrobeProvider } from './src/hooks/useWardrobe';
import { SubscriptionProvider } from './src/hooks/useSubscription';
import { AuthProvider } from './src/contexts/AuthContext';
import { LocalizationProvider } from './src/contexts/LocalizationContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';

// Main app component - always show the main app navigator
function AppContent() {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + 0.1;
        if (newProgress >= 1) {
          clearInterval(progressInterval);
          setTimeout(() => setLoading(false), 300);
          return 1;
        }
        return newProgress;
      });
    }, 100);

    // Cleanup interval
    return () => clearInterval(progressInterval);
  }, []);

  // Show splash screen while initializing
  if (loading) {
    return <SplashScreen loadingProgress={loadingProgress} />;
  }

  // Always show the main app navigator
  return (
    <SubscriptionProvider>
      <WardrobeProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </WardrobeProvider>
    </SubscriptionProvider>
  );
}

// Wrap the entire app with AuthProvider and LocalizationProvider
export default function App() {
  return (
    <LocalizationProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </LocalizationProvider>
  );
}