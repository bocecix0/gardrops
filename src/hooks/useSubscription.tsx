import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserSubscription, 
  SubscriptionPlan, 
  SubscriptionTier,
  SubscriptionStatus,
  SubscriptionLimits,
  SUBSCRIPTION_PLANS 
} from '../types/subscription';
import { stripeService, SubscriptionAPI } from '../services/stripeService';

const SUBSCRIPTION_STORAGE_KEY = 'user_subscription';
const STRIPE_CUSTOMER_KEY = 'stripe_customer_id';

interface SubscriptionContextType {
  // State
  currentSubscription: UserSubscription | null;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  getCurrentTier: () => SubscriptionTier;
  hasFeature: (feature: keyof SubscriptionLimits) => boolean;
  canAddClothingItem: (currentCount: number) => boolean;
  canCreateAvatar: (currentCount: number) => boolean;
  canCreateOutfit: (currentCount: number) => boolean;
  
  // Subscription management
  subscribe: (planId: string, email?: string) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  updateSubscription: (planId: string) => Promise<boolean>;
  restoreSubscription: () => Promise<boolean>;
  
  // Utility
  getPlanById: (planId: string) => SubscriptionPlan | undefined;
  getFeatureLimit: (feature: keyof SubscriptionLimits) => number | 'unlimited';
  formatPrice: (price: number, currency: string) => string;
  
