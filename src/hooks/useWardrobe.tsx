import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ClothingItem, Outfit, User, ClothingCategory, Season, Occasion, SimpleAvatarProfile, ClothingOnAvatar } from '../types';
import { StorageService } from '../services/storage';
import { SubscriptionContext } from './useSubscription';
import type { SubscriptionContextType } from './useSubscription';
import { SharedClothingItem } from '../types/social';

// State interface
interface WardrobeState {
  clothingItems: (ClothingItem | SharedClothingItem)[];
  outfits: Outfit[];
  userProfile: User | null;
  simpleAvatar: SimpleAvatarProfile | null;
  clothingOnAvatar: ClothingOnAvatar[];
  isLoading: boolean;
  error: string | null;
  stats: {
    totalItems: number;
    totalOutfits: number;
    itemsByCategory: { [key: string]: number };
    itemsByColor: { [key: string]: number };
    recentlyAdded: ClothingItem[];
  };
}

// Action types
type WardrobeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CLOTHING_ITEMS'; payload: (ClothingItem | SharedClothingItem)[] }
  | { type: 'ADD_CLOTHING_ITEM'; payload: ClothingItem | SharedClothingItem }
  | { type: 'UPDATE_CLOTHING_ITEM'; payload: ClothingItem | SharedClothingItem }
  | { type: 'DELETE_CLOTHING_ITEM'; payload: string }
  | { type: 'SET_OUTFITS'; payload: Outfit[] }
  | { type: 'ADD_OUTFIT'; payload: Outfit }
  | { type: 'UPDATE_OUTFIT'; payload: Outfit }
  | { type: 'DELETE_OUTFIT'; payload: string }
  | { type: 'SET_USER_PROFILE'; payload: User }
  | { type: 'SET_SIMPLE_AVATAR'; payload: SimpleAvatarProfile }
  | { type: 'ADD_CLOTHING_ON_AVATAR'; payload: ClothingOnAvatar }
  | { type: 'REMOVE_CLOTHING_ON_AVATAR'; payload: string }
  | { type: 'SET_STATS'; payload: WardrobeState['stats'] }
  | { type: 'RESET_WARDROBE' };

// Initial state
const initialState: WardrobeState = {
  clothingItems: [],
  outfits: [],
  userProfile: null,
  simpleAvatar: null,
  clothingOnAvatar: [],
  isLoading: false,
  error: null,
  stats: {
    totalItems: 0,
    totalOutfits: 0,
    itemsByCategory: {},
    itemsByColor: {},
    recentlyAdded: []
  }
};

// Reducer function
function wardrobeReducer(state: WardrobeState, action: WardrobeAction): WardrobeState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CLOTHING_ITEMS':
      return { ...state, clothingItems: action.payload, isLoading: false };
    
    case 'ADD_CLOTHING_ITEM':
      return {
        ...state,
        clothingItems: [...state.clothingItems, action.payload],
        isLoading: false
      };
    
    case 'UPDATE_CLOTHING_ITEM':
      return {
        ...state,
        clothingItems: state.clothingItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
        isLoading: false
      };
    
    case 'DELETE_CLOTHING_ITEM':
      return {
        ...state,
        clothingItems: state.clothingItems.filter(item => item.id !== action.payload),
        isLoading: false
      };
    
    case 'SET_OUTFITS':
      return { ...state, outfits: action.payload, isLoading: false };
    
    case 'ADD_OUTFIT':
      return {
        ...state,
        outfits: [...state.outfits, action.payload],
        isLoading: false
      };
    
    case 'UPDATE_OUTFIT':
      return {
        ...state,
        outfits: state.outfits.map(outfit =>
          outfit.id === action.payload.id ? action.payload : outfit
        ),
        isLoading: false
      };
    
    case 'DELETE_OUTFIT':
      return {
        ...state,
        outfits: state.outfits.filter(outfit => outfit.id !== action.payload),
        isLoading: false
      };
    
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload, isLoading: false };
    
    case 'SET_SIMPLE_AVATAR':
      return { ...state, simpleAvatar: action.payload, isLoading: false };
    
    case 'ADD_CLOTHING_ON_AVATAR':
      return {
        ...state,
        clothingOnAvatar: [...state.clothingOnAvatar, action.payload],
        isLoading: false
      };
    
    case 'REMOVE_CLOTHING_ON_AVATAR':
      return {
        ...state,
        clothingOnAvatar: state.clothingOnAvatar.filter(item => item.clothingItemId !== action.payload),
        isLoading: false
      };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    case 'RESET_WARDROBE':
      return initialState;
    
    default:
      return state;
  }
}

