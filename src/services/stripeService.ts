import { 
  SubscriptionPlan, 
  UserSubscription, 
  SubscriptionTier,
  SubscriptionStatus,
  SUBSCRIPTION_PLANS,
  StripeCustomer,
  StripeSubscription,
  StripePrice
} from '../types/subscription';

// Note: In a real app, you would use Stripe React Native SDK
// For now, we'll create a service that simulates Stripe integration
// You'll need to install: npm install @stripe/stripe-react-native

interface StripeConfig {
  publishableKey: string;
  merchantId?: string;
  urlScheme?: string;
}

interface PaymentSheetConfig {
  merchantDisplayName: string;
  customerId: string;
  customerEphemeralKeySecret: string;
  paymentIntentClientSecret: string;
  allowsDelayedPaymentMethods: boolean;
}

class StripeService {
  private static instance: StripeService;
  private isInitialized = false;
  private config: StripeConfig | null = null;

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  async initialize(config: StripeConfig): Promise<boolean> {
    try {
      this.config = config;
      // In real implementation:
      // await StripeProvider.initialize({
      //   publishableKey: config.publishableKey,
      //   merchantId: config.merchantId,
      //   urlScheme: config.urlScheme
      // });
      
      this.isInitialized = true;
      console.log('Stripe initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      return false;
    }
  }

  async createCustomer(email: string, metadata?: { [key: string]: string }): Promise<StripeCustomer | null> {
    try {
      // In real implementation, call your backend:
      // const response = await fetch('/api/stripe/customers', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, metadata })
      // });
      
      // Mock customer creation
      const customer: StripeCustomer = {
        id: `cus_${Date.now()}`,
        object: 'customer',
        email,
        metadata: metadata || {}
      };

      console.log('Customer created:', customer.id);
      return customer;
    } catch (error) {
      console.error('Failed to create customer:', error);
      return null;
    }
  }

  async createSubscription(
    customerId: string, 
    priceId: string,
    trialPeriodDays?: number
  ): Promise<StripeSubscription | null> {
    try {
      // In real implementation, call your backend:
      // const response = await fetch('/api/stripe/subscriptions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ customerId, priceId, trialPeriodDays })
      // });

      const now = Math.floor(Date.now() / 1000);
      const plan = SUBSCRIPTION_PLANS.find(p => p.stripePriceId === priceId);
      
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Mock subscription creation
      const subscription: StripeSubscription = {
        id: `sub_${Date.now()}`,
        object: 'subscription',
        cancel_at_period_end: false,
        current_period_start: now,
        current_period_end: plan.interval === 'yearly' 
          ? now + (365 * 24 * 60 * 60) // 1 year
          : now + (30 * 24 * 60 * 60), // 1 month
        customer: customerId,
        items: {
          data: [{
            id: `si_${Date.now()}`,
            price: {
              id: priceId,
              object: 'price',
              active: true,
              currency: plan.currency.toLowerCase(),
              metadata: {},
              product: plan.stripeProductId,
              recurring: {
                interval: plan.interval === 'yearly' ? 'year' : 'month',
                interval_count: 1
              },
              type: 'recurring',
              unit_amount: Math.round(plan.price * 100) // Convert to cents
            }
          }]
        },
        status: trialPeriodDays ? 'trialing' : 'active',
        trial_start: trialPeriodDays ? now : undefined,
        trial_end: trialPeriodDays ? now + (trialPeriodDays * 24 * 60 * 60) : undefined
      };

      console.log('Subscription created:', subscription.id);
      return subscription;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      return null;
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<boolean> {
    try {
      // In real implementation, call your backend:
      // const response = await fetch(`/api/stripe/subscriptions/${subscriptionId}`, {
      //   method: 'DELETE',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ cancel_at_period_end: cancelAtPeriodEnd })
      // });

      console.log(`Subscription ${subscriptionId} cancelled (at period end: ${cancelAtPeriodEnd})`);
      return true;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return false;
    }
  }

  async updateSubscription(
    subscriptionId: string, 
    newPriceId: string
  ): Promise<StripeSubscription | null> {
    try {
      // In real implementation, call your backend:
      // const response = await fetch(`/api/stripe/subscriptions/${subscriptionId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ priceId: newPriceId })
      // });

      const plan = SUBSCRIPTION_PLANS.find(p => p.stripePriceId === newPriceId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const now = Math.floor(Date.now() / 1000);
      
      // Mock subscription update
      const updatedSubscription: StripeSubscription = {
        id: subscriptionId,
        object: 'subscription',
        cancel_at_period_end: false,
        current_period_start: now,
        current_period_end: plan.interval === 'yearly' 
          ? now + (365 * 24 * 60 * 60)
          : now + (30 * 24 * 60 * 60),
        customer: `cus_${Date.now()}`,
        items: {
          data: [{
            id: `si_${Date.now()}`,
            price: {
              id: newPriceId,
              object: 'price',
              active: true,
              currency: plan.currency.toLowerCase(),
              metadata: {},
              product: plan.stripeProductId,
              recurring: {
                interval: plan.interval === 'yearly' ? 'year' : 'month',
                interval_count: 1
              },
              type: 'recurring',
              unit_amount: Math.round(plan.price * 100)
            }
          }]
        },
        status: 'active'
      };

      console.log('Subscription updated:', subscriptionId);
      return updatedSubscription;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      return null;
    }
  }

  async getSubscription(subscriptionId: string): Promise<StripeSubscription | null> {
    try {
      // In real implementation, call your backend:
      // const response = await fetch(`/api/stripe/subscriptions/${subscriptionId}`);
      
      console.log('Getting subscription:', subscriptionId);
      // For now, return null as this is just a mock
      return null;
    } catch (error) {
      console.error('Failed to get subscription:', error);
      return null;
    }
  }

  async getCustomer(customerId: string): Promise<StripeCustomer | null> {
    try {
      // In real implementation, call your backend:
      // const response = await fetch(`/api/stripe/customers/${customerId}`);
      
      console.log('Getting customer:', customerId);
      // For now, return null as this is just a mock
      return null;
    } catch (error) {
      console.error('Failed to get customer:', error);
      return null;
    }
  }

  async presentPaymentSheet(config: PaymentSheetConfig): Promise<{ error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Stripe not initialized');
      }

      // In real implementation:
      // const { error } = await presentPaymentSheet();
      // return { error: error?.message };

      // Simulate payment success
      console.log('Payment sheet presented and completed successfully');
      
      // Simulate a small delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {}; // Success
    } catch (error) {
      console.error('Payment sheet error:', error);
      return { error: 'Payment failed. Please try again.' };
    }
  }

  async initPaymentSheet(config: PaymentSheetConfig): Promise<{ error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Stripe not initialized');
      }

      // In real implementation:
      // const { error } = await initPaymentSheet({
      //   merchantDisplayName: config.merchantDisplayName,
      //   customerId: config.customerId,
      //   customerEphemeralKeySecret: config.customerEphemeralKeySecret,
      //   paymentIntentClientSecret: config.paymentIntentClientSecret,
      //   allowsDelayedPaymentMethods: config.allowsDelayedPaymentMethods
      // });

      console.log('Payment sheet initialized');
      return {}; // Success
    } catch (error) {
      console.error('Failed to init payment sheet:', error);
      return { error: 'Failed to initialize payment' };
    }
  }

