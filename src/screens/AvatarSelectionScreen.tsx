import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../hooks/useTheme';
import { RootStackParamList } from '../types';
import { useWardrobe } from '../hooks/useWardrobe';
import { generateUniqueId } from '../utils/clothingUtils';
import { BodyType } from '../types';

type AvatarSelectionScreenNavigationProp = NavigationProp<RootStackParamList, 'AvatarSelection'>;

export default function AvatarSelectionScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<AvatarSelectionScreenNavigationProp>();
  const { addSimpleAvatar, state } = useWardrobe();
  const [userPhotoUri, setUserPhotoUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if user already has an avatar
  useEffect(() => {
    if (state.simpleAvatar) {
      // If user already has an avatar, navigate to home
      navigation.navigate('Home');
    }
  }, [state.simpleAvatar, navigation]);

  const handleTakePhoto = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUserPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      // Request gallery permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery permission is needed to select photos.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUserPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const createAIAvatar = async () => {
    try {
      // Create a simple AI avatar
      const aiAvatar = {
        id: generateUniqueId(),
        bodyType: BodyType.RECTANGLE,
        gender: 'female' as const,
        skinTone: 'medium' as any,
        baseImagePrompt: 'A stylish fashion model avatar',
        dateCreated: new Date().toISOString(),
        isActive: true
      };

      const success = await addSimpleAvatar(aiAvatar);
      
      if (success) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Failed to create AI avatar. Please try again.');
      }
    } catch (error) {
      console.error('Error creating AI avatar:', error);
      Alert.alert('Error', 'Failed to create AI avatar. Please try again.');
    }
  };

  const createPersonalizedAvatar = async () => {
    if (!userPhotoUri) return;
    
    setIsProcessing(true);
    
    try {
      // For now, we'll create a simple avatar with the user's photo
      // In a real implementation, you would process the photo here
      const personalizedAvatar = {
        id: generateUniqueId(),
        bodyType: BodyType.RECTANGLE,
        gender: 'female' as const,
        skinTone: 'medium' as any,
        baseImagePrompt: 'A personalized avatar based on user photo',
        dateCreated: new Date().toISOString(),
        isActive: true
      };

      const success = await addSimpleAvatar(personalizedAvatar);
      
      if (success) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Failed to create personalized avatar. Please try again.');
      }
    } catch (error) {
      console.error('Error creating personalized avatar:', error);
      Alert.alert('Error', 'Failed to create personalized avatar. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // If user already has an avatar, don't show this screen
  if (state.simpleAvatar) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Avatar</Text>
          <Text style={styles.subtitle}>Select how you'd like to represent yourself in the app</Text>
        </View>

        <View style={styles.content}>
          {/* AI Avatar Option - Left */}
          <View style={styles.avatarOptionContainer}>
            <Text style={styles.optionTitle}>AI Avatar</Text>
            <Text style={styles.optionSubtitle}>Let our AI create a stylish avatar for you</Text>
            
            <View style={[styles.avatarContainer, { backgroundColor: colors.background }]}>
              <View style={styles.aiAvatarPlaceholder}>
                <Ionicons name="sparkles" size={48} color={colors.primary} />
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.selectButton, { backgroundColor: colors.primary }]}
              onPress={createAIAvatar}
            >
              <Text style={styles.selectButtonText}>Use AI Avatar</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Personal Photo Option - Right */}
          <View style={styles.avatarOptionContainer}>
            <Text style={styles.optionTitle}>Your Photo</Text>
            <Text style={styles.optionSubtitle}>Use your own photo as your avatar</Text>
            
            <View style={[styles.avatarContainer, { backgroundColor: colors.background }]}>
              {userPhotoUri ? (
                <Image source={{ uri: userPhotoUri }} style={styles.userPhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={48} color={colors.primary} />
                  <Text style={styles.photoPlaceholderText}>Add Your Photo</Text>
                </View>
              )}
            </View>
            
            <View style={styles.photoActions}>
              <TouchableOpacity 
                style={[styles.photoButton, { backgroundColor: colors.primary }]}
                onPress={handleTakePhoto}
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.photoButton, { backgroundColor: colors.secondary }]}
                onPress={handleSelectFromGallery}
              >
                <Ionicons name="images" size={20} color="white" />
                <Text style={styles.photoButtonText}>Choose Photo</Text>
              </TouchableOpacity>
            </View>
            
            {userPhotoUri && (
              <TouchableOpacity 
                style={[styles.selectButton, { backgroundColor: colors.accent }]}
                onPress={createPersonalizedAvatar}
                disabled={isProcessing}
              >
                <Text style={styles.selectButtonText}>
                  {isProcessing ? 'Processing...' : 'Use My Photo'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 0,
  },
  avatarOptionContainer: {
    marginBottom: 30,
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  optionSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  avatarContainer: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiAvatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 18,
    color: '#64748B',
    marginTop: 12,
    fontWeight: '600',
  },
  userPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  selectButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 16,
    color: '#64748B',
    marginHorizontal: 16,
    fontWeight: '600',
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  photoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});