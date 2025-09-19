import { useState } from 'react';
import { Alert } from 'react-native';
import { imageProcessingService } from '../services/imageProcessing';
import { ClothingItem } from '../types';

interface ProcessingStatus {
  isProcessing: boolean;
  currentStep: string;
  progress: number; // 0-100
  steps: string[];
}

interface UseEnhancedImageAnalysisReturn {
  processingStatus: ProcessingStatus;
  processImage: (
    imageUri: string, 
    userDescription?: string,
    removeBackground?: boolean
  ) => Promise<{
    analysis: Partial<ClothingItem> | null;
    originalImage: string;
    processedImage?: string;
  }>;
  error: string | null;
  isBackgroundRemovalAvailable: boolean;
}

export const useEnhancedImageAnalysis = (): UseEnhancedImageAnalysisReturn => {
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    currentStep: '',
    progress: 0,
    steps: []
  });
  const [error, setError] = useState<string | null>(null);

  const processImage = async (
    imageUri: string, 
    userDescription?: string,
    removeBackground: boolean = true
  ) => {
    if (!imageUri) {
      setError('No image provided');
      return { analysis: null, originalImage: imageUri };
    }

    // Reset state
    setError(null);
    setProcessingStatus({
      isProcessing: true,
      currentStep: 'Initializing...',
      progress: 0,
      steps: []
    });

    try {
      // Check if OpenAI API key is configured
      if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      // Update progress - Starting analysis
      setProcessingStatus(prev => ({
        ...prev,
        currentStep: 'Starting AI analysis...',
        progress: 20,
        steps: [...prev.steps, 'Starting AI analysis...']
      }));

      // Process the image with enhanced AI and background removal
      const result = await imageProcessingService.processClothingImage(
        imageUri,
        userDescription,
        removeBackground
      );

      // Update progress during processing
      const totalSteps = result.processingSteps.length;
      result.processingSteps.forEach((step, index) => {
        const progress = Math.round(((index + 1) / totalSteps) * 80) + 20; // 20-100%
        
        setProcessingStatus(prev => ({
          ...prev,
          currentStep: step,
          progress,
          steps: [...prev.steps, step]
        }));
      });

      // Final completion
      setProcessingStatus(prev => ({
        ...prev,
        currentStep: '✅ Analysis completed!',
        progress: 100,
        isProcessing: false
      }));

      // Show success notification with enhanced details
      const successMessage = removeBackground && result.processedImage 
        ? 'AI analysis completed and background removed! ✨'
        : 'AI analysis completed! 🤖';

      Alert.alert(
        'Processing Complete! 🎉',
        successMessage + ' Review the auto-filled details below.',
        [{ text: 'Great!' }]
      );

      return {
        analysis: result.analysis,
        originalImage: result.originalImage,
        processedImage: result.processedImage
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
      setError(errorMessage);
      
      setProcessingStatus(prev => ({
        ...prev,
        isProcessing: false,
        currentStep: '❌ Processing failed',
        progress: 0
      }));

      // Show user-friendly error message
      Alert.alert(
        'Processing Notice',
        'The enhanced AI had trouble processing this image automatically, but we\'ll use basic analysis. You can edit the details as needed.',
        [{ text: 'OK' }]
      );

      return { analysis: null, originalImage: imageUri };
    }
  };

  return {
    processingStatus,
    processImage,
    error,
    isBackgroundRemovalAvailable: imageProcessingService.isBackgroundRemovalAvailable()
  };
};