// Context interface
interface WardrobeContextType {
  state: WardrobeState;
  // Clothing Items
  loadClothingItems: () => Promise<void>;
  addClothingItem: (item: ClothingItem | SharedClothingItem) => Promise<boolean>;
  updateClothingItem: (item: ClothingItem | SharedClothingItem) => Promise<boolean>;
  deleteClothingItem: (itemId: string) => Promise<boolean>;
  getClothingItemById: (itemId: string) => ClothingItem | SharedClothingItem | null;
  searchClothingItems: (query: string) => Promise<(ClothingItem | SharedClothingItem)[]>;
  filterClothingItems: (filters: any) => Promise<(ClothingItem | SharedClothingItem)[]>;
  
  // Outfits
  loadOutfits: () => Promise<void>;
  addOutfit: (outfit: Outfit) => Promise<boolean>;
  updateOutfit: (outfit: Outfit) => Promise<boolean>;
  deleteOutfit: (outfitId: string) => Promise<boolean>;
  
  // User Profile
  loadUserProfile: () => Promise<void>;
  updateUserProfile: (user: User) => Promise<boolean>;
  
  // Simple Avatar
  addSimpleAvatar: (avatar: SimpleAvatarProfile) => Promise<boolean>;
  tryClothingOnAvatar: (clothingItemId: string) => Promise<string | null>;
  removeClothingFromAvatar: (clothingItemId: string) => Promise<boolean>;
  
  // Statistics
  refreshStats: () => Promise<void>;
  
  // Utility
  clearAllData: () => Promise<boolean>;
  exportData: () => Promise<string | null>;
}

// Create context
const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

// Provider component
interface WardrobeProviderProps {
  children: ReactNode;
}

