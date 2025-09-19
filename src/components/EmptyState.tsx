import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import PrimaryButton from './PrimaryButton';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: object;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionText,
  onActionPress,
  style,
}: EmptyStateProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons 
          name={icon as any} 
          size={48} 
          color={colors.primary} 
        />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      {actionText && onActionPress && (
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={actionText}
            onPress={onActionPress}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '400',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
  },
});