import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { WardrobeProvider } from './src/hooks/useWardrobe';
import { SubscriptionProvider } from './src/hooks/useSubscription';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Loading screen while checking auth state
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6366f1',
  },
});

// Main app component - always show the main app navigator
function AppContent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a short loading time for initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while initializing
  if (loading) {
    return <LoadingScreen />;
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

// Wrap the entire app with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}
