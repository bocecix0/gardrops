import { useState } from 'react';
import { Alert } from 'react-native';
import { openAIService } from '../services/openai';
import { OutfitSuggestion, AIRequest, ClothingItem, Occasion, UserPreferences } from '../types';

interface UseOutfitGenerationReturn {
  isGenerating: boolean;
  currentSuggestion: OutfitSuggestion | null;
  error: string | null;
  generateOutfit: (request: OutfitGenerationRequest) => Promise<OutfitSuggestion | null>;
  clearSuggestion: () => void;
}

export interface OutfitGenerationRequest {
  occasion: Occasion;
  availableItems: ClothingItem[];
  userPreferences?: UserPreferences;
  weather?: {
    temperature: number;
    condition: string;
    humidity?: number;
    windSpeed?: number;
  };
  constraints?: string[];
}

export const useOutfitGeneration = (): UseOutfitGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<OutfitSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateOutfit = async (request: OutfitGenerationRequest): Promise<OutfitSuggestion | null> => {
    // Validation
    if (!request.availableItems || request.availableItems.length === 0) {
      setError('No clothing items available for outfit generation');
      Alert.alert(
        'No Items Available',
        'Please add some clothing items to your wardrobe first to generate outfit suggestions.',
        [{ text: 'OK' }]
      );
      return null;
    }

    // Check if we have available items
    const availableItems = request.availableItems.filter(item => item.isAvailable);
    if (availableItems.length < 2) {
      setError('Not enough available items for outfit generation');
      Alert.alert(
        'More Items Needed',
        'You need at least 2 available clothing items to generate outfit suggestions. Add more items or mark existing items as available.',
        [{ text: 'OK' }]
      );
      return null;
    }

    // Check if OpenAI API key is configured
    if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
      setError('AI service not configured');
      Alert.alert(
        'AI Service Unavailable',
        'The AI outfit generation feature requires an OpenAI API key. Please configure your API key in the app settings.',
        [{ text: 'OK' }]
      );
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Create AI request object
      const aiRequest: AIRequest = {
        occasion: request.occasion,
        availableItems,
        userPreferences: request.userPreferences || {
          style: [],
          colors: [],
          brands: [],
          bodyType: 'rectangle' as any,
          occasions: [request.occasion]
        },
        weather: request.weather,
        constraints: request.constraints
      };

      // Generate outfit suggestion using OpenAI
      const suggestion = await openAIService.generateOutfitSuggestion(aiRequest);

      if (!suggestion || !suggestion.outfit) {
        throw new Error('Failed to generate valid outfit suggestion');
      }

      setCurrentSuggestion(suggestion);
      return suggestion;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate outfit suggestion';
      setError(errorMessage);
      
      console.error('Outfit generation error:', err);
      
      // Show user-friendly error message
      Alert.alert(
        'Outfit Generation Failed',
        'We had trouble creating an outfit suggestion. This might be due to network issues or AI service availability. Please try again.',
        [{ text: 'OK' }]
      );

      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearSuggestion = () => {
    setCurrentSuggestion(null);
    setError(null);
  };

  return {
    isGenerating,
    currentSuggestion,
    error,
    generateOutfit,
    clearSuggestion
  };
};