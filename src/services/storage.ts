import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClothingItem, Outfit, User, SimpleAvatarProfile, ClothingOnAvatar } from '../types';
import { SharedClothingItem } from '../types/social';
import { firebaseAuth as auth } from './firebase';
import { firebaseDb as db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

const STORAGE_KEYS = {
  CLOTHING_ITEMS: '@LookSee:clothing_items',
  OUTFITS: '@LookSee:outfits',
  USER_PROFILE: '@LookSee:user_profile',
  SIMPLE_AVATAR: '@LookSee:simple_avatar',
  CLOTHING_ON_AVATAR: '@LookSee:clothing_on_avatar',
  APP_SETTINGS: '@LookSee:app_settings'
};

// Helper function to get user-specific storage key
function getUserStorageKey(baseKey: string): string {
  const userId = auth.currentUser?.uid;
  return userId ? `${baseKey}_${userId}` : baseKey;
}

export class StorageService {
  // Clothing Items Management
  static async getClothingItems(): Promise<(ClothingItem | SharedClothingItem)[]> {
    try {
      const itemsJson = await AsyncStorage.getItem(getUserStorageKey(STORAGE_KEYS.CLOTHING_ITEMS));
      if (itemsJson) {
        const items = JSON.parse(itemsJson);
        // Keep dates as strings since we changed the interface
        return items;
      }
      return [];
    } catch (error) {
      console.error('Error loading clothing items:', error);
      return [];
    }
  }

  static async saveClothingItem(item: ClothingItem | SharedClothingItem): Promise<boolean> {
    try {
      const existingItems = await this.getClothingItems();
      
      // Check if item already exists (update) or is new (add)
      const existingIndex = existingItems.findIndex(existing => existing.id === item.id);
      
      if (existingIndex !== -1) {
        existingItems[existingIndex] = item;
      } else {
        existingItems.push(item);
      }

      await AsyncStorage.setItem(
        getUserStorageKey(STORAGE_KEYS.CLOTHING_ITEMS), 
        JSON.stringify(existingItems)
      );
      
      return true;
    } catch (error) {
      console.error('Error saving clothing item:', error);
      return false;
    }
  }

  static async deleteClothingItem(itemId: string): Promise<boolean> {
    try {
      const existingItems = await this.getClothingItems();
      const filteredItems = existingItems.filter(item => item.id !== itemId);
      
      await AsyncStorage.setItem(
        getUserStorageKey(STORAGE_KEYS.CLOTHING_ITEMS), 
        JSON.stringify(filteredItems)
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting clothing item:', error);
      return false;
    }
  }

  static async getClothingItemById(itemId: string): Promise<ClothingItem | SharedClothingItem | null> {
    try {
      const items = await this.getClothingItems();
      return items.find(item => item.id === itemId) || null;
    } catch (error) {
      console.error('Error getting clothing item by ID:', error);
      return null;
    }
  }

  static async updateClothingItemAvailability(itemId: string, isAvailable: boolean): Promise<boolean> {
    try {
      const items = await this.getClothingItems();
      const itemIndex = items.findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        items[itemIndex].isAvailable = isAvailable;
        await AsyncStorage.setItem(getUserStorageKey(STORAGE_KEYS.CLOTHING_ITEMS), JSON.stringify(items));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating item availability:', error);
      return false;
    }
  }

  // Outfits Management
  static async getOutfits(): Promise<Outfit[]> {
    try {
      const outfitsJson = await AsyncStorage.getItem(getUserStorageKey(STORAGE_KEYS.OUTFITS));
      if (outfitsJson) {
        const outfits = JSON.parse(outfitsJson);
        // Keep dates as strings since we changed the interface
        return outfits;
      }
      return [];
    } catch (error) {
      console.error('Error loading outfits:', error);
      return [];
    }
  }

  static async saveOutfit(outfit: Outfit): Promise<boolean> {
    try {
      const existingOutfits = await this.getOutfits();
      
      const existingIndex = existingOutfits.findIndex(existing => existing.id === outfit.id);
      
      if (existingIndex !== -1) {
        existingOutfits[existingIndex] = outfit;
      } else {
        existingOutfits.push(outfit);
      }

      await AsyncStorage.setItem(getUserStorageKey(STORAGE_KEYS.OUTFITS), JSON.stringify(existingOutfits));
      return true;
    } catch (error) {
      console.error('Error saving outfit:', error);
      return false;
    }
  }

  static async deleteOutfit(outfitId: string): Promise<boolean> {
    try {
      const existingOutfits = await this.getOutfits();
      const filteredOutfits = existingOutfits.filter(outfit => outfit.id !== outfitId);
      
      await AsyncStorage.setItem(getUserStorageKey(STORAGE_KEYS.OUTFITS), JSON.stringify(filteredOutfits));
      return true;
    } catch (error) {
      console.error('Error deleting outfit:', error);
      return false;
    }
  }

  // User Profile Management
  static async getUserProfile(): Promise<User | null> {
    try {
      const profileJson = await AsyncStorage.getItem(getUserStorageKey(STORAGE_KEYS.USER_PROFILE));
      return profileJson ? JSON.parse(profileJson) : null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  static async saveUserProfile(user: User): Promise<boolean> {
    try {
      await AsyncStorage.setItem(getUserStorageKey(STORAGE_KEYS.USER_PROFILE), JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  }

  // Simple Avatar Management
  static async getAvatarProfile(): Promise<SimpleAvatarProfile | null> {
    try {
      const avatarJson = await AsyncStorage.getItem(getUserStorageKey(STORAGE_KEYS.SIMPLE_AVATAR));
      return avatarJson ? JSON.parse(avatarJson) : null;
    } catch (error) {
      console.error('Error loading avatar profile:', error);
      return null;
    }
  }

  static async saveAvatarProfile(avatar: SimpleAvatarProfile): Promise<boolean> {
    try {
      await AsyncStorage.setItem(getUserStorageKey(STORAGE_KEYS.SIMPLE_AVATAR), JSON.stringify(avatar));
      return true;
    } catch (error) {
      console.error('Error saving avatar profile:', error);
      return false;
    }
  }

  // Clothing on Avatar Management
  static async getClothingOnAvatar(): Promise<ClothingOnAvatar[]> {
    try {
      const clothingJson = await AsyncStorage.getItem(getUserStorageKey(STORAGE_KEYS.CLOTHING_ON_AVATAR));
      return clothingJson ? JSON.parse(clothingJson) : [];
    } catch (error) {
      console.error('Error loading clothing on avatar:', error);
      return [];
    }
  }

  static async saveClothingOnAvatar(clothing: ClothingOnAvatar): Promise<boolean> {
    try {
      const existingClothing = await this.getClothingOnAvatar();
      const existingIndex = existingClothing.findIndex(existing => existing.id === clothing.id);
      
      if (existingIndex !== -1) {
        existingClothing[existingIndex] = clothing;
      } else {
        existingClothing.push(clothing);
      }

      await AsyncStorage.setItem(getUserStorageKey(STORAGE_KEYS.CLOTHING_ON_AVATAR), JSON.stringify(existingClothing));
      return true;
    } catch (error) {
      console.error('Error saving clothing on avatar:', error);
      return false;
    }
  }

  static async removeClothingOnAvatar(clothingItemId: string): Promise<boolean> {
    try {
      const existingClothing = await this.getClothingOnAvatar();
      const filteredClothing = existingClothing.filter(item => item.clothingItemId !== clothingItemId);
      
      await AsyncStorage.setItem(getUserStorageKey(STORAGE_KEYS.CLOTHING_ON_AVATAR), JSON.stringify(filteredClothing));
      return true;
    } catch (error) {
      console.error('Error removing clothing from avatar:', error);
      return false;
    }
  }

  // Statistics and Analytics
  static async getWardrobeStats(): Promise<{
    totalItems: number;
    totalOutfits: number;
    itemsByCategory: { [key: string]: number };
    itemsByColor: { [key: string]: number };
    recentlyAdded: ClothingItem[];
  }> {
    try {
      const items = await this.getClothingItems();
      const outfits = await this.getOutfits();

      // Calculate statistics
      const itemsByCategory: { [key: string]: number } = {};
      const itemsByColor: { [key: string]: number } = {};

      items.forEach(item => {
        // Count by category
        itemsByCategory[item.category] = (itemsByCategory[item.category] || 0) + 1;
        
        // Count by color
        item.colors.forEach(color => {
          itemsByColor[color] = (itemsByColor[color] || 0) + 1;
        });
      });

      // Get recently added items (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentlyAdded = items
        .filter(item => {
          const itemDate = new Date(item.dateAdded);
          return itemDate > sevenDaysAgo;
        })
        .sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);

      return {
        totalItems: items.length,
        totalOutfits: outfits.length,
        itemsByCategory,
        itemsByColor,
        recentlyAdded
      };
    } catch (error) {
      console.error('Error calculating wardrobe stats:', error);
      return {
        totalItems: 0,
        totalOutfits: 0,
        itemsByCategory: {},
        itemsByColor: {},
        recentlyAdded: []
      };
    }
  }

  // Search and Filter
  static async searchClothingItems(query: string): Promise<(ClothingItem | SharedClothingItem)[]> {
    try {
      const items = await this.getClothingItems();
      const lowercaseQuery = query.toLowerCase();
      
      return items.filter(item =>
        item.name.toLowerCase().includes(lowercaseQuery) ||
        item.category.toLowerCase().includes(lowercaseQuery) ||
        item.subcategory.toLowerCase().includes(lowercaseQuery) ||
        item.brand?.toLowerCase().includes(lowercaseQuery) ||
        item.colors.some(color => color.toLowerCase().includes(lowercaseQuery)) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Error searching clothing items:', error);
      return [];
    }
  }

  static async filterClothingItems(filters: {
    category?: string;
    colors?: string[];
    seasons?: string[];
    occasions?: string[];
    brand?: string;
    isAvailable?: boolean;
  }): Promise<(ClothingItem | SharedClothingItem)[]> {
    try {
      const items = await this.getClothingItems();
      
      return items.filter(item => {
        if (filters.category && item.category !== filters.category) return false;
        if (filters.brand && item.brand !== filters.brand) return false;
        if (filters.isAvailable !== undefined && item.isAvailable !== filters.isAvailable) return false;
        
        if (filters.colors && filters.colors.length > 0) {
          const hasMatchingColor = filters.colors.some(color => 
            item.colors.some(itemColor => itemColor.toLowerCase() === color.toLowerCase())
          );
          if (!hasMatchingColor) return false;
        }
        
        if (filters.seasons && filters.seasons.length > 0) {
          const hasMatchingSeason = filters.seasons.some(season =>
            item.season.includes(season as any)
          );
          if (!hasMatchingSeason) return false;
        }
        
        if (filters.occasions && filters.occasions.length > 0) {
          const hasMatchingOccasion = filters.occasions.some(occasion =>
            item.occasion.includes(occasion as any)
          );
          if (!hasMatchingOccasion) return false;
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error filtering clothing items:', error);
      return [];
    }
  }

  // Utility methods
  static async clearAllData(): Promise<boolean> {
    try {
      const userStorageKeys = [
        getUserStorageKey(STORAGE_KEYS.CLOTHING_ITEMS),
        getUserStorageKey(STORAGE_KEYS.OUTFITS),
        getUserStorageKey(STORAGE_KEYS.USER_PROFILE),
        getUserStorageKey(STORAGE_KEYS.SIMPLE_AVATAR),
        getUserStorageKey(STORAGE_KEYS.CLOTHING_ON_AVATAR),
        getUserStorageKey(STORAGE_KEYS.APP_SETTINGS)
      ];
      
      for (const key of userStorageKeys) {
        await AsyncStorage.removeItem(key);
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  static async exportData(): Promise<string | null> {
    try {
      const items = await this.getClothingItems();
      const outfits = await this.getOutfits();
      const profile = await this.getUserProfile();
      
      const exportData = {
        items,
        outfits,
        profile,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }
}