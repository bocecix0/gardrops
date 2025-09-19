import { ClothingItem } from './index';

export interface SharedClothingItem extends ClothingItem {
  sharedFromUserId: string;
  sharedFromUserName: string;
  sharedDate: string;
  isReceived: boolean;
  originalItemId: string;
}

export interface ClothingShareRequest {
  itemId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  message?: string;
  sharedDate: string;
}

export interface ClothingShareResponse {
  requestId: string;
  itemId: string;
  fromUserId: string;
  toUserId: string;
  response: 'accepted' | 'declined' | 'pending';
  responseDate?: string;
}

export interface SocialConnection {
  userId: string;
  userName: string;
  avatar?: string;
  connectionStatus: 'pending' | 'accepted' | 'blocked';
  connectedDate: string;
}

export interface SocialActivity {
  id: string;
  type: 'share_sent' | 'share_received' | 'share_accepted' | 'share_declined' | 'try_on';
  userId: string;
  userName: string;
  relatedUserId?: string;
  relatedUserName?: string;
  itemId?: string;
  itemName?: string;
  date: string;
  message?: string;
}

export interface SocialSettings {
  allowIncomingShares: boolean;
  autoAcceptFromFriends: boolean;
  shareNotifications: boolean;
  publicProfile: boolean;
}

export interface FriendRecommendation {
  userId: string;
  userName: string;
  mutualFriends: number;
  commonInterests: string[];
  avatar?: string;
}

// Storage keys for social features
export const SOCIAL_STORAGE_KEYS = {
  SHARED_ITEMS: 'social_shared_clothing_items',
  SHARE_REQUESTS: 'social_share_requests',
  SHARE_RESPONSES: 'social_share_responses',
  SOCIAL_CONNECTIONS: 'social_connections',
  SOCIAL_ACTIVITY: 'social_activity',
  SOCIAL_SETTINGS: 'social_settings'
};