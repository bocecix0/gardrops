import React from 'react';
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

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const { colors, typography, spacing } = useTheme();
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <Ionicons name="shirt-outline" size={64} color={colors.primary} />
        </View>
        
        <Text style={styles.title}>Welcome to LookSee!</Text>
        <Text style={styles.subtitle}>
          Your AI-powered wardrobe assistant is ready to help you organize your clothes, 
          create amazing outfits, and discover your personal style.
        </Text>
        
        <PrimaryButton
          title="Get Started"
          onPress={() => navigation.navigate('Home')}
          icon="arrow-forward"
          style={styles.continueButton}
        />
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="sparkles-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>AI Outfit Suggestions</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="camera-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>Virtual Try-On</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="cloud-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>Cloud Sync</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
});