  // Utility methods
  formatPrice(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  }

  calculateYearlyDiscount(monthlyPrice: number, yearlyPrice: number): number {
    const annualMonthly = monthlyPrice * 12;
    return Math.round(((annualMonthly - yearlyPrice) / annualMonthly) * 100);
  }

  isValidSubscriptionStatus(status: string): boolean {
    return ['active', 'trialing'].includes(status);
  }
}

export const stripeService = StripeService.getInstance();

// Backend API helpers (these would be actual API calls in production)
export class SubscriptionAPI {
  private static baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://your-api.com';

  static async createPaymentIntent(amount: number, currency: string, customerId: string) {
    // Call your backend to create payment intent
    // return fetch(`${this.baseUrl}/create-payment-intent`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ amount, currency, customerId })
    // });
    
    // Mock response
    return {
      client_secret: `pi_${Date.now()}_secret_mock`,
      id: `pi_${Date.now()}`
    };
  }

  static async createCustomerEphemeralKey(customerId: string) {
    // Call your backend to create ephemeral key
    // return fetch(`${this.baseUrl}/ephemeral-keys`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ customer: customerId })
    // });

    // Mock response
    return {
      secret: `ek_${Date.now()}_secret_mock`
    };
  }

  static async webhookHandler(event: any) {
    // Handle Stripe webhooks
    switch (event.type) {
      case 'customer.subscription.created':
        console.log('Subscription created:', event.data.object);
        break;
      case 'customer.subscription.updated':
        console.log('Subscription updated:', event.data.object);
        break;
      case 'customer.subscription.deleted':
        console.log('Subscription deleted:', event.data.object);
        break;
      case 'invoice.payment_succeeded':
        console.log('Payment succeeded:', event.data.object);
        break;
      case 'invoice.payment_failed':
        console.log('Payment failed:', event.data.object);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }
  }
}