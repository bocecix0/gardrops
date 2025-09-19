import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  SharedClothingItem, 
  ClothingShareRequest, 
  ClothingShareResponse, 
  SocialConnection,
  SocialActivity,
  SocialSettings,
  SOCIAL_STORAGE_KEYS
} from '../types/social';
import { ClothingItem } from '../types'; // Fixed import
import { generateUniqueId } from '../utils/clothingUtils';
import { StorageService } from './storage';

class SocialSharingService {
  private static instance: SocialSharingService;

  static getInstance(): SocialSharingService {
    if (!SocialSharingService.instance) {
      SocialSharingService.instance = new SocialSharingService();
    }
    return SocialSharingService.instance;
  }

  // Share a clothing item with a friend
  async shareClothingItem(
    item: ClothingItem,
    fromUserId: string,
    fromUserName: string,
    toUserId: string,
    toUserName: string,
    message?: string
  ): Promise<boolean> {
    try {
      // Create share request
      const shareRequest: ClothingShareRequest = {
        itemId: item.id,
        fromUserId,
        fromUserName,
        toUserId,
        toUserName,
        message,
        sharedDate: new Date().toISOString()
      };

      // Save share request
      const requests = await this.getShareRequests();
      requests.push(shareRequest);
      await AsyncStorage.setItem(
        SOCIAL_STORAGE_KEYS.SHARE_REQUESTS,
        JSON.stringify(requests)
      );

      // Log social activity
      await this.logActivity({
        id: generateUniqueId(),
        type: 'share_sent',
        userId: fromUserId,
        userName: fromUserName,
        relatedUserId: toUserId,
        relatedUserName: toUserName,
        itemId: item.id,
        itemName: item.name,
        date: new Date().toISOString(),
        message
      });

      return true;
    } catch (error) {
      console.error('Failed to share clothing item:', error);
      return false;
    }
  }

  // Accept a shared clothing item
  async acceptSharedItem(
    requestId: string,
    currentUser: { id: string; name: string }
  ): Promise<SharedClothingItem | null> {
    try {
      const requests = await this.getShareRequests();
      const request = requests.find(req => req.itemId === requestId);
      
      if (!request) {
        throw new Error('Share request not found');
      }

      // Get the original item
      const originalItem = await StorageService.getClothingItemById(request.itemId);
      if (!originalItem) {
        throw new Error('Original clothing item not found');
      }

      // Create shared item with metadata
      const sharedItem: SharedClothingItem = {
        ...originalItem,
        id: `shared_${generateUniqueId()}`,
        sharedFromUserId: request.fromUserId,
        sharedFromUserName: request.fromUserName,
        sharedDate: new Date().toISOString(),
        isReceived: true,
        originalItemId: originalItem.id
      };

      // Save shared item to user's wardrobe
      const success = await StorageService.saveClothingItem(sharedItem);
      if (!success) {
        throw new Error('Failed to save shared item');
      }

      // Update share request status
      const responses = await this.getShareResponses();
      const response: ClothingShareResponse = {
        requestId,
        itemId: request.itemId,
        fromUserId: request.fromUserId,
        toUserId: currentUser.id,
        response: 'accepted',
        responseDate: new Date().toISOString()
      };
      responses.push(response);
      await AsyncStorage.setItem(
        SOCIAL_STORAGE_KEYS.SHARE_RESPONSES,
        JSON.stringify(responses)
      );

      // Log social activity
      await this.logActivity({
        id: generateUniqueId(),
        type: 'share_accepted',
        userId: currentUser.id,
        userName: currentUser.name,
        relatedUserId: request.fromUserId,
        relatedUserName: request.fromUserName,
        itemId: sharedItem.id,
        itemName: sharedItem.name,
        date: new Date().toISOString()
      });

      return sharedItem;
    } catch (error) {
      console.error('Failed to accept shared item:', error);
      return null;
    }
  }

