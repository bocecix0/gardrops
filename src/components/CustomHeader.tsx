import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface CustomHeaderProps {
  title: string;
  onBackPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  showBackButton?: boolean;
}

export default function CustomHeader({
  title,
  onBackPress,
  rightIcon,
  onRightPress,
  showBackButton = true,
}: CustomHeaderProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBackButton && onBackPress && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      
      <View style={styles.rightContainer}>
        {rightIcon && onRightPress && (
          <TouchableOpacity 
            style={styles.rightButton}
            onPress={onRightPress}
          >
            <Ionicons name={rightIcon as any} size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leftContainer: {
    width: 40,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  rightContainer: {
    width: 40,
  },
  rightButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
});