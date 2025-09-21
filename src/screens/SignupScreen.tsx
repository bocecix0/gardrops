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
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import PrimaryButton from '../components/PrimaryButton';
import CustomInput from '../components/CustomInput';
import { useLocalization, LANGUAGE_NAMES } from '../contexts/LocalizationContext';
import LanguageSelector from '../components/LanguageSelector';

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;

export default function SignupScreen() {
  const { colors, typography, spacing } = useTheme();
  const { t, language } = useLocalization();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPhoneSignup, setShowPhoneSignup] = useState(false);
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);
  const { signUp, loginWithGoogle } = useAuth();
  const navigation = useNavigation<SignupScreenNavigationProp>();

  const handleEmailSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert(t('error'), t('pleaseFillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsDoNotMatch'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('error'), t('passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      Alert.alert(t('success'), t('accountCreated'), [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      let errorMessage = t('failedToCreateAccount');
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = t('emailAlreadyInUse');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t('invalidEmail');
      } else if (error.code === 'auth/weak-password') {
        errorMessage = t('weakPassword');
      }
      
      Alert.alert(t('signupError'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      Alert.alert(t('googleSignUpError'), error.message || t('failedToSignUpWithGoogle'));
    }
  };

  const handlePhoneSignup = async () => {
    Alert.alert(
      t('phoneRegistration'),
      t('phoneAuthInfo'),
      [
        {
          text: t('learnMore'),
          onPress: () => Linking.openURL('https://firebase.google.com/docs/auth/web/phone-auth'),
          style: 'default'
        },
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => setLanguageSelectorVisible(true)}
            >
              <Ionicons name="language" size={20} color={colors.primary} />
              <Text style={styles.languageText}>{LANGUAGE_NAMES[language]}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.primary} />
            </TouchableOpacity>
            
            <Text style={styles.title}>{t('createAccount')}</Text>
            <Text style={styles.subtitle}>{t('joinLookSee')}</Text>
          </View>
        </View>

        <View style={styles.form}>
          {showPhoneSignup ? (
            <>
              <CustomInput
                label={t('phoneNumber')}
                placeholder={t('enterYourPhoneNumber')}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                icon="call-outline"
              />
              
              <PrimaryButton
                title={loading ? t('sendingCode') : t('sendVerificationCode')}
                onPress={handlePhoneSignup}
                loading={loading}
                disabled={loading}
              />
              
              <TouchableOpacity 
                style={styles.toggleSignupMethod}
                onPress={() => setShowPhoneSignup(false)}
              >
                <Text style={styles.toggleSignupMethodText}>
                  <Ionicons name="mail-outline" size={16} color="#6366F1" /> {t('emailSignup')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <CustomInput
                label={t('email')}
                placeholder={t('enterYourEmail')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                icon="mail-outline"
              />

              <CustomInput
                label={t('password')}
                placeholder={t('createAPassword')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                icon="lock-closed-outline"
              />

              <CustomInput
                label={t('confirmPassword')}
                placeholder={t('confirmYourPassword')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                icon="lock-closed-outline"
              />

              <PrimaryButton
                title={loading ? t('creatingAccount') : t('signUp')}
                onPress={handleEmailSignup}
                loading={loading}
                disabled={loading}
              />
              
              <TouchableOpacity 
                style={styles.toggleSignupMethod}
                onPress={() => setShowPhoneSignup(true)}
              >
                <Text style={styles.toggleSignupMethodText}>
                  <Ionicons name="call-outline" size={16} color="#6366F1" /> {t('phoneSignup')}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('continueWith')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <PrimaryButton
            title={t('signUpWithGoogle')}
            onPress={handleGoogleSignUp}
            variant="outline"
            icon="logo-google"
            style={styles.googleButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t('alreadyHaveAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}> {t('signIn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <LanguageSelector
        visible={languageSelectorVisible}
        onClose={() => setLanguageSelectorVisible(false)}
      />
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
  headerContainer: {
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  languageText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
    marginHorizontal: 8,
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
  },
  form: {
    width: '100%',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 14,
    color: '#64748B',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  googleButton: {
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#64748B',
    fontSize: 14,
  },
  loginLink: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleSignupMethod: {
    alignItems: 'center',
    marginVertical: 16,
  },
  toggleSignupMethodText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
});