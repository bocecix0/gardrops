import { useState } from 'react';
import { Alert } from 'react-native';
import { openAIService } from '../services/openai';
import { ClothingItem } from '../types';

interface UseImageAnalysisReturn {
  isAnalyzing: boolean;
  analyzeImage: (imageUri: string, userDescription?: string) => Promise<Partial<ClothingItem> | null>;
  error: string | null;
}

export const useImageAnalysis = (): UseImageAnalysisReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (
    imageUri: string, 
    userDescription?: string
  ): Promise<Partial<ClothingItem> | null> => {
    if (!imageUri) {
      setError('No image provided');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Check if OpenAI API key is configured
      if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      // Analyze the image using OpenAI
      const analysisResult = await openAIService.analyzeClothingItemFromImage(
        imageUri,
        userDescription
      );

      if (!analysisResult) {
        throw new Error('Failed to analyze image');
      }

      return analysisResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
      setError(errorMessage);
      
      // Show user-friendly error message
      Alert.alert(
        'Analysis Notice',
        'The AI had trouble analyzing this image automatically, but we\'ll use basic detection. You can edit the details as needed.',
        [{ text: 'OK' }]
      );

      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    analyzeImage,
    error
  };
};