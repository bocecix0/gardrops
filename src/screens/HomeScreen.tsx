import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Image,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Occasion, Outfit, Season, HairColor, EyeColor, HairStyle, PoseType, BackgroundType, BodyType } from '../types';
import { useWardrobe } from '../hooks/useWardrobe';
import { useWeatherOutfit } from '../hooks/useWeatherOutfit';
import { weatherService } from '../services/weather';
import { openAIService } from '../services/openai';
import { useAuth } from '../contexts/AuthContext';
import { useAuthPrompt } from '../hooks/useAuthPrompt';
import AuthPromptModal from '../components/AuthPromptModal';
import { useTheme } from '../hooks/useTheme';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { colors, typography, spacing } = useTheme();
  const { currentUser } = useAuth();
  const {
    requireAuth,
    showingAuthPrompt,
    actionName,
    handleSignIn,
    handleSignUp,
    handleClose
  } = useAuthPrompt();
  const { state, removeClothingFromAvatar } = useWardrobe();
  const { weather, outfitSuggestion, isLoading, isGeneratingOutfit, refreshOutfit, loadWeatherAndOutfit } = useWeatherOutfit();
  
  // Avatar image state
  const [avatarImageUri, setAvatarImageUri] = useState<string | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  
  // Enhanced animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const cardStaggerAnim = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = React.useState(false);

  // First launch animation sequence
  useEffect(() => {
    // Initial fade in
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Staggered card animations after initial load
      Animated.timing(cardStaggerAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    });
  }, []);

  // Generate avatar image when avatar or clothing changes
  useEffect(() => {
    if (state.simpleAvatar && state.clothingOnAvatar.length > 0) {
      generateAvatarImage();
    } else if (state.simpleAvatar) {
      // If no clothing but avatar exists, show base avatar
      setAvatarImageUri(null);
    }
  }, [state.simpleAvatar, state.clothingOnAvatar]);

  const generateAvatarImage = async () => {
    if (!state.simpleAvatar || state.clothingOnAvatar.length === 0) return;
    
    setIsGeneratingAvatar(true);
    setAvatarError(null);
    
    try {
      // Create a temporary outfit with the clothing on avatar
      const clothingItems = state.clothingOnAvatar
        .map(clothing => state.clothingItems.find(item => item.id === clothing.clothingItemId))
        .filter(Boolean) as any[];
      
      if (clothingItems.length === 0) {
        setAvatarImageUri(null);
        setIsGeneratingAvatar(false);
        return;
      }
      
      const tempOutfit: Outfit = {
        id: 'temp_avatar_outfit',
        name: 'Current Avatar Outfit',
        items: clothingItems,
        occasion: Occasion.CASUAL,
        season: Season.SPRING,
        isGenerated: true,
        dateCreated: new Date().toISOString()
      };
      
      // Generate avatar image using OpenAI service
      const request = {
        outfit: tempOutfit,
        avatar: {
          id: state.simpleAvatar.id,
          features: {
            id: state.simpleAvatar.id,
            gender: state.simpleAvatar.gender,
            bodyType: state.simpleAvatar.bodyType,
            height: 170,
            weight: 65,
            skinTone: state.simpleAvatar.skinTone,
            hairColor: HairColor.BROWN,
            hairStyle: HairStyle.MEDIUM,
            eyeColor: EyeColor.BROWN,
            bodyShape: {
              shoulders: 'average' as const,
              waist: 'average' as const,
              hips: 'average' as const,
              chest: 'average' as const,
              legs: 'average' as const
            },
            faceShape: 'oval' as const,
            style: [],
            measurements: {
              bust: 85,
              waist: 65,
              hips: 90,
              shoulderWidth: 40,
              armLength: 60,
              legLength: 85
            }
          },
          basePrompt: state.simpleAvatar.baseImagePrompt,
          dateCreated: state.simpleAvatar.dateCreated,
          isActive: true
        },
        pose: PoseType.STANDING,
        background: BackgroundType.STUDIO
      };
      
      const result = await openAIService.generatePersonalizedTryOn(request);
      setAvatarImageUri(result.imageUrl);
    } catch (error) {
      console.error('Failed to generate avatar image:', error);
      setAvatarError('Failed to generate avatar visualization');
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeatherAndOutfit();
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: 1,
      title: 'Try-On',
      subtitle: 'Virtual fitting',
      icon: 'camera-outline',
      color: colors.primary,
      gradient: [colors.primaryLight, colors.primary],
      onPress: () => {
        // Check if user is authenticated before allowing to use try-on
        requireAuth('use virtual try-on', () => {
          navigation.navigate('Suggestions' as any);
        });
      },
    },
    {
      id: 2,
      title: 'Wardrobe',
      subtitle: 'My items',
      icon: 'shirt-outline',
      color: '#EC4899',
      gradient: ['#F472B6', '#EC4899'],
      onPress: () => {
        // Check if user is authenticated before allowing to access wardrobe
        requireAuth('access your wardrobe', () => {
          navigation.navigate('Wardrobe' as any);
        });
      },
    },
    {
      id: 3,
      title: 'AI Suggestions',
      subtitle: 'Outfit ideas',
      icon: 'sparkles-outline',
      color: colors.secondary,
      gradient: [colors.secondaryLight, colors.secondary],
      onPress: () => {
        // Check if user is authenticated before allowing to use AI suggestions
        requireAuth('get AI outfit suggestions', () => {
          navigation.navigate('Suggestions' as any);
        });
      },
    },
    {
      id: 4,
      title: 'Avatar',
      subtitle: 'Create model',
      icon: 'person-outline',
      color: colors.accent,
      gradient: [colors.accentLight, colors.accent],
      onPress: () => {
        // Check if user is authenticated before allowing to create avatar
        requireAuth('create your avatar', () => {
          if (state.simpleAvatar) {
            navigation.navigate('SimpleAvatarCreation' as any);
          } else {
            navigation.navigate('AvatarCreation' as any);
          }
        });
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome message with enhanced animation */}
        <Animated.View 
          style={[
            styles.welcomeSection,
            {
              opacity: headerFadeAnim,
            }
          ]}
        >
          <Text style={styles.greeting}>Good {getTimeOfDay()}, {currentUser?.displayName || 'there'}!</Text>
          <Text style={styles.welcomeText}>Ready to create your perfect look today?</Text>
        </Animated.View>

        {/* Stats Cards with enhanced animation */}
        <Animated.View 
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{state.clothingItems.length}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{state.outfits.length}</Text>
              <Text style={styles.statLabel}>Outfits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{state.simpleAvatar ? '✓' : '—'}</Text>
              <Text style={styles.statLabel}>Avatar</Text>
            </View>
          </View>
        </Animated.View>

        {/* Weather Card with enhanced animation */}
        <Animated.View 
          style={[
            styles.weatherCard,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading weather...</Text>
            </View>
          ) : (
            <>
              <View style={styles.weatherHeader}>
                <View style={styles.locationInfo}>
                  <Ionicons name="location-outline" size={16} color={colors.primary} />
                  <Text style={styles.locationText}>{weather?.city || 'Unknown'}</Text>
                </View>
                <TouchableOpacity onPress={refreshOutfit} style={styles.refreshBtn}>
                  <Ionicons 
                    name="refresh-outline" 
                    size={18} 
                    color={isGeneratingOutfit ? colors.textTertiary : colors.primary} 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.weatherMain}>
                <Ionicons 
                  name={weatherService.getWeatherIcon(weather?.condition || 'sunny') as any} 
                  size={32} 
                  color={colors.primary} 
                />
                <View style={styles.weatherDetails}>
                  <Text style={styles.temperature}>{weather?.temperature || 20}°C</Text>
                  <Text style={styles.weatherCondition}>
                    {weatherService.getWeatherDescription(weather?.condition || 'sunny', weather?.temperature || 20)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </Animated.View>

        {/* Avatar Section with enhanced animation */}
        <Animated.View 
          style={[
            styles.avatarCard,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <View style={styles.avatarHeader}>
            <Text style={styles.cardTitle}>My Avatar</Text>
            {state.simpleAvatar && (
              <View style={styles.avatarBodyType}>
                <Text style={styles.bodyTypeLabel}>{state.simpleAvatar.bodyType.replace('_', ' ').toUpperCase()}</Text>
              </View>
            )}
          </View>
          
          {state.simpleAvatar ? (
            <View style={styles.avatarDisplay}>
              <View style={styles.avatarVisualContainer}>
                {isGeneratingAvatar ? (
                  <View style={styles.avatarImageContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.generatingText}>Generating avatar...</Text>
                  </View>
                ) : avatarError ? (
                  <View style={styles.avatarImageContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                    <Text style={styles.errorText}>{avatarError}</Text>
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={generateAvatarImage}
                    >
                      <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : avatarImageUri ? (
                  <Animated.Image 
                    source={{ uri: avatarImageUri }} 
                    style={styles.avatarImage}
                    resizeMode="contain"
                    onLoad={() => {
                      Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                      }).start();
                    }}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons 
                      name={state.simpleAvatar.gender === 'female' ? 'woman' : 'man'} 
                      size={80} 
                      color={colors.primary} 
                    />
                    <Text style={styles.avatarPlaceholderText}>Avatar ready for try-on</Text>
                    <Text style={styles.avatarPlaceholderSubtext}>Add clothing to see visualization</Text>
                  </View>
                )}
                
                {state.simpleAvatar && (
                  <Text style={styles.avatarDescription}>
                    {state.simpleAvatar.bodyType.replace('_', ' ').toUpperCase()} Avatar
                  </Text>
                )}
                {state.simpleAvatar && (
                  <Text style={styles.avatarGender}>
                    {state.simpleAvatar.gender.toUpperCase()} • {state.simpleAvatar.skinTone.replace('_', ' ').toUpperCase()}
                  </Text>
                )}
              </View>
              
              {/* Current Outfit Display */}
              {state.clothingOnAvatar.length > 0 && (
                <View style={styles.currentOutfitSection}>
                  <Text style={styles.currentOutfitTitle}>Currently Wearing:</Text>
                  <View style={styles.clothingItemsList}>
                    {state.clothingOnAvatar.map((clothing, index) => {
                      const clothingItem = state.clothingItems.find(item => item.id === clothing.clothingItemId);
                      if (!clothingItem) return null;
                      
                      return (
                        <Animated.View
                          key={clothing.id}
                          style={{
                            opacity: cardStaggerAnim,
                            transform: [{ 
                              translateX: cardStaggerAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-20, 0]
                              })
                            }]
                          }}
                        >
                          <View key={clothing.id} style={styles.wornClothingItem}>
                            <Ionicons 
                              name={getClothingIcon(clothingItem.category)} 
                              size={16} 
                              color={colors.primary} 
                            />
                            <Text style={styles.wornClothingName} numberOfLines={1}>
                              {clothingItem.name}
                            </Text>
                            <TouchableOpacity 
                              onPress={() => removeClothingFromAvatar(clothing.clothingItemId)}
                              style={styles.removeClothingBtn}
                            >
                              <Ionicons name="close-circle" size={16} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                        </Animated.View>
                      );
                    })}
                  </View>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.wardrobeButton}
                onPress={() => (navigation as any).navigate('Wardrobe')}
              >
                <Ionicons name="shirt-outline" size={16} color="white" />
                <Text style={styles.wardrobeButtonText}>Try More Clothes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noAvatarContainer}>
              <Ionicons name="person-add-outline" size={32} color={colors.textTertiary} />
              <Text style={styles.noAvatarText}>Create your avatar to see outfit visualizations</Text>
              <TouchableOpacity 
                style={styles.createAvatarButton}
                onPress={() => (navigation as any).navigate('SimpleAvatarCreation')}
              >
                <Text style={styles.createAvatarButtonText}>Create Avatar</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Outfit Suggestion with enhanced animation */}
        {outfitSuggestion && (
          <Animated.View 
            style={[
              styles.outfitCard,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <Text style={styles.cardTitle}>Today's Suggestion</Text>
            <Text style={styles.cardSubtitle}>{outfitSuggestion.reasoning}</Text>
            <TouchableOpacity 
              style={styles.tryOnButton}
              onPress={() => (navigation as any).navigate('Suggestions')}
            >
              <Text style={styles.tryOnButtonText}>Try On</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Quick Actions with enhanced animation */}
        <Animated.View 
          style={[
            styles.actionsSection,
            {
              opacity: cardStaggerAnim,
              transform: [{ 
                translateY: cardStaggerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0]
                })
              }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <Animated.View
                key={action.id}
                style={{
                  opacity: cardStaggerAnim,
                  transform: [{ 
                    translateY: cardStaggerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }]
                }}
              >
                <TouchableOpacity
                  style={[styles.actionCard]}
                  onPress={action.onPress}
                  activeOpacity={0.7}
                >
                  <View 
                    style={[
                      styles.actionIcon, 
                      { 
                        backgroundColor: action.gradient[0],
                        shadowColor: action.color,
                      } 
                    ]}
                  >
                    <Ionicons name={action.icon as any} size={24} color="white" />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
      <AuthPromptModal
        visible={showingAuthPrompt}
        onClose={handleClose}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        actionName={actionName}
      />
    </SafeAreaView>
  );

  function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  function getClothingIcon(category: any): any {
    switch (category?.toLowerCase()) {
      case 'top': return 'shirt-outline';
      case 'bottom': return 'pants-outline';
      case 'dress': return 'woman-outline';
      case 'shoes': return 'footsteps-outline';
      case 'outerwear': return 'jacket-outline';
      case 'accessories': return 'watch-outline';
      default: return 'shirt-outline';
    }
  }

  function getColorValue(colorName: string): string {
    const colorMap: { [key: string]: string } = {
      'Black': '#000000',
      'White': '#ffffff',
      'Red': '#ef4444',
      'Blue': '#3b82f6',
      'Green': '#10b981',
      'Yellow': '#f59e0b',
      'Purple': '#8b5cf6',
      'Pink': '#ec4899',
      'Brown': '#92400e',
      'Gray': '#6b7280',
      'Orange': '#f97316',
      'Navy': '#1e40af',
      'Cream': '#fef3c7',
      'Maroon': '#991b1b',
      'Olive': '#65a30d',
    };
    return colorMap[colorName] || '#9ca3af';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  
  // Welcome Section
  welcomeSection: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
  },
  greeting: {
    fontSize: 18,
    color: '#6366F1',
    fontWeight: '600',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 32,
  },
  
  // Stats
  statsContainer: {
    margin: 24,
    marginTop: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  
  // Weather Card
  weatherCard: {
    margin: 24,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  weatherDetails: {
    flex: 1,
  },
  temperature: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
  },
  weatherCondition: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  
  // Outfit Card
  outfitCard: {
    margin: 24,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 20,
  },
  tryOnButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignSelf: 'flex-start',
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tryOnButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Actions Section
  actionsSection: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
  },
  actionsGrid: {
    gap: 16,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  
  // Avatar Card
  avatarCard: {
    margin: 24,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarBodyType: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bodyTypeLabel: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '700',
  },
  avatarDisplay: {
    alignItems: 'center',
  },
  avatarVisualContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
  },
  avatarImageContainer: {
    width: 160,
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 160,
    height: 190,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 160,
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
  },
  avatarPlaceholderText: {
    fontSize: 16,
    color: '#6366F1',
    marginTop: 12,
    fontWeight: '600',
  },
  avatarPlaceholderSubtext: {
    fontSize: 14,
    color: '#A5B4FC',
    marginTop: 4,
    textAlign: 'center',
  },
  generatingText: {
    fontSize: 16,
    color: '#6366F1',
    marginTop: 12,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  avatarDescription: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  avatarGender: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
  currentOutfitSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  currentOutfitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  clothingItemsList: {
    gap: 8,
  },
  wornClothingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  wornClothingName: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  removeClothingBtn: {
    padding: 4,
  },
  wardrobeButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignSelf: 'stretch',
    marginTop: 16,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  wardrobeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noAvatarContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noAvatarText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  createAvatarButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createAvatarButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});