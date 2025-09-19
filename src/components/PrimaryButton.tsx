import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  style?: object;
}

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'primary',
  size = 'medium',
  style,
}: PrimaryButtonProps) {
  const { colors, typography, spacing } = useTheme();

  const getButtonStyle = () => {
    // Base styles
    const baseStyle = {
      flexDirection: 'row' as 'row',
      alignItems: 'center' as 'center',
      justifyContent: 'center' as 'center',
      borderRadius: spacing.borderRadius,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    };
    
    // Variant styles
    let variantStyle = {};
    switch (variant) {
      case 'primary':
        variantStyle = {
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
        };
        break;
      case 'secondary':
        variantStyle = {
          backgroundColor: colors.secondary,
          shadowColor: colors.secondary,
        };
        break;
      case 'outline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.primary,
        };
        break;
      case 'ghost':
        variantStyle = {
          backgroundColor: 'transparent',
        };
        break;
    }
    
    // Size styles
    let sizeStyle = {};
    switch (size) {
      case 'small':
        sizeStyle = {
          paddingVertical: spacing.buttonPaddingVertical - 2,
          paddingHorizontal: spacing.buttonPaddingHorizontal - 4,
        };
        break;
      case 'medium':
        sizeStyle = {
          paddingVertical: spacing.buttonPaddingVertical,
          paddingHorizontal: spacing.buttonPaddingHorizontal,
        };
        break;
      case 'large':
        sizeStyle = {
          paddingVertical: spacing.buttonPaddingVerticalLarge,
          paddingHorizontal: spacing.buttonPaddingHorizontalLarge,
        };
        break;
    }
    
    // Disabled state
    const disabledStyle = (disabled || loading) ? { opacity: 0.6 } : {};
    
    return [baseStyle, variantStyle, sizeStyle, disabledStyle, style];
  };

  const getTextStyle = () => {
    // Base text style
    const baseTextStyle = {
      fontWeight: typography.fontWeight.semiBold as any,
      textAlign: 'center' as 'center',
      letterSpacing: typography.letterSpacing.wide,
    };
    
    // Variant text styles
    let variantTextStyle = {};
    switch (variant) {
      case 'primary':
        variantTextStyle = { color: colors.primaryContrast };
        break;
      case 'secondary':
        variantTextStyle = { color: colors.secondaryContrast };
        break;
      case 'outline':
        variantTextStyle = { color: colors.primary };
        break;
      case 'ghost':
        variantTextStyle = { color: colors.primary };
        break;
    }
    
    // Size text styles
    let sizeTextStyle = {};
    switch (size) {
      case 'small':
        sizeTextStyle = { fontSize: typography.fontSize.sm };
        break;
      case 'medium':
        sizeTextStyle = { fontSize: typography.fontSize.base };
        break;
      case 'large':
        sizeTextStyle = { fontSize: typography.fontSize.lg };
        break;
    }
    
    return [baseTextStyle, variantTextStyle, sizeTextStyle];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : (variant === 'secondary' ? colors.secondaryContrast : colors.primaryContrast)} 
          size="small" 
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon && (
            <Ionicons 
              name={icon as any} 
              size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
              color={variant === 'outline' || variant === 'ghost' ? colors.primary : (variant === 'secondary' ? colors.secondaryContrast : colors.primaryContrast)} 
              style={styles.buttonIcon}
            />
          )}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
});