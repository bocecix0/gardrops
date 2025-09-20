import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../hooks/useTheme';
import PrimaryButton from '../components/PrimaryButton';
import CustomInput from '../components/CustomInput';
import { useLocalization } from '../contexts/LocalizationContext';

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const { colors, typography, spacing } = useTheme();
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(t('error'), t('pleaseFillAllFields'));
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('error'), t('invalidEmail'));
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
      Alert.alert(
        t('success'),
        t('emailSent'),
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      let errorMessage = t('failedToSendResetEmail');
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = t('noUserFound');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t('invalidEmail');
      }
      
      Alert.alert(t('error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('resetPassword')}</Text>
          <Text style={styles.subtitle}>
            {t('resetPasswordSubtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            label={t('email')}
            placeholder={t('enterYourEmail')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            icon="mail-outline"
            // Note: We can't disable the input directly, but we can show a success message
          />

          <PrimaryButton
            title={loading ? t('sending') : success ? t('emailSent') : t('sendResetLink')}
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading || success}
          />

          <View style={styles.backContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.backText}>{t('backToLogin')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  backContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  backText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
});