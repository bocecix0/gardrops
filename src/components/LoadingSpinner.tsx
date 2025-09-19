import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'large';
  color?: string;
}

export default function LoadingSpinner({
  text = 'Loading...',
  size = 'large',
  color,
}: LoadingSpinnerProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.spinnerContainer}>
        <ActivityIndicator 
          size={size} 
          color={color || colors.primary} 
        />
      </View>
      {text && (
        <Text style={[styles.text, { color: colors.textSecondary, fontSize: typography.fontSize.base }]}>
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  spinnerContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  text: {
    marginTop: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});