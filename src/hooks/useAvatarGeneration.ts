import { useState } from 'react';
import { Alert } from 'react-native';
import { AvatarFeatures, SkinTone, HairColor, HairStyle, EyeColor, BodyType, StylePreference } from '../types';
import { openAIService } from '../services/openai';

interface UseAvatarGenerationReturn {
  generateAvatarPrompt: (features: AvatarFeatures) => Promise<string>;
  isGenerating: boolean;
  error: string | null;
}

export const useAvatarGeneration = (): UseAvatarGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAvatarPrompt = async (features: AvatarFeatures): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    try {
      // Create detailed avatar description based on features
      const basePrompt = createDetailedAvatarPrompt(features);
      
      // Use AI to enhance and optimize the prompt
      const enhancedPrompt = await openAIService.enhanceAvatarPrompt(basePrompt, features);
      
      return enhancedPrompt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate avatar prompt';
      setError(errorMessage);
      
      Alert.alert(
        'Avatar Generation Error',
        'Failed to generate avatar prompt. Using basic description.',
        [{ text: 'OK' }]
      );
      
      // Return basic prompt as fallback
      return createDetailedAvatarPrompt(features);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateAvatarPrompt,
    isGenerating,
    error
  };
};

// Helper function to create detailed avatar prompt
function createDetailedAvatarPrompt(features: AvatarFeatures): string {
  const {
    gender,
    bodyType,
    height,
    weight,
    skinTone,
    hairColor,
    hairStyle,
    eyeColor,
    bodyShape,
    faceShape,
    style
  } = features;

  // BMI calculation for body description
  const heightInM = height / 100;
  const bmi = weight / (heightInM * heightInM);
  let bodyDescription = '';
  
  if (bmi < 18.5) bodyDescription = 'slim and lean';
  else if (bmi < 25) bodyDescription = 'average and healthy';
  else if (bmi < 30) bodyDescription = 'curvy and full-figured';
  else bodyDescription = 'plus-size and voluptuous';

  // Gender-specific terms
  const genderTerms = {
    male: {
      person: 'man',
      body: 'masculine physique',
      chest: bodyShape.chest === 'large' ? 'broad chest' : bodyShape.chest === 'small' ? 'narrow chest' : 'average chest'
    },
    female: {
      person: 'woman',
      body: 'feminine physique',
      chest: bodyShape.chest === 'large' ? 'full bust' : bodyShape.chest === 'small' ? 'petite bust' : 'average bust'
    },
    'non-binary': {
      person: 'person',
      body: 'androgynous physique',
      chest: bodyShape.chest === 'large' ? 'broad chest' : bodyShape.chest === 'small' ? 'narrow chest' : 'average chest'
    }
  };

  const terms = genderTerms[gender];

  // Skin tone descriptions
  const skinDescriptions = {
    [SkinTone.VERY_LIGHT]: 'very fair, porcelain skin',
    [SkinTone.LIGHT]: 'light, fair skin',
    [SkinTone.MEDIUM_LIGHT]: 'light-medium, warm skin',
    [SkinTone.MEDIUM]: 'medium, olive skin',
    [SkinTone.MEDIUM_DARK]: 'medium-dark, golden skin',
    [SkinTone.DARK]: 'dark, rich skin',
    [SkinTone.VERY_DARK]: 'very dark, deep skin'
  };

  // Hair descriptions
  const hairDescriptions = {
    [HairColor.BLONDE]: 'blonde',
    [HairColor.BROWN]: 'brown',
    [HairColor.BLACK]: 'black',
    [HairColor.RED]: 'red',
    [HairColor.GRAY]: 'gray',
    [HairColor.WHITE]: 'white',
    [HairColor.COLORFUL]: 'colorful'
  };

  const hairStyleDescriptions = {
    [HairStyle.SHORT]: 'short',
    [HairStyle.MEDIUM]: 'medium-length',
    [HairStyle.LONG]: 'long',
    [HairStyle.CURLY]: 'curly',
    [HairStyle.STRAIGHT]: 'straight',
    [HairStyle.WAVY]: 'wavy',
    [HairStyle.BALD]: 'bald'
  };

  // Body type descriptions
  const bodyTypeDescriptions = {
    [BodyType.HOURGLASS]: 'hourglass figure with defined waist',
    [BodyType.PEAR]: 'pear-shaped with wider hips than shoulders',
    [BodyType.APPLE]: 'apple-shaped with fuller midsection',
    [BodyType.RECTANGLE]: 'rectangular body with straight lines',
    [BodyType.INVERTED_TRIANGLE]: 'inverted triangle with broader shoulders'
  };

  // Build the comprehensive prompt with advanced details
  const prompt = `A ${bodyDescription} ${terms.person} with ${skinDescriptions[skinTone]}, featuring a ${bodyTypeDescriptions[bodyType]}. 

DETAILED PHYSICAL CHARACTERISTICS:
- Hair: ${hairStyleDescriptions[hairStyle]} ${hairDescriptions[hairColor]} hair with natural texture and movement
- Eyes: Beautiful ${eyeColor} eyes with natural expression
- Face: ${faceShape} face shape with harmonious proportions
- Shoulders: ${bodyShape.shoulders} shoulders that complement the overall physique
- Waist: ${bodyShape.waist} waist defining the silhouette
- Hips: ${bodyShape.hips} hips balancing the body structure
- Chest/Bust: ${terms.chest} proportionate to body type
- Legs: ${bodyShape.legs} legs with natural muscle definition
- Height: ${height}cm creating elegant proportions
- Weight: ${weight}kg with healthy ${bodyDescription} build

BODY COMPOSITION & STRUCTURE:
- Overall physique: ${terms.body} with ${bodyDescription} build
- Body symmetry: Natural and balanced proportions
- Posture: Confident and natural standing position
- Muscle tone: Healthy and appropriate for body type

AVATAR SPECIFICATIONS:
- Style: Professional 2D avatar illustration
- View: Front-facing portrait from chest up or full body
- Pose: Neutral, confident stance suitable for clothing visualization
- Expression: Friendly and approachable with natural smile
- Lighting: Professional studio lighting with soft shadows
- Background: Clean, neutral background (white or light gray)
- Quality: High-resolution digital art with realistic proportions
- Purpose: Optimized for virtual clothing try-on applications
- Consistency: Must maintain these exact physical characteristics for all future clothing visualizations

IMPORTANT: This avatar will be used as a base model for virtual try-on experiences. All physical characteristics must be clearly defined and consistent to ensure clothing fits naturally and realistically on this specific body type and proportions.`;

  return prompt;
}

// Helper to get style-appropriate descriptors
function getStyleDescriptors(styles: StylePreference[]): string {
  const styleMap: Record<StylePreference, string> = {
    [StylePreference.CASUAL]: 'relaxed and approachable',
    [StylePreference.CLASSIC]: 'timeless and elegant',
    [StylePreference.TRENDY]: 'modern and fashionable',
    [StylePreference.BOHEMIAN]: 'free-spirited and artistic',
    [StylePreference.MINIMALIST]: 'clean and sophisticated',
    [StylePreference.SPORTY]: 'athletic and energetic',
    [StylePreference.ELEGANT]: 'refined and graceful',
    [StylePreference.EDGY]: 'bold and contemporary'
  };

  return styles.map(style => styleMap[style] || 'stylish').join(', ');
}