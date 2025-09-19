import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ClothingCategory, ClothingItem, RootStackParamList } from '../types';
import { useWardrobe } from '../hooks/useWardrobe';
import { useAuth } from '../contexts/AuthContext';
import { useAuthPrompt } from '../hooks/useAuthPrompt';
import { socialSharingService } from '../services/socialSharingService';
import AuthPromptModal from '../components/AuthPromptModal';
import { useTheme } from '../hooks/useTheme';
import PrimaryButton from '../components/PrimaryButton';
import CustomInput from '../components/CustomInput';
import EmptyState from '../components/EmptyState';

const { width } = Dimensions.get('window');

export default function WardrobeScreen() {
  const { colors, typography, spacing } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { currentUser } = useAuth();
  const {
    requireAuth,
    showingAuthPrompt,
    actionName,
    handleSignIn,
    handleSignUp,
    handleClose
  } = useAuthPrompt();
  const { state, loadClothingItems, searchClothingItems, filterClothingItems, tryClothingOnAvatar, removeClothingFromAvatar } = useWardrobe();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'all'>('all');
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [friendName, setFriendName] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  const categories = [
    { key: 'all', label: 'All', icon: 'apps-outline' },
    { key: ClothingCategory.TOP, label: 'Tops', icon: 'shirt-outline' },
    { key: ClothingCategory.BOTTOM, label: 'Bottoms', icon: 'pants-outline' },
    { key: ClothingCategory.SHOES, label: 'Shoes', icon: 'footsteps-outline' },
    { key: ClothingCategory.DRESS, label: 'Dresses', icon: 'dress-outline' },
    { key: ClothingCategory.OUTERWEAR, label: 'Jackets', icon: 'coat-outline' },
    { key: ClothingCategory.ACCESSORIES, label: 'Accessories', icon: 'watch-outline' },
  ];

  // Effect to filter items when category or search changes
  useEffect(() => {
    filterAndSearchItems();
  }, [state.clothingItems, selectedCategory, searchQuery]);

  const filterAndSearchItems = async () => {
    if (isSearching) return;

    setIsSearching(true);
    
    try {
      let items = state.clothingItems;

      // Apply category filter
      if (selectedCategory !== 'all') {
        items = items.filter(item => item.category === selectedCategory);
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const searchResults = await searchClothingItems(searchQuery.trim());
        items = items.filter(item => 
          searchResults.some(result => result.id === item.id)
        );
      }

      setFilteredItems(items);
    } catch (error) {
      console.error('Error filtering items:', error);
      setFilteredItems(state.clothingItems);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClothingItems();
    setRefreshing(false);
  };

  const handleAddItem = () => {
    // Check if user is authenticated before allowing to add items
    requireAuth('add items to your wardrobe', () => {
      if (currentUser) {
        navigation.navigate('AddItem');
      } else {
        // Navigate to login screen
        navigation.navigate('Home' as any); // This will show the login prompt in the home screen
      }
    });
  };

  const handleItemPress = (item: ClothingItem) => {
    navigation.navigate('ItemDetails', { itemId: item.id });
  };

  const handleTryOnAvatar = async (item: ClothingItem) => {
    // Check if user is authenticated before allowing to try on items
    requireAuth('try on clothing items', async () => {
      if (!state.simpleAvatar) {
        // Navigate to avatar creation if no avatar exists
        navigation.navigate('SimpleAvatarCreation' as any);
        return;
      }

      try {
        const prompt = await tryClothingOnAvatar(item.id);
        if (prompt) {
          // Show success feedback
          console.log('Clothing added to avatar successfully!');
          // You could add a toast notification here
        }
      } catch (error) {
        console.error('Failed to try clothing on avatar:', error);
      }
    });
  };

  const handleRemoveFromAvatar = async (itemId: string) => {
    // Check if user is authenticated before allowing to remove items from avatar
    requireAuth('remove clothing from your avatar', async () => {
      try {
        await removeClothingFromAvatar(itemId);
        console.log('Clothing removed from avatar successfully!');
      } catch (error) {
        console.error('Failed to remove clothing from avatar:', error);
      }
    });
  };

  const handleShareItem = (item: ClothingItem) => {
    // Check if user is authenticated before allowing to share items
    requireAuth('share clothing items', () => {
      setSelectedItem(item);
      setFriendName('');
      setShareMessage(`Check out this ${item.name} I thought you might like!`);
      setShowShareModal(true);
    });
  };

  const sendShareRequest = async () => {
    if (!selectedItem || !friendName.trim()) {
      Alert.alert('Error', 'Please enter a friend name');
      return;
    }

    try {
      // In a real implementation, you would get the actual friend ID from your connections
      // For demo purposes, we'll use a mock friend ID
      const success = await socialSharingService.shareClothingItem(
        selectedItem,
        'current_user_id', // In real app, get from auth context
        'Current User', // In real app, get from auth context
        `friend_${friendName.replace(/\s+/g, '_').toLowerCase()}`, // Mock friend ID
        friendName,
        shareMessage
      );
      
      if (success) {
        setShowShareModal(false);
        Alert.alert(
          'Success',
          `Your clothing item has been shared with ${friendName} successfully!`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to share the clothing item. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error sharing item:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while sharing the item.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.key && styles.selectedCategoryItem
      ]}
      onPress={() => setSelectedCategory(item.key as ClothingCategory | 'all')}
    >
      <Ionicons 
        name={item.icon as any} 
        size={20} 
        color={selectedCategory === item.key ? 'white' : colors.textSecondary} 
      />
      <Text 
        style={[
          styles.categoryText,
          selectedCategory === item.key && styles.selectedCategoryText
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderClothingItem = ({ item }: { item: ClothingItem }) => (
    <TouchableOpacity 
      style={styles.clothingItem}
      onPress={() => handleItemPress(item)}
      onLongPress={() => handleShareItem(item)}
    >
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
      ) : (
        <View style={styles.itemImagePlaceholder}>
          <Ionicons name={getClothingIcon(item.category)} size={32} color={colors.textSecondary} />
        </View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <View style={styles.itemActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleTryOnAvatar(item)}
          >
            <Ionicons name="shirt-outline" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Try On</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleShareItem(item)}
          >
            <Ionicons name="share-outline" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderShareModal = () => (
    <Modal
      visible={showShareModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowShareModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share Item</Text>
            <TouchableOpacity 
              onPress={() => setShowShareModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          {selectedItem && (
            <View style={styles.shareItemPreview}>
              {selectedItem.imageUri ? (
                <Image source={{ uri: selectedItem.imageUri }} style={styles.shareItemImage} />
              ) : (
                <View style={styles.shareItemImagePlaceholder}>
                  <Ionicons name={getClothingIcon(selectedItem.category)} size={32} color={colors.textSecondary} />
                </View>
              )}
              <Text style={styles.shareItemName}>{selectedItem.name}</Text>
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Friend's Name</Text>
            <CustomInput
              placeholder="Enter friend's name"
              value={friendName}
              onChangeText={setFriendName}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Message</Text>
            <CustomInput
              placeholder="Add a message (optional)"
              value={shareMessage}
              onChangeText={setShareMessage}
              multiline
              numberOfLines={3}
            />
          </View>
          
          <PrimaryButton 
            title="Send Share Request"
            onPress={sendShareRequest}
            style={styles.shareButton}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentHeader}>
        <Text style={styles.headerTitle}>My Wardrobe</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddItem}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clothing items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.key.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
      
      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          renderItem={renderClothingItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.itemsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ) : (
        <EmptyState
          icon="shirt-outline"
          title="No Clothing Items"
          description="Add your first item to get started"
          actionText="Add Item"
          onActionPress={handleAddItem}
        />
      )}
      
      {renderShareModal()}
      <AuthPromptModal
        visible={showingAuthPrompt}
        onClose={handleClose}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        actionName={actionName}
      />
    </SafeAreaView>
  );

  function getClothingIcon(category: ClothingCategory): any {
    switch (category) {
      case ClothingCategory.TOP: return 'shirt-outline';
      case ClothingCategory.BOTTOM: return 'pants-outline';
      case ClothingCategory.DRESS: return 'woman-outline';
      case ClothingCategory.SHOES: return 'footsteps-outline';
      case ClothingCategory.OUTERWEAR: return 'jacket-outline';
      case ClothingCategory.ACCESSORIES: return 'watch-outline';
      default: return 'shirt-outline';
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: '#6366F1',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    padding: 24,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    height: 60,
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 24,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  selectedCategoryItem: {
    backgroundColor: '#6366F1',
  },
  categoryText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 8,
  },
  selectedCategoryText: {
    color: 'white',
  },
  itemsList: {
    paddingHorizontal: 16,
  },
  clothingItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemImage: {
    width: '100%',
    height: 150,
  },
  itemImagePlaceholder: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  itemInfo: {
    padding: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 8,
  },
  shareItemPreview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  shareItemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
  shareItemImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  shareItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  shareButton: {
    marginTop: 10,
  },
});