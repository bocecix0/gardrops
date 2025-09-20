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
  useNanoBanana?: boolean; // Flag to use Google's Nano Banana API
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
      background = BackgroundType.STUDIO,
      useNanoBanana = false // Default to false, but can be set to true to use Nano Banana
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
      
      if (useNanoBanana) {
        // Use Google's Nano Banana API
        console.log('Using Google Nano Banana API for try-on');
        result = await openAIService.generateVirtualTryOnWithNanoBanana(request);
      } else if (avatar) {
        // Use personalized avatar generation with DALL-E
        console.log('Using personalized avatar for try-on');
        result = await openAIService.generatePersonalizedTryOn(request);
      } else {
        // Use generic model generation with DALL-E
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