import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import { useLocalization, LANGUAGE_NAMES } from '../contexts/LocalizationContext';
import LanguageSelector from '../components/LanguageSelector';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const { colors, typography, spacing } = useTheme();
  const { t, language } = useLocalization();
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.languageButton}
          onPress={() => setLanguageSelectorVisible(true)}
        >
          <Text style={styles.languageText}>{LANGUAGE_NAMES[language]}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <Ionicons name="shirt-outline" size={64} color={colors.primary} />
        </View>
        
        <Text style={styles.title}>{t('welcome')}</Text>
        <Text style={styles.subtitle}>
          {t('joinLookSee')}
        </Text>
        
        <PrimaryButton
          title={t('getStarted')}
          onPress={() => navigation.navigate('Home')}
          icon="arrow-forward"
          style={styles.continueButton}
        />
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="sparkles-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>{t('aiOutfitSuggestions')}</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="camera-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>{t('virtualTryOn')}</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="cloud-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>{t('cloudSync')}</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>{t('securePrivate')}</Text>
          </View>
        </View>
        
        <View style={styles.authOptions}>
          <Text style={styles.authText}>{t('alreadyHaveAccount')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.authLink}>{t('signIn')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <LanguageSelector
        visible={languageSelectorVisible}
        onClose={() => setLanguageSelectorVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    alignItems: 'flex-end',
    padding: 24,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  languageText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
    marginRight: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  illustrationContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  continueButton: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 40,
  },
  featuresContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  authOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  authText: {
    color: '#64748B',
    fontSize: 14,
  },
  authLink: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
});