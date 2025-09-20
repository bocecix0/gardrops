import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SplashScreenProps {
  loadingProgress?: number;
}

export default function SplashScreen({ loadingProgress = 0 }: SplashScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="shirt-outline" size={80} color="#6366f1" />
        </View>
        <Text style={styles.appName}>LookSee</Text>
        <View style={styles.loadingContainer}>
          <View style={[styles.loadingBar, { width: `${loadingProgress * 100}%` }]} />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 40,
    letterSpacing: -1,
  },
  loadingContainer: {
    width: 200,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 20,
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
});