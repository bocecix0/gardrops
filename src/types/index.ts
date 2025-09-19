// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  style: StylePreference[];
  colors: string[];
  brands: string[];
  bodyType: BodyType;
  occasions: Occasion[];
  personalizedAvatar?: PersonalizedAvatar;
}

// Clothing types
export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  subcategory: string;
  colors: string[];
  brand?: string;
  season: Season[];
  occasion: Occasion[];
  imageUri: string;
  tags: string[];
  isAvailable: boolean;
  dateAdded: string; // Changed from Date to string for serialization
}

export interface Outfit {
  id: string;
  name: string;
  items: ClothingItem[];
  occasion: Occasion;
  season: Season;
  rating?: number;
  isGenerated: boolean;
  dateCreated: string; // Changed from Date to string for serialization
  imageUri?: string;
}

// AI types
export interface OutfitSuggestion {
  outfit: Outfit;
  confidence: number;
  reasoning: string;
  alternatives: ClothingItem[][];
}

export interface AIRequest {
  userPreferences: UserPreferences;
  availableItems: ClothingItem[];
  occasion: Occasion;
  weather?: WeatherInfo;
  constraints?: string[];
}

// Enums
export enum ClothingCategory {
  TOP = 'top',
  BOTTOM = 'bottom',
  SHOES = 'shoes',
  ACCESSORIES = 'accessories',
  OUTERWEAR = 'outerwear',
  UNDERWEAR = 'underwear',
  DRESS = 'dress'
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter'
}

export enum Occasion {
  CASUAL = 'casual',
  BUSINESS = 'business',
  FORMAL = 'formal',
  PARTY = 'party',
  SPORTS = 'sports',
  TRAVEL = 'travel',
  DATE = 'date',
  VACATION = 'vacation'
}

export enum StylePreference {
  CASUAL = 'casual',
  CLASSIC = 'classic',
  TRENDY = 'trendy',
  BOHEMIAN = 'bohemian',
  MINIMALIST = 'minimalist',
  SPORTY = 'sporty',
  ELEGANT = 'elegant',
  EDGY = 'edgy'
}

export enum BodyType {
  HOURGLASS = 'hourglass',
  PEAR = 'pear',
  APPLE = 'apple',
  RECTANGLE = 'rectangle',
  INVERTED_TRIANGLE = 'inverted_triangle'
}

// Avatar and Physical Features
export interface AvatarFeatures {
  id: string;
  gender: 'male' | 'female' | 'non-binary';
  bodyType: BodyType;
  height: number; // in cm
  weight: number; // in kg
  skinTone: SkinTone;
  hairColor: HairColor;
  hairStyle: HairStyle;
  eyeColor: EyeColor;
  bodyShape: {
    shoulders: 'narrow' | 'average' | 'broad';
    waist: 'small' | 'average' | 'large';
    hips: 'narrow' | 'average' | 'wide';
    chest: 'small' | 'average' | 'large';
    legs: 'short' | 'average' | 'long';
  };
  faceShape: 'oval' | 'round' | 'square' | 'heart' | 'diamond';
  style: StylePreference[];
  // New measurements for better fit
  measurements: {
    bust: number; // cm
    waist: number; // cm  
    hips: number; // cm
    shoulderWidth: number; // cm
    armLength: number; // cm
    legLength: number; // cm
  };
}

export interface SimpleAvatarProfile {
  id: string;
  bodyType: BodyType;
  gender: 'male' | 'female';
  skinTone: SkinTone;
  baseImagePrompt: string; // AI prompt for base avatar
  dateCreated: string;
  isActive: boolean;
}

export interface ClothingOnAvatar {
  id: string;
  avatarId: string;
  clothingItemId: string;
  aiPrompt: string; // AI prompt with clothing layered on avatar
  layerOrder: number; // For proper layering of multiple items
  dateAdded: string;
  generatedImageUrl?: string;
  lastGenerated?: string;
}

export enum SkinTone {
  VERY_LIGHT = 'very_light',
  LIGHT = 'light',
  MEDIUM_LIGHT = 'medium_light',
  MEDIUM = 'medium',
  MEDIUM_DARK = 'medium_dark',
  DARK = 'dark',
  VERY_DARK = 'very_dark'
}

export enum HairColor {
  BLONDE = 'blonde',
  BROWN = 'brown',
  BLACK = 'black',
  RED = 'red',
  GRAY = 'gray',
  WHITE = 'white',
  COLORFUL = 'colorful'
}

export enum HairStyle {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
  CURLY = 'curly',
  STRAIGHT = 'straight',
  WAVY = 'wavy',
  BALD = 'bald'
}

export enum EyeColor {
  BROWN = 'brown',
  BLUE = 'blue',
  GREEN = 'green',
  HAZEL = 'hazel',
  GRAY = 'gray',
  AMBER = 'amber'
}

export interface PersonalizedAvatar {
  id: string;
  features: AvatarFeatures;
  basePrompt: string; // AI tarafından oluşturulan temel avatar prompt'u
  dateCreated: string;
  isActive: boolean;
}

// Weather types
export interface WeatherInfo {
  temperature: number;
  condition: string;
  humidity?: number;
  windSpeed?: number;
}

// Virtual Try-On types
export interface VirtualTryOnRequest {
  outfit: Outfit;
  avatar?: PersonalizedAvatar; // Kullanıcının kendi avatar'ı
  modelType?: ModelType; // Eğer avatar yoksa fallback
  bodyType?: BodyType; // Eğer avatar yoksa fallback
  pose?: PoseType;
  background?: BackgroundType;
}

export interface VirtualTryOnResult {
  imageUrl: string;
  confidence: number;
  processingTime: number;
  modelUsed: string;
}

export enum ModelType {
  CASUAL_MALE = 'casual_male',
  CASUAL_FEMALE = 'casual_female',
  BUSINESS_MALE = 'business_male',
  BUSINESS_FEMALE = 'business_female',
  FORMAL_MALE = 'formal_male',
  FORMAL_FEMALE = 'formal_female'
}

export enum PoseType {
  STANDING = 'standing',
  WALKING = 'walking',
  SITTING = 'sitting',
  CASUAL_POSE = 'casual_pose'
}

export enum BackgroundType {
  NEUTRAL = 'neutral',
  STUDIO = 'studio',
  OUTDOOR = 'outdoor',
  INDOOR = 'indoor',
  TRANSPARENT = 'transparent'
}

// Social types
export * from './social';

// Navigation types
export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  Wardrobe: undefined;
  Suggestions: { occasion?: Occasion };
  Profile: undefined;
  AddItem: undefined;
  ItemDetails: { itemId: string };
  OutfitDetails: { outfitId: string };
  VirtualTryOn: { outfit: Outfit };
  AvatarCreation: undefined;
  SimpleAvatarCreation: undefined;
  Subscription: undefined;
  SocialSharing: undefined;
  SharedItems: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};
