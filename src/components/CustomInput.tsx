import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface CustomInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'ascii-capable' | 'numbers-and-punctuation' | 'url' | 'number-pad' | 'name-phone-pad' | 'decimal-pad' | 'twitter' | 'web-search';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  icon?: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: object;
}

export default function CustomInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  icon,
  error,
  multiline = false,
  numberOfLines = 1,
  style,
}: CustomInputProps) {
  const { colors, typography, spacing } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View 
        style={[
          styles.inputContainer,
          {
            borderColor: error ? colors.error : isFocused ? colors.borderFocus : colors.border,
            backgroundColor: colors.surface,
            shadowColor: isFocused ? colors.primary : colors.shadow,
            shadowOffset: {
              width: 0,
              height: isFocused ? 4 : 2,
            },
            shadowOpacity: isFocused ? 0.15 : 0.05,
            shadowRadius: isFocused ? 8 : 4,
            elevation: isFocused ? 4 : 2,
          }
        ]}
      >
        {icon && (
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={isFocused ? colors.primary : colors.textTertiary} 
            style={styles.inputIcon} 
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            { 
              flex: 1,
              minHeight: multiline ? 100 : 'auto',
              color: colors.textPrimary,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.regular as any,
            }
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={togglePasswordVisibility}
            style={styles.eyeIcon}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color={isFocused ? colors.primary : colors.textTertiary} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    fontSize: 16,
    color: '#1E293B',
    padding: 0,
    margin: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '500',
  },
});