import { useState } from 'react';
import { Alert } from 'react-native';
import { openAIService } from '../services/openai';
import { 
  VirtualTryOnRequest, 
  VirtualTryOnResult, 
  ModelType, 
  BodyType, 
  PoseType, 
  BackgroundType,
  Outfit,
  PersonalizedAvatar
} from '../types';

interface UseVirtualTryOnReturn {
  isGenerating: boolean;
  generateTryOn: (params: VirtualTryOnParams) => Promise<VirtualTryOnResult | null>;
  error: string | null;
  clearError: () => void;
}

interface VirtualTryOnParams {
  outfit: Outfit;
  avatar?: PersonalizedAvatar; // User's personalized avatar
  modelType?: ModelType;
  bodyType?: BodyType;
  pose?: PoseType;
  background?: BackgroundType;
}

export const useVirtualTryOn = (): UseVirtualTryOnReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTryOn = async (params: VirtualTryOnParams): Promise<VirtualTryOnResult | null> => {
    const { 
      outfit, 
      avatar, // User's personalized avatar
      modelType = ModelType.CASUAL_FEMALE, 
      bodyType = BodyType.HOURGLASS,
      pose = PoseType.STANDING,
      background = BackgroundType.STUDIO
    } = params;

    if (!outfit || !outfit.items.length) {
      setError('No outfit selected for virtual try-on');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Check if OpenAI API key is configured
      if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      // Validate outfit has required items
      if (outfit.items.length === 0) {
        throw new Error('Outfit must contain at least one clothing item');
      }

      const request: VirtualTryOnRequest = {
        outfit,
        avatar, // Include personalized avatar if available
        modelType,
        bodyType,
        pose,
        background
      };

      let result: VirtualTryOnResult;
      
      if (avatar) {
        // Use personalized avatar generation
        console.log('Using personalized avatar for try-on');
        result = await openAIService.generatePersonalizedTryOn(request);
      } else {
        // Use generic model generation
        console.log('Using generic model for try-on');
        result = await openAIService.generateVirtualTryOn(request);
      }

      if (!result || !result.imageUrl) {
        throw new Error('Failed to generate virtual try-on image');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate virtual try-on';
      setError(errorMessage);
      
      // Show user-friendly error message
      Alert.alert(
        'Virtual Try-On Failed',
        avatar 
          ? 'We couldn\'t generate the virtual try-on with your avatar. Please try again or check your internet connection.'
          : 'We couldn\'t generate the virtual try-on image. Please try again or check your internet connection.',
        [{ text: 'OK' }]
      );

      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isGenerating,
    generateTryOn,
    error,
    clearError
  };
};

// Helper function to get recommended model type based on outfit occasion
export const getRecommendedModelType = (outfit: Outfit, gender: 'male' | 'female' = 'female'): ModelType => {
  const genderSuffix = gender.toUpperCase();
  
  switch (outfit.occasion) {
    case 'business':
      return gender === 'male' ? ModelType.BUSINESS_MALE : ModelType.BUSINESS_FEMALE;
    case 'formal':
      return gender === 'male' ? ModelType.FORMAL_MALE : ModelType.FORMAL_FEMALE;
    default:
      return gender === 'male' ? ModelType.CASUAL_MALE : ModelType.CASUAL_FEMALE;
  }
};

// Helper function to get pose recommendation based on outfit occasion
export const getRecommendedPose = (outfit: Outfit): PoseType => {
  switch (outfit.occasion) {
    case 'business':
    case 'formal':
      return PoseType.STANDING;
    case 'sports':
      return PoseType.WALKING;
    case 'casual':
    case 'vacation':
      return PoseType.CASUAL_POSE;
    default:
      return PoseType.STANDING;
  }
};