import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList, Occasion, ClothingItem, OutfitSuggestion } from '../types';
import { useWardrobe } from '../hooks/useWardrobe';
import { useOutfitGeneration } from '../hooks/useOutfitGeneration';
import { useTheme } from '../hooks/useTheme';
import PrimaryButton from '../components/PrimaryButton';
import CustomCard from '../components/CustomCard';
import CustomHeader from '../components/CustomHeader';
import EmptyState from '../components/EmptyState';

type SuggestionsScreenRouteProp = RouteProp<RootStackParamList, 'Suggestions'>;

export default function SuggestionsScreen() {
  const { colors, typography, spacing } = useTheme();
  const route = useRoute<SuggestionsScreenRouteProp>();
  const navigation = useNavigation();
  const { state } = useWardrobe();
  const { isGenerating, currentSuggestion, generateOutfit, clearSuggestion } = useOutfitGeneration();
  
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion>(
    route.params?.occasion || Occasion.CASUAL
  );
  const [showSuggestion, setShowSuggestion] = useState(false);

  const occasions = [
    { key: Occasion.CASUAL, label: 'Casual', icon: 'cafe', color: '#10b981' },
    { key: Occasion.BUSINESS, label: 'Business', icon: 'briefcase', color: '#3b82f6' },
    { key: Occasion.FORMAL, label: 'Formal', icon: 'diamond', color: '#8b5cf6' },
    { key: Occasion.DATE, label: 'Date', icon: 'heart', color: '#ef4444' },
    { key: Occasion.PARTY, label: 'Party', icon: 'musical-notes', color: '#f59e0b' },
    { key: Occasion.SPORTS, label: 'Sports', icon: 'fitness', color: '#06b6d4' },
  ];

  const handleGenerateSuggestion = async () => {
    clearSuggestion();
    setShowSuggestion(false);
    
    const suggestion = await generateOutfit({
      occasion: selectedOccasion,
      availableItems: state.clothingItems,
      userPreferences: state.userProfile?.preferences,
      constraints: []
    });
    
    if (suggestion) {
      setShowSuggestion(true);
    }
  };

  const renderClothingItem = (item: ClothingItem) => (
    <View key={item.id} style={styles.outfitItem}>
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
      ) : (
        <View style={styles.itemPlaceholder}>
          <Ionicons name="shirt-outline" size={24} color="#9ca3af" />
        </View>
      )}
      <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.itemCategory}>{item.category.toUpperCase()}</Text>
    </View>
  );

  const renderOutfitSuggestion = () => {
    if (!currentSuggestion) return null;

    return (
      <CustomCard style={styles.suggestionContainer}>
        <View style={styles.suggestionHeader}>
          <Text style={styles.suggestionTitle}>{currentSuggestion.outfit.name}</Text>
          <View style={styles.confidenceContainer}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.confidenceText}>
              {Math.round(currentSuggestion.confidence * 100)}% match
            </Text>
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.outfitItemsContainer}
        >
          {currentSuggestion.outfit.items.map(renderClothingItem)}
        </ScrollView>

        <View style={styles.reasoningContainer}>
          <Text style={styles.reasoningTitle}>Why this works:</Text>
          <Text style={styles.reasoningText}>{currentSuggestion.reasoning}</Text>
        </View>

        <View style={styles.suggestionActions}>
          <PrimaryButton
            title="New Suggestion"
            onPress={() => setShowSuggestion(false)}
            variant="outline"
            icon="refresh"
            size="small"
            style={styles.actionButton}
          />
          
          <PrimaryButton
            title="Virtual Try-On"
            onPress={() => (navigation as any).navigate('VirtualTryOn', { outfit: currentSuggestion.outfit })}
            variant="outline"
            icon="camera"
            size="small"
            style={styles.actionButton}
          />
          
          <PrimaryButton
            title="Save"
            onPress={() => {/* TODO: Save outfit */}}
            variant="primary"
            icon="heart"
            size="small"
            style={styles.actionButton}
          />
        </View>
      </CustomCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Occasion Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Occasion</Text>
          <View style={styles.occasionsGrid}>
            {occasions.map((occasion) => (
              <TouchableOpacity
                key={occasion.key}
                style={[
                  styles.occasionCard,
                  selectedOccasion === occasion.key && styles.occasionCardActive,
                ]}
                onPress={() => setSelectedOccasion(occasion.key)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.occasionIcon,
                    { backgroundColor: occasion.color + '20' },
                    selectedOccasion === occasion.key && { backgroundColor: occasion.color },
                  ]}
                >
                  <Ionicons
                    name={occasion.icon as any}
                    size={24}
                    color={selectedOccasion === occasion.key ? 'white' : occasion.color}
                  />
                </View>
                <Text
                  style={[
                    styles.occasionLabel,
                    selectedOccasion === occasion.key && styles.occasionLabelActive,
                  ]}
                >
                  {occasion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generate Button or Results */}
        <View style={styles.section}>
          {!showSuggestion ? (
            <>
              <PrimaryButton
                title={isGenerating ? 'Generating Magic...' : 'Generate AI Suggestion'}
                onPress={handleGenerateSuggestion}
                loading={isGenerating}
                disabled={isGenerating || state.clothingItems.length < 2}
                icon="sparkles"
                style={styles.generateButton}
              />
              
              {state.clothingItems.length < 2 && (
                <Text style={styles.warningText}>
                  You need at least 2 clothing items to generate outfit suggestions.
                </Text>
              )}
            </>
          ) : (
            renderOutfitSuggestion()
          )}
        </View>

        {/* Empty State or Stats */}
        {!showSuggestion && !isGenerating && (
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>Your Wardrobe Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{state.stats.totalItems}</Text>
                <Text style={styles.statLabel}>Items</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{state.stats.totalOutfits}</Text>
                <Text style={styles.statLabel}>Saved Outfits</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {Object.keys(state.stats.itemsByCategory).length}
                </Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
            </View>
          </View>
        )}

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What makes our AI special?</Text>
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="color-palette" size={20} color="#6366f1" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Color Coordination</Text>
                <Text style={styles.featureDescription}>
                  Smart color matching for harmonious looks
                </Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="trending-up" size={20} color="#6366f1" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Style Trends</Text>
                <Text style={styles.featureDescription}>
                  Up-to-date with latest fashion trends
                </Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="person" size={20} color="#6366f1" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Personal Style</Text>
                <Text style={styles.featureDescription}>
                  Learns your preferences over time
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  occasionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  occasionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  occasionCardActive: {
    borderColor: '#6366F1',
    backgroundColor: '#F8FAFF',
  },
  occasionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  occasionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  occasionLabelActive: {
    color: '#6366F1',
  },
  generateButton: {
    marginBottom: 16,
  },
  warningText: {
    marginTop: 12,
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '500',
  },
  suggestionContainer: {
    marginVertical: 16,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  suggestionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    letterSpacing: -0.5,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  outfitItemsContainer: {
    marginBottom: 16,
  },
  outfitItem: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  reasoningContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reasoningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  reasoningText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontWeight: '400',
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  statsSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
});