import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BodyType, SkinTone, SimpleAvatarProfile } from '../types';
import { useWardrobe } from '../hooks/useWardrobe';
import { generateUniqueId } from '../utils/clothingUtils';

export default function SimpleAvatarCreationScreen() {
  const navigation = useNavigation();
  const { addSimpleAvatar } = useWardrobe();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [selectedBodyType, setSelectedBodyType] = useState<BodyType | null>(null);
  const [selectedSkinTone, setSelectedSkinTone] = useState<SkinTone | null>(null);

  const steps = [
    { title: 'Gender Selection', subtitle: 'Choose your avatar gender' },
    { title: 'Body Type', subtitle: 'Select your body type' },
    { title: 'Skin Tone', subtitle: 'Choose your skin tone' }
  ];

  const genderOptions = [
    { key: 'female', label: 'Female', icon: 'woman', color: '#EC4899' },
    { key: 'male', label: 'Male', icon: 'man', color: '#3B82F6' }
  ];

  const bodyTypeOptions = [
    { 
      key: BodyType.HOURGLASS, 
      label: 'Hourglass', 
      description: 'Equal shoulder and hip width, defined waist',
      icon: 'hourglass'
    },
    { 
      key: BodyType.PEAR, 
      label: 'Pear', 
      description: 'Hips wider than shoulders, narrow upper body',
      icon: 'triangle'
    },
    { 
      key: BodyType.APPLE, 
      label: 'Apple', 
      description: 'Broader upper body, fuller midsection',
      icon: 'ellipse'
    },
    { 
      key: BodyType.RECTANGLE, 
      label: 'Rectangle', 
      description: 'Similar shoulder, waist and hip measurements',
      icon: 'square'
    },
    { 
      key: BodyType.INVERTED_TRIANGLE, 
      label: 'Inverted Triangle', 
      description: 'Shoulders broader than hips, athletic build',
      icon: 'triangle'
    }
  ];

  const skinToneOptions = [
    { key: SkinTone.VERY_LIGHT, label: 'Very Light', color: '#FFEEE6' },
    { key: SkinTone.LIGHT, label: 'Light', color: '#F5DEB3' },
    { key: SkinTone.MEDIUM_LIGHT, label: 'Medium Light', color: '#DEB887' },
    { key: SkinTone.MEDIUM, label: 'Medium', color: '#D2B48C' },
    { key: SkinTone.MEDIUM_DARK, label: 'Medium Dark', color: '#A0724C' },
    { key: SkinTone.DARK, label: 'Dark', color: '#8B4513' },
    { key: SkinTone.VERY_DARK, label: 'Very Dark', color: '#5D4037' }
  ];

  const generateBaseAvatarPrompt = (): string => {
    const genderMap = {
      'male': 'male',
      'female': 'female'
    };

    const bodyTypeMap = {
      [BodyType.HOURGLASS]: 'hourglass body type with balanced shoulders and hips, defined waist',
      [BodyType.PEAR]: 'pear body type with wider hips, narrower shoulders',
      [BodyType.APPLE]: 'apple body type with broader upper body, fuller midsection',
      [BodyType.RECTANGLE]: 'rectangle body type with straight shoulder-waist-hip line',
      [BodyType.INVERTED_TRIANGLE]: 'inverted triangle body type with broad shoulders, narrow hips'
    };

    const skinToneMap = {
      [SkinTone.VERY_LIGHT]: 'very light skin tone',
      [SkinTone.LIGHT]: 'light skin tone',
      [SkinTone.MEDIUM_LIGHT]: 'medium light skin tone',
      [SkinTone.MEDIUM]: 'medium skin tone',
      [SkinTone.MEDIUM_DARK]: 'medium dark skin tone',
      [SkinTone.DARK]: 'dark skin tone',
      [SkinTone.VERY_DARK]: 'very dark skin tone'
    };

    return `Professional fashion model photography, ${genderMap[selectedGender!]} model, ${bodyTypeMap[selectedBodyType!]}, ${skinToneMap[selectedSkinTone!]}, wearing simple white cotton underwear only (bra and panties for female, boxer briefs for male), standing pose, neutral facial expression, clean white studio background, soft lighting, high resolution, realistic skin texture, professional photography, front view, full body shot, fashion photography style`;
  };

  const handleCreateAvatar = async () => {
    if (!selectedGender || !selectedBodyType || !selectedSkinTone) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    setIsCreating(true);
    
    try {
      const avatar: SimpleAvatarProfile = {
        id: generateUniqueId(),
        gender: selectedGender,
        bodyType: selectedBodyType,
        skinTone: selectedSkinTone,
        baseImagePrompt: generateBaseAvatarPrompt(),
        dateCreated: new Date().toISOString(),
        isActive: true
      };

      const success = await addSimpleAvatar(avatar);
      
      if (success) {
        Alert.alert(
          'Avatar Created! 🎉',
          'Your avatar has been successfully created. You can now try clothes on your avatar.',
          [
            {
              text: 'Great!',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', 'An error occurred while creating avatar');
      }
    } catch (error) {
      console.error('Avatar creation error:', error);
      Alert.alert('Error', 'An error occurred while creating avatar');
    } finally {
      setIsCreating(false);
    }
  };

  const renderGenderSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Your Gender</Text>
      <Text style={styles.stepDescription}>Choose gender for your avatar</Text>
      
      <View style={styles.optionsGrid}>
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.genderOption,
              selectedGender === option.key && styles.selectedOption,
              { borderLeftColor: option.color }
            ]}
            onPress={() => setSelectedGender(option.key as 'male' | 'female')}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, { backgroundColor: `${option.color}15` }]}>
              <Ionicons name={option.icon as any} size={32} color={option.color} />
            </View>
            <Text style={styles.optionLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBodyTypeSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Your Body Type</Text>
      <Text style={styles.stepDescription}>Choose the body type that fits you best</Text>
      
      <View style={styles.bodyTypeGrid}>
        {bodyTypeOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.bodyTypeOption,
              selectedBodyType === option.key && styles.selectedBodyType
            ]}
            onPress={() => setSelectedBodyType(option.key)}
            activeOpacity={0.7}
          >
            <View style={styles.bodyTypeIcon}>
              <Ionicons name={option.icon as any} size={24} color="#2563EB" />
            </View>
            <Text style={styles.bodyTypeLabel}>{option.label}</Text>
            <Text style={styles.bodyTypeDescription}>{option.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSkinToneSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Your Skin Tone</Text>
      <Text style={styles.stepDescription}>Choose your avatar's skin tone</Text>
      
      <View style={styles.skinToneGrid}>
        {skinToneOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.skinToneOption,
              selectedSkinTone === option.key && styles.selectedSkinTone
            ]}
            onPress={() => setSelectedSkinTone(option.key)}
            activeOpacity={0.7}
          >
            <View 
              style={[
                styles.skinToneColor, 
                { backgroundColor: option.color }
              ]} 
            />
            <Text style={styles.skinToneLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedGender !== null;
      case 1: return selectedBodyType !== null;
      case 2: return selectedSkinTone !== null;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderGenderSelection();
      case 1: return renderBodyTypeSelection();
      case 2: return renderSkinToneSelection();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / steps.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} / {steps.length} - {steps[currentStep].title}
          </Text>
        </View>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backStepButton}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Text style={styles.backStepButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < steps.length - 1 ? (
            <TouchableOpacity
              style={[
                styles.nextButton,
                !canProceed() && { opacity: 0.5 }
              ]}
              onPress={() => canProceed() && setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.createButton,
                (!canProceed() || isCreating) && { opacity: 0.5 }
              ]}
              onPress={handleCreateAvatar}
              disabled={!canProceed() || isCreating}
            >
              {isCreating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.createButtonText}>Creating...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.createButtonText}>Create Avatar</Text>
                  <Ionicons name="checkmark" size={16} color="white" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  stepContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  optionsGrid: {
    gap: 16,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOption: {
    borderColor: '#2563EB',
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  optionLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  bodyTypeGrid: {
    gap: 12,
  },
  bodyTypeOption: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedBodyType: {
    borderColor: '#2563EB',
    backgroundColor: '#F8FAFF',
  },
  bodyTypeIcon: {
    marginBottom: 12,
  },
  bodyTypeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  bodyTypeDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  skinToneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skinToneOption: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedSkinTone: {
    borderColor: '#2563EB',
  },
  skinToneColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skinToneLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 12,
  },
  backStepButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  backStepButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});