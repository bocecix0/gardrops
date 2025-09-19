import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { socialSharingService } from '../services/socialSharingService';
import { useWardrobe } from '../hooks/useWardrobe';
import { SharedClothingItem } from '../types/social';

export default function SharedItemsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { state, tryClothingOnAvatar, removeClothingFromAvatar } = useWardrobe();
  
  const [sharedItems, setSharedItems] = useState<SharedClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSharedItems();
  }, []);

  const loadSharedItems = async () => {
    try {
      setLoading(true);
      const items = await socialSharingService.getSharedItems('current_user_id');
      setSharedItems(items);
    } catch (error) {
      console.error('Error loading shared items:', error);
      Alert.alert('Error', 'Failed to load shared items');
    } finally {
      setLoading(false);
    }
  };

  const handleTryOnAvatar = async (item: SharedClothingItem) => {
    if (!state.simpleAvatar) {
      // Navigate to avatar creation if no avatar exists
      navigation.navigate('SimpleAvatarCreation' as any);
      return;
    }

    try {
      const prompt = await tryClothingOnAvatar(item.id);
      if (prompt) {
        Alert.alert('Success', 'Clothing added to avatar successfully!');
      }
    } catch (error) {
      console.error('Failed to try clothing on avatar:', error);
      Alert.alert('Error', 'Failed to try clothing on avatar');
    }
  };

  const handleRemoveFromAvatar = async (itemId: string) => {
    try {
      await removeClothingFromAvatar(itemId);
      Alert.alert('Success', 'Clothing removed from avatar successfully!');
    } catch (error) {
      console.error('Failed to remove clothing from avatar:', error);
      Alert.alert('Error', 'Failed to remove clothing from avatar');
    }
  };

  const isClothingOnAvatar = (itemId: string): boolean => {
    return state.clothingOnAvatar.some(clothing => clothing.clothingItemId === itemId);
  };

  const renderSharedItem = ({ item }: { item: SharedClothingItem }) => {
    const onAvatar = isClothingOnAvatar(item.id);
    
    return (
      <View style={styles.itemCard}>
        <TouchableOpacity style={styles.itemImageContainer}>
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="shirt-outline" size={32} color="#9ca3af" />
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.sharedFromText}>
            Shared by {item.sharedFromUserName}
          </Text>
          <Text style={styles.sharedDateText}>
            {new Date(item.sharedDate).toLocaleDateString()}
          </Text>
          
          <View style={styles.itemTags}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>
                {item.category.toUpperCase()}
              </Text>
            </View>
            <View style={styles.colorsContainer}>
              {item.colors.slice(0, 3).map((color, index) => (
                <View
                  key={index}
                  style={[
                    styles.colorDot,
                    { backgroundColor: getColorValue(color) }
                  ]}
                />
              ))}
              {item.colors.length > 3 && (
                <Text style={styles.moreColorsText}>+{item.colors.length - 3}</Text>
              )}
            </View>
          </View>
          
          {/* Avatar Actions */}
          {state.simpleAvatar && (
            <View style={styles.avatarActions}>
              {onAvatar ? (
                <TouchableOpacity
                  style={styles.removeFromAvatarBtn}
                  onPress={() => handleRemoveFromAvatar(item.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-remove" size={14} color="#EF4444" />
                  <Text style={styles.removeFromAvatarText}>Remove</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.tryOnAvatarBtn}
                  onPress={() => handleTryOnAvatar(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-add" size={14} color="#2563EB" />
                  <Text style={styles.tryOnAvatarText}>Wear</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const getColorValue = (colorName: string): string => {
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
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading shared items...</Text>
        </View>
      ) : sharedItems.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIcon}>
            <Ionicons name="gift-outline" size={64} color="#d1d5db" />
          </View>
          <Text style={styles.emptyStateTitle}>No Shared Items</Text>
          <Text style={styles.emptyStateSubtitle}>
            Items shared with you by friends will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sharedItems}
          renderItem={renderSharedItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.itemsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: '400',
  },
  itemsList: {
    padding: 24,
    paddingBottom: 40,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImageContainer: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 160,
  },
  placeholderImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    padding: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 20,
  },
  sharedFromText: {
    fontSize: 14,
    color: '#2563EB',
    marginBottom: 4,
    fontWeight: '500',
  },
  sharedDateText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  itemTags: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTag: {
    backgroundColor: '#EFF6FF',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryTagText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
  },
  colorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  moreColorsText: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  
  // Avatar functionality styles
  avatarActions: {
    alignItems: 'center',
  },
  tryOnAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  tryOnAvatarText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  removeFromAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  removeFromAvatarText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
});