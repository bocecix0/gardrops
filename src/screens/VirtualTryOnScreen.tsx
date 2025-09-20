import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useWardrobe } from '../hooks/useWardrobe';
import { useVirtualTryOn } from '../hooks/useVirtualTryOn';
import { 
  Outfit, 
  ModelType, 
  BodyType, 
  PoseType, 
  BackgroundType,
  VirtualTryOnResult,
  ClothingCategory,
  Occasion
} from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VirtualTryOnScreenProps {
  route: {
    params: {
      outfit: Outfit;
    };
  };
}

// Helper function to recommend model type based on outfit
const getRecommendedModelType = (outfit: Outfit, gender: 'male' | 'female' = 'female'): ModelType => {
  // Check if outfit has formal items
  const hasFormalItems = outfit.items.some(item => 
    item.category === ClothingCategory.DRESS || 
    item.category === ClothingCategory.OUTERWEAR
  );
  
  // Check if outfit has business items
  const hasBusinessItems = outfit.items.some(item => 
    item.occasion.includes(Occasion.BUSINESS) || 
    item.category === ClothingCategory.OUTERWEAR
  );
  
  if (hasFormalItems) {
    return gender === 'male' ? ModelType.FORMAL_MALE : ModelType.FORMAL_FEMALE;
  } else if (hasBusinessItems) {
    return gender === 'male' ? ModelType.BUSINESS_MALE : ModelType.BUSINESS_FEMALE;
  } else {
    return gender === 'male' ? ModelType.CASUAL_MALE : ModelType.CASUAL_FEMALE;
  }
};

// Helper function to recommend pose based on outfit
const getRecommendedPose = (outfit: Outfit): PoseType => {
  // Check if outfit has items suitable for walking pose
  const hasActiveItems = outfit.items.some(item => 
    item.occasion.includes(Occasion.SPORTS) || 
    item.category === ClothingCategory.SHOES
  );
  
  // Check if outfit has formal/dress items
  const hasFormalItems = outfit.items.some(item => 
    item.category === ClothingCategory.DRESS
  );
  
  if (hasActiveItems) {
    return PoseType.WALKING;
  } else if (hasFormalItems) {
    return PoseType.STANDING;
  } else {
    return PoseType.CASUAL_POSE;
  }
};