export function WardrobeProvider({ children }: WardrobeProviderProps) {
  const [state, dispatch] = useReducer(wardrobeReducer, initialState);
  const subscriptionContext = useContext(SubscriptionContext);
  
  // Safely extract subscription functions with fallbacks
  const canAddClothingItem = subscriptionContext?.canAddClothingItem || ((count: number) => true);
  const canCreateAvatar = subscriptionContext?.canCreateAvatar || ((count: number) => true);
  const canCreateOutfit = subscriptionContext?.canCreateOutfit || ((count: number) => true);
  const hasFeature = subscriptionContext?.hasFeature || ((feature: keyof import('../types/subscription').SubscriptionLimits) => true);

  // Clothing Items functions
  const loadClothingItems = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const items = await StorageService.getClothingItems();
      dispatch({ type: 'SET_CLOTHING_ITEMS', payload: items });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load clothing items' });
    }
  };

  const addClothingItem = async (item: ClothingItem | SharedClothingItem): Promise<boolean> => {
    // Check subscription limits
    if (!canAddClothingItem(state.clothingItems.length)) {
      dispatch({ type: 'SET_ERROR', payload: 'You have reached the maximum number of clothing items for your subscription plan. Please upgrade to add more items.' });
      return false;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const success = await StorageService.saveClothingItem(item);
      if (success) {
        dispatch({ type: 'ADD_CLOTHING_ITEM', payload: item });
        await refreshStats(); // Update stats after adding
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save clothing item' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save clothing item' });
      return false;
    }
  };

  const updateClothingItem = async (item: ClothingItem | SharedClothingItem): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const success = await StorageService.saveClothingItem(item);
      if (success) {
        dispatch({ type: 'UPDATE_CLOTHING_ITEM', payload: item });
        await refreshStats();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update clothing item' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update clothing item' });
      return false;
    }
  };

  const deleteClothingItem = async (itemId: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const success = await StorageService.deleteClothingItem(itemId);
      if (success) {
        dispatch({ type: 'DELETE_CLOTHING_ITEM', payload: itemId });
        await refreshStats();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete clothing item' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete clothing item' });
      return false;
    }
  };

  const getClothingItemById = (itemId: string): ClothingItem | SharedClothingItem | null => {
    return state.clothingItems.find(item => item.id === itemId) || null;
  };

  const searchClothingItems = async (query: string): Promise<(ClothingItem | SharedClothingItem)[]> => {
    try {
      return await StorageService.searchClothingItems(query);
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  };

  const filterClothingItems = async (filters: any): Promise<(ClothingItem | SharedClothingItem)[]> => {
    try {
      return await StorageService.filterClothingItems(filters);
    } catch (error) {
      console.error('Filter failed:', error);
      return [];
    }
  };

  // Outfit functions
  const loadOutfits = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const outfits = await StorageService.getOutfits();
      dispatch({ type: 'SET_OUTFITS', payload: outfits });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load outfits' });
    }
  };

  const addOutfit = async (outfit: Outfit): Promise<boolean> => {
    // Check subscription limits
    if (!canCreateOutfit(state.outfits.length)) {
      dispatch({ type: 'SET_ERROR', payload: 'You have reached the maximum number of outfits for your subscription plan. Please upgrade to create more outfits.' });
      return false;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const success = await StorageService.saveOutfit(outfit);
      if (success) {
        dispatch({ type: 'ADD_OUTFIT', payload: outfit });
        await refreshStats();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save outfit' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save outfit' });
      return false;
    }
  };

  const updateOutfit = async (outfit: Outfit): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const success = await StorageService.saveOutfit(outfit);
      if (success) {
        dispatch({ type: 'UPDATE_OUTFIT', payload: outfit });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update outfit' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update outfit' });
      return false;
    }
  };

  const deleteOutfit = async (outfitId: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const success = await StorageService.deleteOutfit(outfitId);
      if (success) {
        dispatch({ type: 'DELETE_OUTFIT', payload: outfitId });
        await refreshStats();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete outfit' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete outfit' });
      return false;
    }
  };

  // User Profile functions
  const loadUserProfile = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const profile = await StorageService.getUserProfile();
      if (profile) {
        dispatch({ type: 'SET_USER_PROFILE', payload: profile });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load user profile' });
    }
  };

  // Load avatar profile
  const loadAvatarProfile = async () => {
    try {
      const avatar = await StorageService.getAvatarProfile();
      if (avatar) {
        dispatch({ type: 'SET_SIMPLE_AVATAR', payload: avatar });
      }
      
      const clothingOnAvatar = await StorageService.getClothingOnAvatar();
      clothingOnAvatar.forEach(clothing => {
        dispatch({ type: 'ADD_CLOTHING_ON_AVATAR', payload: clothing });
      });
    } catch (error) {
      console.error('Failed to load avatar profile:', error);
    }
  };

  const updateUserProfile = async (user: User): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const success = await StorageService.saveUserProfile(user);
      if (success) {
        dispatch({ type: 'SET_USER_PROFILE', payload: user });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update user profile' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update user profile' });
      return false;
    }
  };

  // Simple Avatar functions
  const addSimpleAvatar = async (avatar: SimpleAvatarProfile): Promise<boolean> => {
    // Check subscription limits - for now, count existing avatar as 1 if exists
    const avatarCount = state.simpleAvatar ? 1 : 0;
    if (!canCreateAvatar(avatarCount)) {
      dispatch({ type: 'SET_ERROR', payload: 'You have reached the maximum number of avatars for your subscription plan. Please upgrade to create more avatars.' });
      return false;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const success = await StorageService.saveAvatarProfile(avatar);
      if (success) {
        dispatch({ type: 'SET_SIMPLE_AVATAR', payload: avatar });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save avatar profile' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save avatar profile' });
      return false;
    }
  };

  const tryClothingOnAvatar = async (clothingItemId: string): Promise<string | null> => {
    // Check if virtual try-on feature is available
    if (!hasFeature('virtualTryOn')) {
      dispatch({ type: 'SET_ERROR', payload: 'Virtual try-on is a premium feature. Please upgrade your subscription to use this feature.' });
      return null;
    }

    try {
      const clothingItem = getClothingItemById(clothingItemId);
      if (!clothingItem || !state.simpleAvatar) {
        return null;
      }

      // Generate AI prompt for clothing on avatar
      const clothingPrompt = generateClothingOnAvatarPrompt(state.simpleAvatar, clothingItem);
      
      // Create clothing on avatar object
      const clothingOnAvatar: ClothingOnAvatar = {
        id: `avatar_clothing_${Date.now()}`,
        clothingItemId: clothingItem.id,
        avatarId: state.simpleAvatar.id,
        aiPrompt: clothingPrompt,
        layerOrder: determineLayerOrder(clothingItem.category),
        dateAdded: new Date().toISOString()
      };

      dispatch({ type: 'ADD_CLOTHING_ON_AVATAR', payload: clothingOnAvatar });
      return clothingPrompt;
    } catch (error) {
      console.error('Failed to try clothing on avatar:', error);
      return null;
    }
  };

  const removeClothingFromAvatar = async (clothingItemId: string): Promise<boolean> => {
    try {
      dispatch({ type: 'REMOVE_CLOTHING_ON_AVATAR', payload: clothingItemId });
      return true;
    } catch (error) {
      console.error('Failed to remove clothing from avatar:', error);
      return false;
    }
  };

  // Helper function to generate clothing on avatar prompt
  const generateClothingOnAvatarPrompt = (avatar: SimpleAvatarProfile, clothingItem: ClothingItem | SharedClothingItem): string => {
    const basePrompt = avatar.baseImagePrompt;
    const clothingDescription = `${clothingItem.name} in ${clothingItem.colors.join(' and ')} color(s)`;
    
    // Determine clothing placement based on category
    let placementInstruction = '';
    switch (clothingItem.category) {
      case ClothingCategory.TOP:
        placementInstruction = 'wearing on upper body, fitted properly over the default underwear';
        break;
      case ClothingCategory.BOTTOM:
        placementInstruction = 'wearing on lower body, fitted properly over the default underwear';
        break;
      case ClothingCategory.DRESS:
        placementInstruction = 'wearing as a full dress, covering the torso and extending to appropriate length';
        break;
      case ClothingCategory.OUTERWEAR:
        placementInstruction = 'wearing as outer layer, properly fitted over any existing clothing';
        break;
      case ClothingCategory.SHOES:
        placementInstruction = 'wearing on feet, properly fitted and styled';
        break;
      case ClothingCategory.ACCESSORIES:
        placementInstruction = 'wearing as appropriate accessory, positioned naturally';
        break;
      default:
        placementInstruction = 'wearing appropriately positioned on the avatar';
    }

    return `${basePrompt}, now ${placementInstruction} a ${clothingDescription}. The clothing should fit naturally on the avatar's ${avatar.bodyType.toLowerCase()} body type, maintaining realistic proportions and layering. The avatar should remain in the same pose and setting, with only the specified clothing item added seamlessly to the existing outfit.`;
  };

  // Helper function to determine layer order for clothing
  const determineLayerOrder = (category: ClothingCategory): number => {
    switch (category) {
      case ClothingCategory.UNDERWEAR:
        return 1;
      case ClothingCategory.TOP:
      case ClothingCategory.BOTTOM:
        return 2;
      case ClothingCategory.DRESS:
        return 2;
      case ClothingCategory.OUTERWEAR:
        return 3;
      case ClothingCategory.SHOES:
        return 4;
      case ClothingCategory.ACCESSORIES:
        return 5;
      default:
        return 2;
    }
  };

  // Statistics function
  const refreshStats = async () => {
    try {
      const stats = await StorageService.getWardrobeStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  // Utility functions
  const clearAllData = async (): Promise<boolean> => {
    try {
      const success = await StorageService.clearAllData();
      if (success) {
        dispatch({ type: 'RESET_WARDROBE' });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to clear data:', error);
      return false;
    }
  };

  const exportData = async (): Promise<string | null> => {
    // Check if export feature is available
    if (!hasFeature('exportFeatures')) {
      dispatch({ type: 'SET_ERROR', payload: 'Data export is a premium feature. Please upgrade your subscription to use this feature.' });
      return null;
    }

    try {
      return await StorageService.exportData();
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  };

  // Add sample items for testing
  const addSampleItems = async () => {
    console.log('Adding sample clothing items for testing...');
    
    const sampleItems: ClothingItem[] = [
      {
        id: 'sample_1',
        name: 'Blue Cotton T-Shirt',
        category: ClothingCategory.TOP,
        subcategory: 't-shirt',
        colors: ['Blue'],
        brand: 'Sample Brand',
        season: [Season.SPRING, Season.SUMMER],
        occasion: [Occasion.CASUAL, Occasion.SPORTS],
        imageUri: '',
        tags: ['cotton', 'comfortable'],
        isAvailable: true,
        dateAdded: new Date().toISOString()
      },
      {
        id: 'sample_2',
        name: 'Black Jeans',
        category: ClothingCategory.BOTTOM,
        subcategory: 'jeans',
        colors: ['Black'],
        brand: 'Denim Co',
        season: [Season.SPRING, Season.FALL, Season.WINTER],
        occasion: [Occasion.CASUAL, Occasion.DATE],
        imageUri: '',
        tags: ['denim', 'classic'],
        isAvailable: true,
        dateAdded: new Date().toISOString()
      },
      {
        id: 'sample_3',
        name: 'White Sneakers',
        category: ClothingCategory.SHOES,
        subcategory: 'sneakers',
        colors: ['White'],
        brand: 'Sports Brand',
        season: [Season.SPRING, Season.SUMMER],
        occasion: [Occasion.CASUAL, Occasion.SPORTS],
        imageUri: '',
        tags: ['comfortable', 'athletic'],
        isAvailable: true,
        dateAdded: new Date().toISOString()
      },
      {
        id: 'sample_4',
        name: 'Navy Blazer',
        category: ClothingCategory.OUTERWEAR,
        subcategory: 'blazer',
        colors: ['Navy'],
        brand: 'Business Wear',
        season: [Season.SPRING, Season.FALL, Season.WINTER],
        occasion: [Occasion.BUSINESS, Occasion.FORMAL],
        imageUri: '',
        tags: ['formal', 'professional'],
        isAvailable: true,
        dateAdded: new Date().toISOString()
      },
      {
        id: 'sample_5',
        name: 'Red Summer Dress',
        category: ClothingCategory.DRESS,
        subcategory: 'summer dress',
        colors: ['Red'],
        brand: 'Fashion House',
        season: [Season.SPRING, Season.SUMMER],
        occasion: [Occasion.DATE, Occasion.PARTY],
        imageUri: '',
        tags: ['elegant', 'feminine'],
        isAvailable: true,
        dateAdded: new Date().toISOString()
      }
    ];

    // Add each sample item
    for (const item of sampleItems) {
      await StorageService.saveClothingItem(item);
    }

    // Reload clothing items to update state
    await loadClothingItems();
    console.log('Sample items added successfully!');
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        loadClothingItems(),
        loadOutfits(),
        loadUserProfile(),
        loadAvatarProfile()
      ]);
      await refreshStats();
      
      // Add sample items if wardrobe is empty
      if (state.clothingItems.length === 0) {
        await addSampleItems();
      }
    };

    loadInitialData();
  }, []);

  const contextValue: WardrobeContextType = {
    state,
    loadClothingItems,
    addClothingItem,
    updateClothingItem,
    deleteClothingItem,
    getClothingItemById,
    searchClothingItems,
    filterClothingItems,
    loadOutfits,
    addOutfit,
    updateOutfit,
    deleteOutfit,
    loadUserProfile,
    updateUserProfile,
    addSimpleAvatar,
    tryClothingOnAvatar,
    removeClothingFromAvatar,
    refreshStats,
    clearAllData,
    exportData
  };

  return (
    <WardrobeContext.Provider value={contextValue}>
      {children}
    </WardrobeContext.Provider>
  );
}

// Custom hook to use the wardrobe context
export function useWardrobe(): WardrobeContextType {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
}