  // Refresh
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export { SubscriptionContext };
export type { SubscriptionContextType };

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeSubscription();
  }, []);

  const initializeSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize Stripe
      const stripeConfig = {
        publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock',
        merchantId: 'LookSee',
        urlScheme: 'looksee'
      };
      
      await stripeService.initialize(stripeConfig);
      
      // Load existing subscription
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (stored) {
        const subscription = JSON.parse(stored) as UserSubscription;
        
        // Check if subscription is still valid
        if (new Date(subscription.endDate) > new Date() && subscription.status === SubscriptionStatus.ACTIVE) {
          setCurrentSubscription(subscription);
        } else {
          // Subscription expired, reset to free
          await setFreeSubscription();
        }
      } else {
        // No subscription found, set to free
        await setFreeSubscription();
      }
    } catch (err) {
      console.error('Failed to initialize subscription:', err);
      setError('Failed to load subscription data');
      await setFreeSubscription(); // Fallback to free
    } finally {
      setIsLoading(false);
    }
  };

  const setFreeSubscription = async () => {
    const freeSubscription = createFreeSubscription();
    setCurrentSubscription(freeSubscription);
    await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(freeSubscription));
  };

  const createFreeSubscription = (): UserSubscription => {
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
  };

  const getCurrentTier = (): SubscriptionTier => {
    return currentSubscription?.tier || SubscriptionTier.FREE;
  };

  const getPlanById = (planId: string): SubscriptionPlan | undefined => {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  };

  const getCurrentPlan = (): SubscriptionPlan | undefined => {
    if (!currentSubscription) return getPlanById('free');
    return getPlanById(currentSubscription.planId);
  };

  const hasFeature = (feature: keyof SubscriptionLimits): boolean => {
    const plan = getCurrentPlan();
    if (!plan) return false;
    
    const featureValue = plan.limits[feature];
    return featureValue === true || featureValue === 'unlimited';
  };

  const getFeatureLimit = (feature: keyof SubscriptionLimits): number | 'unlimited' => {
    const plan = getCurrentPlan();
    if (!plan) return 0;
    
    const limit = plan.limits[feature];
    if (typeof limit === 'boolean') {
      return limit ? 'unlimited' : 0;
    }
    return limit;
  };

  const canAddClothingItem = (currentCount: number): boolean => {
    const limit = getFeatureLimit('maxClothingItems');
    if (limit === 'unlimited') return true;
    return currentCount < (limit as number);
  };

  const canCreateAvatar = (currentCount: number): boolean => {
    const limit = getFeatureLimit('maxAvatars');
    if (limit === 'unlimited') return true;
    return currentCount < (limit as number);
  };

  const canCreateOutfit = (currentCount: number): boolean => {
    const limit = getFeatureLimit('maxOutfits');
    if (limit === 'unlimited') return true;
    return currentCount < (limit as number);
  };

  const subscribe = async (planId: string, email?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const plan = getPlanById(planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      if (plan.tier === SubscriptionTier.FREE) {
        // Downgrade to free
        await setFreeSubscription();
        return true;
      }

      // Get or create customer
      let customerId = await AsyncStorage.getItem(STRIPE_CUSTOMER_KEY);
      if (!customerId) {
        const customer = await stripeService.createCustomer(
          email || 'user@looksee.app',
          { app: 'looksee' }
        );
        
        if (!customer) {
          throw new Error('Failed to create customer');
        }
        
        customerId = customer.id;
        await AsyncStorage.setItem(STRIPE_CUSTOMER_KEY, customerId);
      }

      // Create payment intent
      const paymentIntent = await SubscriptionAPI.createPaymentIntent(
        Math.round(plan.price * 100), // Convert to cents
        plan.currency,
        customerId
      );

      // Create ephemeral key
      const ephemeralKey = await SubscriptionAPI.createCustomerEphemeralKey(customerId);

      // Initialize payment sheet
      const initResult = await stripeService.initPaymentSheet({
        merchantDisplayName: 'LookSee',
        customerId: customerId,
        customerEphemeralKeySecret: ephemeralKey.secret,
        paymentIntentClientSecret: paymentIntent.client_secret,
        allowsDelayedPaymentMethods: true
      });

      if (initResult.error) {
        throw new Error(initResult.error);
      }

      // Present payment sheet
      const paymentResult = await stripeService.presentPaymentSheet({
        merchantDisplayName: 'LookSee',
        customerId: customerId,
        customerEphemeralKeySecret: ephemeralKey.secret,
        paymentIntentClientSecret: paymentIntent.client_secret,
        allowsDelayedPaymentMethods: true
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error);
      }

      // Create subscription
      const subscription = await stripeService.createSubscription(
        customerId,
        plan.stripePriceId,
        plan.tier === SubscriptionTier.PREMIUM ? 7 : undefined // 7-day trial for premium
      );

      if (!subscription) {
        throw new Error('Failed to create subscription');
      }

      // Save subscription locally
      const userSubscription: UserSubscription = {
        id: subscription.id,
        userId: 'current_user',
        planId: plan.id,
        tier: plan.tier,
        status: subscription.status === 'trialing' ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
        startDate: new Date(subscription.current_period_start * 1000).toISOString(),
        endDate: new Date(subscription.current_period_end * 1000).toISOString(),
        autoRenew: !subscription.cancel_at_period_end,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : undefined
      };

      setCurrentSubscription(userSubscription);
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(userSubscription));

      return true;
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err instanceof Error ? err.message : 'Subscription failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    try {
      if (!currentSubscription?.stripeSubscriptionId) {
        await setFreeSubscription();
        return true;
      }

      setIsLoading(true);
      setError(null);

      const success = await stripeService.cancelSubscription(
        currentSubscription.stripeSubscriptionId,
        true // Cancel at period end
      );

      if (success) {
        const updatedSubscription = {
          ...currentSubscription,
          status: SubscriptionStatus.CANCELLED,
          autoRenew: false,
          cancelAtPeriodEnd: true
        };

        setCurrentSubscription(updatedSubscription);
        await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(updatedSubscription));
      }

      return success;
    } catch (err) {
      console.error('Cancel subscription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (planId: string): Promise<boolean> => {
    try {
      if (!currentSubscription?.stripeSubscriptionId) {
        return await subscribe(planId);
      }

      setIsLoading(true);
      setError(null);

      const plan = getPlanById(planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const updatedStripeSubscription = await stripeService.updateSubscription(
        currentSubscription.stripeSubscriptionId,
        plan.stripePriceId
      );

      if (!updatedStripeSubscription) {
        throw new Error('Failed to update subscription');
      }

      const updatedSubscription: UserSubscription = {
        ...currentSubscription,
        planId: plan.id,
        tier: plan.tier,
        currentPeriodStart: new Date(updatedStripeSubscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(updatedStripeSubscription.current_period_end * 1000).toISOString(),
      };

      setCurrentSubscription(updatedSubscription);
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(updatedSubscription));

      return true;
    } catch (err) {
      console.error('Update subscription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restoreSubscription = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const customerId = await AsyncStorage.getItem(STRIPE_CUSTOMER_KEY);
      if (!customerId) {
        throw new Error('No customer found');
      }

      // In a real app, you would fetch the customer's subscriptions from Stripe
      // and restore the active one
      
      console.log('Restoring subscription for customer:', customerId);
      
      // For now, just refresh the current subscription
      await refreshSubscription();
      
      return true;
    } catch (err) {
      console.error('Restore subscription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to restore subscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscription = async (): Promise<void> => {
    try {
      if (!currentSubscription?.stripeSubscriptionId) {
        return;
      }

      const subscription = await stripeService.getSubscription(currentSubscription.stripeSubscriptionId);
      
      if (subscription) {
        const plan = SUBSCRIPTION_PLANS.find(p => p.stripePriceId === subscription.items.data[0]?.price.id);
        
        if (plan) {
          const updatedSubscription: UserSubscription = {
            ...currentSubscription,
            planId: plan.id,
            tier: plan.tier,
            status: subscription.status === 'active' ? SubscriptionStatus.ACTIVE : 
                   subscription.status === 'canceled' ? SubscriptionStatus.CANCELLED :
                   subscription.status === 'trialing' ? SubscriptionStatus.TRIALING :
                   SubscriptionStatus.INACTIVE,
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            autoRenew: !subscription.cancel_at_period_end
          };

          setCurrentSubscription(updatedSubscription);
          await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(updatedSubscription));
        }
      }
    } catch (err) {
      console.error('Refresh subscription error:', err);
    }
  };

  const formatPrice = (price: number, currency: string): string => {
    return stripeService.formatPrice(price, currency);
  };

  const value: SubscriptionContextType = {
    currentSubscription,
    isLoading,
    error,
    getCurrentTier,
    hasFeature,
    canAddClothingItem,
    canCreateAvatar,
    canCreateOutfit,
    subscribe,
    cancelSubscription,
    updateSubscription,
    restoreSubscription,
    getPlanById,
    getFeatureLimit,
    formatPrice,
    refreshSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}