  // Decline a shared clothing item
  async declineSharedItem(
    requestId: string,
    currentUser: { id: string; name: string }
  ): Promise<boolean> {
    try {
      const requests = await this.getShareRequests();
      const request = requests.find(req => req.itemId === requestId);
      
      if (!request) {
        return false;
      }

      // Update share request status
      const responses = await this.getShareResponses();
      const response: ClothingShareResponse = {
        requestId,
        itemId: request.itemId,
        fromUserId: request.fromUserId,
        toUserId: currentUser.id,
        response: 'declined',
        responseDate: new Date().toISOString()
      };
      responses.push(response);
      await AsyncStorage.setItem(
        SOCIAL_STORAGE_KEYS.SHARE_RESPONSES,
        JSON.stringify(responses)
      );

      // Log social activity
      await this.logActivity({
        id: generateUniqueId(),
        type: 'share_declined',
        userId: currentUser.id,
        userName: currentUser.name,
        relatedUserId: request.fromUserId,
        relatedUserName: request.fromUserName,
        itemId: request.itemId,
        itemName: 'Shared Item',
        date: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Failed to decline shared item:', error);
      return false;
    }
  }

  // Get pending share requests for a user
  async getPendingShareRequests(userId: string): Promise<ClothingShareRequest[]> {
    try {
      const requests = await this.getShareRequests();
      return requests.filter(req => req.toUserId === userId);
    } catch (error) {
      console.error('Failed to get pending share requests:', error);
      return [];
    }
  }

  // Get shared items for a user
  async getSharedItems(userId: string): Promise<SharedClothingItem[]> {
    try {
      const allItems = await StorageService.getClothingItems();
      // Fixed type checking for shared items
      return allItems.filter(item => 
        (item as SharedClothingItem).sharedFromUserId !== undefined
      ) as SharedClothingItem[];
    } catch (error) {
      console.error('Failed to get shared items:', error);
      return [];
    }
  }

  // Add friend/connection
  async addConnection(
    currentUserId: string,
    currentUserName: string,
    friendUserId: string,
    friendUserName: string
  ): Promise<boolean> {
    try {
      const connections = await this.getConnections();
      
      // Check if connection already exists
      const existingConnection = connections.find(
        conn => conn.userId === friendUserId && conn.connectionStatus === 'accepted'
      );
      
      if (existingConnection) {
        return true; // Already connected
      }

      const newConnection: SocialConnection = {
        userId: friendUserId,
        userName: friendUserName,
        connectionStatus: 'pending',
        connectedDate: new Date().toISOString()
      };

      connections.push(newConnection);
      await AsyncStorage.setItem(
        SOCIAL_STORAGE_KEYS.SOCIAL_CONNECTIONS,
        JSON.stringify(connections)
      );

      return true;
    } catch (error) {
      console.error('Failed to add connection:', error);
      return false;
    }
  }

  // Accept friend request
  async acceptConnection(
    currentUserId: string,
    currentUserName: string,
    friendUserId: string
  ): Promise<boolean> {
    try {
      const connections = await this.getConnections();
      const connection = connections.find(conn => conn.userId === friendUserId);
      
      if (connection) {
        connection.connectionStatus = 'accepted';
        connection.connectedDate = new Date().toISOString();
        
        await AsyncStorage.setItem(
          SOCIAL_STORAGE_KEYS.SOCIAL_CONNECTIONS,
          JSON.stringify(connections)
        );
        
        // Log social activity
        await this.logActivity({
          id: generateUniqueId(),
          type: 'share_accepted',
          userId: currentUserId,
          userName: currentUserName,
          relatedUserId: friendUserId,
          relatedUserName: connection.userName,
          date: new Date().toISOString()
        });

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to accept connection:', error);
      return false;
    }
  }

  // Get user's social connections
  async getConnections(): Promise<SocialConnection[]> {
    try {
      const stored = await AsyncStorage.getItem(SOCIAL_STORAGE_KEYS.SOCIAL_CONNECTIONS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get connections:', error);
      return [];
    }
  }

  // Log social activity
  async logActivity(activity: SocialActivity): Promise<boolean> {
    try {
      const activities = await this.getSocialActivity();
      activities.push(activity);
      
      // Keep only the last 100 activities to prevent storage bloat
      if (activities.length > 100) {
        activities.splice(0, activities.length - 100);
      }
      
      await AsyncStorage.setItem(
        SOCIAL_STORAGE_KEYS.SOCIAL_ACTIVITY,
        JSON.stringify(activities)
      );
      
      return true;
    } catch (error) {
      console.error('Failed to log social activity:', error);
      return false;
    }
  }

  // Get social activity feed
  async getSocialActivity(): Promise<SocialActivity[]> {
    try {
      const stored = await AsyncStorage.getItem(SOCIAL_STORAGE_KEYS.SOCIAL_ACTIVITY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get social activity:', error);
      return [];
    }
  }

  // Get social settings
  async getSocialSettings(): Promise<SocialSettings> {
    try {
      const stored = await AsyncStorage.getItem(SOCIAL_STORAGE_KEYS.SOCIAL_SETTINGS);
      return stored ? JSON.parse(stored) : {
        allowIncomingShares: true,
        autoAcceptFromFriends: false,
        shareNotifications: true,
        publicProfile: false
      };
    } catch (error) {
      console.error('Failed to get social settings:', error);
      return {
        allowIncomingShares: true,
        autoAcceptFromFriends: false,
        shareNotifications: true,
        publicProfile: false
      };
    }
  }

  // Update social settings
  async updateSocialSettings(settings: SocialSettings): Promise<boolean> {
    try {
      await AsyncStorage.setItem(
        SOCIAL_STORAGE_KEYS.SOCIAL_SETTINGS,
        JSON.stringify(settings)
      );
      return true;
    } catch (error) {
      console.error('Failed to update social settings:', error);
      return false;
    }
  }

  // Private helper methods
  private async getShareRequests(): Promise<ClothingShareRequest[]> {
    try {
      const stored = await AsyncStorage.getItem(SOCIAL_STORAGE_KEYS.SHARE_REQUESTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get share requests:', error);
      return [];
    }
  }

  private async getShareResponses(): Promise<ClothingShareResponse[]> {
    try {
      const stored = await AsyncStorage.getItem(SOCIAL_STORAGE_KEYS.SHARE_RESPONSES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get share responses:', error);
      return [];
    }
  }
}

export const socialSharingService = SocialSharingService.getInstance();