const VirtualTryOnScreen: React.FC<VirtualTryOnScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { outfit } = route.params as { outfit: Outfit };
  
  const { state } = useWardrobe();
  const { isGenerating, generateTryOn, error } = useVirtualTryOn();
  
  // Get user's personalized avatar
  const userAvatar = state.userProfile?.preferences?.personalizedAvatar;
  
  const [selectedModelType, setSelectedModelType] = useState<ModelType>(
    userAvatar ? ModelType.CASUAL_FEMALE : getRecommendedModelType(outfit, 'female')
  );
  const [selectedBodyType, setSelectedBodyType] = useState<BodyType>(
    userAvatar ? userAvatar.features.bodyType : (state.userProfile?.preferences?.bodyType || BodyType.HOURGLASS)
  );
  const [selectedPose, setSelectedPose] = useState<PoseType>(
    getRecommendedPose(outfit)
  );
  const [selectedBackground, setSelectedBackground] = useState<BackgroundType>(
    BackgroundType.STUDIO
  );
  const [useNanoBanana, setUseNanoBanana] = useState<boolean>(false); // New state for Nano Banana API
  const [generatedImage, setGeneratedImage] = useState<VirtualTryOnResult | null>(null);

  const handleGenerateTryOn = useCallback(async () => {
    try {
      const result = await generateTryOn({
        outfit,
        avatar: userAvatar, // Use personalized avatar if available
        modelType: selectedModelType,
        bodyType: selectedBodyType,
        pose: selectedPose,
        background: selectedBackground,
        useNanoBanana // Pass the Nano Banana flag
      });

      if (result) {
        setGeneratedImage(result);
      }
    } catch (error) {
      console.error('Error generating virtual try-on:', error);
    }
  }, [outfit, userAvatar, selectedModelType, selectedBodyType, selectedPose, selectedBackground, useNanoBanana, generateTryOn]);

  const renderModelTypeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Model Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {Object.values(ModelType).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.selectorButton,
              selectedModelType === type && styles.selectedButton
            ]}
            onPress={() => setSelectedModelType(type)}
          >
            <Text style={[
              styles.selectorButtonText,
              selectedModelType === type && styles.selectedButtonText
            ]}>
              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBodyTypeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Body Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {Object.values(BodyType).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.selectorButton,
              selectedBodyType === type && styles.selectedButton
            ]}
            onPress={() => setSelectedBodyType(type)}
          >
            <Text style={[
              styles.selectorButtonText,
              selectedBodyType === type && styles.selectedButtonText
            ]}>
              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPoseSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Pose</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {Object.values(PoseType).map((pose) => (
          <TouchableOpacity
            key={pose}
            style={[
              styles.selectorButton,
              selectedPose === pose && styles.selectedButton
            ]}
            onPress={() => setSelectedPose(pose)}
          >
            <Text style={[
              styles.selectorButtonText,
              selectedPose === pose && styles.selectedButtonText
            ]}>
              {pose.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBackgroundSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Background</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {Object.values(BackgroundType).map((bg) => (
          <TouchableOpacity
            key={bg}
            style={[
              styles.selectorButton,
              selectedBackground === bg && styles.selectedButton
            ]}
            onPress={() => setSelectedBackground(bg)}
          >
            <Text style={[
              styles.selectorButtonText,
              selectedBackground === bg && styles.selectedButtonText
            ]}>
              {bg.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // New component for Nano Banana toggle
  const renderNanoBananaToggle = () => (
    <View style={styles.toggleContainer}>
      <Text style={styles.toggleTitle}>Use Google Nano Banana API</Text>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleDescription}>
          Enable for advanced AI-powered virtual try-on with automatic clothing placement
        </Text>
        <Switch
          value={useNanoBanana}
          onValueChange={setUseNanoBanana}
          trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
          thumbColor={useNanoBanana ? '#FFFFFF' : '#F9FAFB'}
        />
      </View>
    </View>
  );

  const renderOutfitPreview = () => (
    <View style={styles.outfitPreview}>
      <Text style={styles.outfitTitle}>{outfit.name}</Text>
      <View style={styles.outfitItems}>
        {outfit.items.map((item, index) => (
          <View key={item.id} style={styles.outfitItem}>
            <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
            <Text style={styles.itemName}>{item.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderGeneratedImage = () => {
    if (!generatedImage) return null;

    return (
      <View style={styles.generatedImageContainer}>
        <Text style={styles.resultTitle}>Virtual Try-On Result</Text>
        <Image 
          source={{ uri: generatedImage.imageUrl }} 
          style={styles.generatedImage}
          resizeMode="contain"
        />
        <View style={styles.imageInfo}>
          <Text style={styles.infoText}>
            Model Used: {generatedImage.modelUsed}
          </Text>
          <Text style={styles.infoText}>
            Confidence: {Math.round(generatedImage.confidence * 100)}%
          </Text>
          <Text style={styles.infoText}>
            Generated in: {(generatedImage.processingTime / 1000).toFixed(1)}s
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => {
            Alert.alert(
              'Save Image',
              'Virtual try-on image generation complete! You can save this to your device.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Save', onPress: () => {
                  // Here you could implement image saving functionality
                  Alert.alert('Success', 'Image saved to gallery!');
                }}
              ]
            );
          }}
        >
          <Text style={styles.saveButtonText}>Save to Gallery</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {renderOutfitPreview()}
      
      {/* Avatar Status */}
      {userAvatar ? (
        <View style={styles.avatarStatus}>
          <View style={styles.avatarStatusHeader}>
            <Ionicons name="person-circle" size={24} color="#10B981" />
            <Text style={styles.avatarStatusText}>Using Your Personal Avatar</Text>
          </View>
          <Text style={styles.avatarDescription}>
            {userAvatar.features.gender} • {userAvatar.features.bodyType} • {userAvatar.features.height}cm
          </Text>
        </View>
      ) : (
        <View style={styles.avatarStatus}>
          <View style={styles.avatarStatusHeader}>
            <Ionicons name="person-outline" size={24} color="#6B7280" />
            <Text style={styles.avatarStatusText}>Using Generic Model</Text>
          </View>
          <TouchableOpacity 
            style={styles.createAvatarButton}
            onPress={() => (navigation as any).navigate('AvatarCreation')}
          >
            <Text style={styles.createAvatarButtonText}>Create Personal Avatar</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Nano Banana Toggle */}
      {renderNanoBananaToggle()}
      
      {/* Model/Avatar Selection - Only show if no personal avatar */}
      {!userAvatar && renderModelTypeSelector()}
      {!userAvatar && renderBodyTypeSelector()}
      {renderPoseSelector()}
      {renderBackgroundSelector()}

      <TouchableOpacity
        style={[styles.generateButton, isGenerating && styles.disabledButton]}
        onPress={handleGenerateTryOn}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={styles.generateButtonText}>Generating...</Text>
          </View>
        ) : (
          <Text style={styles.generateButtonText}>
          {userAvatar ? 'Generate with My Avatar' : 'Generate Virtual Try-On'}
        </Text>
        )}
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {renderGeneratedImage()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
    marginLeft: 16,
  },
  outfitPreview: {
    backgroundColor: 'white',
    margin: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  outfitTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  outfitItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  outfitItem: {
    alignItems: 'center',
    width: 80,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 5,
  },
  itemName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  selectorContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  selectorButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  selectedButton: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  selectorButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedButtonText: {
    color: 'white',
  },
  toggleContainer: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginVertical: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  toggleDescription: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginRight: 10,
  },
  generateButton: {
    backgroundColor: '#2563EB',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  generatedImageContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  generatedImage: {
    width: SCREEN_WIDTH - 70,
    height: SCREEN_WIDTH - 70,
    borderRadius: 12,
    alignSelf: 'center',
  },
  imageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  avatarStatus: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  avatarDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 32,
  },
  createAvatarButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
    marginLeft: 32,
  },
  createAvatarButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default VirtualTryOnScreen;