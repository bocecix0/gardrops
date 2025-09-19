import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSubscription, SubscriptionTier, SubscriptionStatus, SUBSCRIPTION_PLANS } from '../types/subscription';

const SUBSCRIPTION_STORAGE_KEY = 'user_subscription';

export class SubscriptionService {
  private static instance: SubscriptionService;
  private currentSubscription: UserSubscription | null = null;

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  async getCurrentSubscription(): Promise<UserSubscription | null> {
    if (this.currentSubscription) {
      return this.currentSubscription;
    }

    try {
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (stored) {
        this.currentSubscription = JSON.parse(stored);
        return this.currentSubscription;
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }

    // Return default free subscription
    return this.getDefaultFreeSubscription();
  }

  async updateSubscription(subscription: UserSubscription): Promise<boolean> {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription));
      this.currentSubscription = subscription;
      return true;
    } catch (error) {
      console.error('Error saving subscription:', error);
      return false;
    }
  }

  async cancelSubscription(): Promise<boolean> {
    try {
      if (this.currentSubscription) {
        this.currentSubscription.status = SubscriptionStatus.CANCELLED;
        this.currentSubscription.autoRenew = false;
        await this.updateSubscription(this.currentSubscription);
      }
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  }

  getCurrentTier(): SubscriptionTier {
    return this.currentSubscription?.tier || SubscriptionTier.FREE;
  }

  hasFeature(feature: keyof import('../types/subscription').SubscriptionLimits): boolean {
    const tier = this.getCurrentTier();
    const plan = SUBSCRIPTION_PLANS.find(p => p.tier === tier);
    
    if (!plan) return false;
    
    return plan.limits[feature] === true || plan.limits[feature] === 'unlimited';
  }

  canAddClothingItem(): boolean {
    const tier = this.getCurrentTier();
    const plan = SUBSCRIPTION_PLANS.find(p => p.tier === tier);
    
    if (!plan) return false;
    
    if (plan.limits.maxClothingItems === 'unlimited') {
      return true;
    }
    
    // Here you would check current count vs limit
    // For now, we'll assume it's allowed
    return true;
  }

  canCreateAvatar(): boolean {
    const tier = this.getCurrentTier();
    const plan = SUBSCRIPTION_PLANS.find(p => p.tier === tier);
    
    if (!plan) return false;
    
    if (plan.limits.maxAvatars === 'unlimited') {
      return true;
    }
    
    // Here you would check current avatar count vs limit
    // For now, we'll assume it's allowed for the first avatar
    return true;
  }

  private getDefaultFreeSubscription(): UserSubscription {
    const now = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 10); // Free never expires

    return {
      id: 'free_default',
      userId: 'current_user',
      planId: 'free',
      tier: SubscriptionTier.FREE,
      status: SubscriptionStatus.ACTIVE,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: false
    };
  }

  // Mock payment processing - in real app, integrate with Stripe, RevenueCat, etc.
  async processPayment(planId: string, paymentMethod: string): Promise<boolean> {
    try {
      // Simulate payment processing
      console.log(`Processing payment for plan ${planId} with method ${paymentMethod}`);
      
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) return false;

      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Monthly subscription

      const newSubscription: UserSubscription = {
        id: `sub_${Date.now()}`,
        userId: 'current_user',
        planId: plan.id,
        tier: plan.tier,
        status: SubscriptionStatus.ACTIVE,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        autoRenew: true,
        paymentMethod
      };

      await this.updateSubscription(newSubscription);
      return true;
    } catch (error) {
      console.error('Payment processing error:', error);
      return false;
    }
  }
}

export const subscriptionService = SubscriptionService.getInstance();