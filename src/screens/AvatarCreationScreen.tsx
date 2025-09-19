import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  AvatarFeatures,
  BodyType,
  SkinTone,
  HairColor,
  HairStyle,
  EyeColor,
  StylePreference,
  PersonalizedAvatar
} from '../types';
import { useWardrobe } from '../hooks/useWardrobe';
import { useAvatarGeneration } from '../hooks/useAvatarGeneration';
import { generateUniqueId } from '../utils/clothingUtils';

const { width } = Dimensions.get('window');

const AvatarCreationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { state, updateUserProfile } = useWardrobe();
  const { generateAvatarPrompt, isGenerating: isGeneratingPrompt } = useAvatarGeneration();
  const [isGenerating, setIsGenerating] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Basic Information
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary'>('female');
  const [height, setHeight] = useState('165');
  const [weight, setWeight] = useState('60');
  const [bodyType, setBodyType] = useState<BodyType>(BodyType.HOURGLASS);
  
  // Physical Features
  const [skinTone, setSkinTone] = useState<SkinTone>(SkinTone.MEDIUM);
  const [hairColor, setHairColor] = useState<HairColor>(HairColor.BROWN);
  const [hairStyle, setHairStyle] = useState<HairStyle>(HairStyle.MEDIUM);
  const [eyeColor, setEyeColor] = useState<EyeColor>(EyeColor.BROWN);
  
  // Body Shape Details
  const [shoulders, setShoulders] = useState<'narrow' | 'average' | 'broad'>('average');
  const [waist, setWaist] = useState<'small' | 'average' | 'large'>('average');
  const [hips, setHips] = useState<'narrow' | 'average' | 'wide'>('average');
  const [chest, setChest] = useState<'small' | 'average' | 'large'>('average');
  const [legs, setLegs] = useState<'short' | 'average' | 'long'>('average');
  
  // Face and Style
  const [faceShape, setFaceShape] = useState<'oval' | 'round' | 'square' | 'heart' | 'diamond'>('oval');
  const [stylePreferences, setStylePreferences] = useState<StylePreference[]>([StylePreference.CASUAL]);

  const toggleStylePreference = (style: StylePreference) => {
    if (stylePreferences.includes(style)) {
      setStylePreferences(stylePreferences.filter(s => s !== style));
    } else {
      setStylePreferences([...stylePreferences, style]);
    }
  };

  const getSkinToneColor = (tone: SkinTone): string => {
    const colors = {
      [SkinTone.VERY_LIGHT]: '#FDF2E9',
      [SkinTone.LIGHT]: '#F4CBA2',
      [SkinTone.MEDIUM_LIGHT]: '#DDB885',
      [SkinTone.MEDIUM]: '#C5956A',
      [SkinTone.MEDIUM_DARK]: '#A67C52',
      [SkinTone.DARK]: '#8B5A2B',
      [SkinTone.VERY_DARK]: '#5D3E2A'
    };
    return colors[tone] || colors[SkinTone.MEDIUM];
  };

  const getHairColorDisplay = (color: HairColor): string => {
    const colors = {
      [HairColor.BLONDE]: '#F4D03F',
      [HairColor.BROWN]: '#8B4513',
      [HairColor.BLACK]: '#2C3E50',
      [HairColor.RED]: '#CD5C5C',
      [HairColor.GRAY]: '#95A5A6',
      [HairColor.WHITE]: '#ECF0F1',
      [HairColor.COLORFUL]: '#E74C3C'
    };
    return colors[color] || colors[HairColor.BROWN];
  };

  const getEyeColorDisplay = (color: EyeColor): string => {
    const colors = {
      [EyeColor.BROWN]: '#8B4513',
      [EyeColor.BLUE]: '#3498DB',
      [EyeColor.GREEN]: '#27AE60',
      [EyeColor.HAZEL]: '#D2B48C',
      [EyeColor.GRAY]: '#95A5A6',
      [EyeColor.AMBER]: '#F39C12'
    };
    return colors[color] || colors[EyeColor.BROWN];
  };

  const handleCreateAvatar = async () => {
    setIsGenerating(true);
    try {
      const heightNum = parseInt(height);
      const weightNum = parseInt(weight);
      
      if (isNaN(heightNum) || heightNum < 140 || heightNum > 220) {
        Alert.alert('Error', 'Please enter a valid height between 140-220 cm');
        return;
      }
      
      if (isNaN(weightNum) || weightNum < 35 || weightNum > 200) {
        Alert.alert('Error', 'Please enter a valid weight between 35-200 kg');
        return;
      }

      const avatarFeatures: AvatarFeatures = {
        id: generateUniqueId(),
        gender,
        bodyType,
        height: heightNum,
        weight: weightNum,
        skinTone,
        hairColor,
        hairStyle,
        eyeColor,
        bodyShape: {
          shoulders,
          waist,
          hips,
          chest,
          legs
        },
        faceShape,
        style: stylePreferences,
        measurements: {
          bust: gender === 'female' ? 85 : 90, // Default measurements based on gender
          waist: 70,
          hips: gender === 'female' ? 90 : 85,
          shoulderWidth: 40,
          armLength: 60,
          legLength: 80
        }
      };

      // Generate AI-enhanced prompt
      const basePrompt = await generateAvatarPrompt(avatarFeatures);
      
      const personalizedAvatar: PersonalizedAvatar = {
        id: generateUniqueId(),
        features: avatarFeatures,
        basePrompt,
        dateCreated: new Date().toISOString(),
        isActive: true
      };

      const updatedProfile = {
        ...state.userProfile,
        id: state.userProfile?.id || generateUniqueId(),
        name: state.userProfile?.name || 'User',
        email: state.userProfile?.email || '',
        preferences: {
          ...state.userProfile?.preferences,
          bodyType,
          style: stylePreferences,
          colors: state.userProfile?.preferences?.colors || [],
          brands: state.userProfile?.preferences?.brands || [],
          occasions: state.userProfile?.preferences?.occasions || [],
          personalizedAvatar
        }
      };

      const success = await updateUserProfile(updatedProfile);
      
      if (success) {
        Alert.alert(
          'Avatar Created! 🎉',
          'Your personalized avatar has been created successfully. It will be used for consistent virtual try-on experiences.',
          [{ text: 'Great!', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error creating avatar:', error);
      Alert.alert('Error', 'Failed to create avatar. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Text style={styles.label}>Gender</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.optionButton, gender === 'female' && styles.selectedButton]}
              onPress={() => setGender('female')}
            >
              <Text style={[styles.buttonText, gender === 'female' && styles.selectedText]}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, gender === 'male' && styles.selectedButton]}
              onPress={() => setGender('male')}
            >
              <Text style={[styles.buttonText, gender === 'male' && styles.selectedText]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, gender === 'non-binary' && styles.selectedButton]}
              onPress={() => setGender('non-binary')}
            >
              <Text style={[styles.buttonText, gender === 'non-binary' && styles.selectedText]}>Non-Binary</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="165"
          />

          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="60"
          />

          <Text style={styles.label}>Body Type</Text>
          <View style={styles.buttonRow}>
            {Object.values(BodyType).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.optionButton, bodyType === type && styles.selectedButton]}
                onPress={() => setBodyType(type)}
              >
                <Text style={[styles.buttonText, bodyType === type && styles.selectedText]}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Physical Features */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Physical Features</Text>
          
          <Text style={styles.label}>Skin Tone</Text>
          <View style={styles.colorButtonRow}>
            {Object.values(SkinTone).map((tone) => (
              <TouchableOpacity
                key={tone}
                style={[
                  styles.colorButton,
                  { backgroundColor: getSkinToneColor(tone) },
                  skinTone === tone && styles.selectedColorButton
                ]}
                onPress={() => setSkinTone(tone)}
              >
                {skinTone === tone && <Ionicons name="checkmark" size={16} color="white" />}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.colorLabel}>{skinTone.replace('_', ' ').toUpperCase()}</Text>

          <Text style={styles.label}>Hair Color</Text>
          <View style={styles.colorButtonRow}>
            {Object.values(HairColor).map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: getHairColorDisplay(color) },
                  hairColor === color && styles.selectedColorButton
                ]}
                onPress={() => setHairColor(color)}
              >
                {hairColor === color && <Ionicons name="checkmark" size={16} color="white" />}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.colorLabel}>{hairColor.toUpperCase()}</Text>

          <Text style={styles.label}>Hair Style</Text>
          <View style={styles.buttonRow}>
            {Object.values(HairStyle).map((style) => (
              <TouchableOpacity
                key={style}
                style={[styles.optionButton, hairStyle === style && styles.selectedButton]}
                onPress={() => setHairStyle(style)}
              >
                <Text style={[styles.buttonText, hairStyle === style && styles.selectedText]}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Eye Color</Text>
          <View style={styles.colorButtonRow}>
            {Object.values(EyeColor).map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: getEyeColorDisplay(color) },
                  eyeColor === color && styles.selectedColorButton
                ]}
                onPress={() => setEyeColor(color)}
              >
                {eyeColor === color && <Ionicons name="checkmark" size={16} color="white" />}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.colorLabel}>{eyeColor.toUpperCase()}</Text>

          <Text style={styles.label}>Face Shape</Text>
          <View style={styles.buttonRow}>
            {(['oval', 'round', 'square', 'heart', 'diamond'] as const).map((shape) => (
              <TouchableOpacity
                key={shape}
                style={[styles.optionButton, faceShape === shape && styles.selectedButton]}
                onPress={() => setFaceShape(shape)}
              >
                <Text style={[styles.buttonText, faceShape === shape && styles.selectedText]}>
                  {shape.charAt(0).toUpperCase() + shape.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Body Shape Details */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Body Shape Details</Text>
          
          <Text style={styles.label}>Shoulders</Text>
          <View style={styles.buttonRow}>
            {(['narrow', 'average', 'broad'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.optionButton, shoulders === type && styles.selectedButton]}
                onPress={() => setShoulders(type)}
              >
                <Text style={[styles.buttonText, shoulders === type && styles.selectedText]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Waist</Text>
          <View style={styles.buttonRow}>
            {(['small', 'average', 'large'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.optionButton, waist === type && styles.selectedButton]}
                onPress={() => setWaist(type)}
              >
                <Text style={[styles.buttonText, waist === type && styles.selectedText]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Hips</Text>
          <View style={styles.buttonRow}>
            {(['narrow', 'average', 'wide'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.optionButton, hips === type && styles.selectedButton]}
                onPress={() => setHips(type)}
              >
                <Text style={[styles.buttonText, hips === type && styles.selectedText]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Chest/Bust</Text>
          <View style={styles.buttonRow}>
            {(['small', 'average', 'large'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.optionButton, chest === type && styles.selectedButton]}
                onPress={() => setChest(type)}
              >
                <Text style={[styles.buttonText, chest === type && styles.selectedText]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Leg Length</Text>
          <View style={styles.buttonRow}>
            {(['short', 'average', 'long'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.optionButton, legs === type && styles.selectedButton]}
                onPress={() => setLegs(type)}
              >
                <Text style={[styles.buttonText, legs === type && styles.selectedText]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Style Preferences */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Style Preferences</Text>
          <Text style={styles.sectionSubtitle}>Select your preferred styles (multiple allowed)</Text>
          
          <View style={styles.buttonRow}>
            {Object.values(StylePreference).map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.optionButton,
                  stylePreferences.includes(style) && styles.selectedButton
                ]}
                onPress={() => toggleStylePreference(style)}
              >
                <Text style={[
                  styles.buttonText,
                  stylePreferences.includes(style) && styles.selectedText
                ]}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Enhanced Create Button */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
          }}
        >
          <TouchableOpacity
            style={[styles.createButton, (isGenerating || isGeneratingPrompt) && styles.disabledButton]}
            onPress={handleCreateAvatar}
            disabled={isGenerating || isGeneratingPrompt}
            activeOpacity={0.7}
          >
            {(isGenerating || isGeneratingPrompt) ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="white" size="small" />
                <Text style={styles.createButtonText}>
                  {isGeneratingPrompt ? 'Enhancing Avatar...' : 'Creating Avatar...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.createButtonText}>Create My Avatar ✨</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: Platform.OS === 'ios' ? 50 : 30,
    zIndex: 1,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 22,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  colorButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedButton: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  buttonText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '600',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  selectedColorButton: {
    borderColor: '#2563EB',
    borderWidth: 4,
  },
  colorLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    marginTop: 30,
    marginBottom: 40,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

export default AvatarCreationScreen;