export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  PRO = 'pro'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due'
}

export interface SubscriptionLimits {
  maxAvatars: number | 'unlimited';
  maxClothingItems: number | 'unlimited';
  maxOutfits: number | 'unlimited';
  aiSuggestions: boolean;
  advancedFeatures: boolean;
  prioritySupport: boolean;
  exportFeatures: boolean;
  weatherIntegration: boolean;
  virtualTryOn: boolean;
  communityFeatures: boolean;
}

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  nameLocal: string; // Turkish name
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  stripeProductId: string;
  stripePriceId: string;
  features: string[];
  featuresLocal: string[]; // Turkish features
  limits: SubscriptionLimits;
  isPopular?: boolean;
  discountPercent?: number; // For yearly plans
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  paymentMethod?: string;
  trialEndsAt?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  nameLocal: string;
  description: string;
  descriptionLocal: string;
  icon: string;
  requiredTier: SubscriptionTier;
}

// Stripe specific types
export interface StripePrice {
  id: string;
  object: 'price';
  active: boolean;
  currency: string;
  metadata: { [key: string]: string };
  nickname?: string;
  product: string;
  recurring?: {
    interval: 'month' | 'year';
    interval_count: number;
  };
  type: 'one_time' | 'recurring';
  unit_amount: number;
}

export interface StripeProduct {
  id: string;
  object: 'product';
  active: boolean;
  name: string;
  description?: string;
  metadata: { [key: string]: string };
}

export interface StripeCustomer {
  id: string;
  object: 'customer';
  email?: string;
  metadata: { [key: string]: string };
}

export interface StripeSubscription {
  id: string;
  object: 'subscription';
  cancel_at_period_end: boolean;
  canceled_at?: number;
  current_period_end: number;
  current_period_start: number;
  customer: string;
  items: {
    data: Array<{
      id: string;
      price: StripePrice;
    }>;
  };
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  trial_end?: number;
  trial_start?: number;
}

// Predefined subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    tier: SubscriptionTier.FREE,
    name: 'Free',
    nameLocal: 'Ücretsiz',
    price: 0,
    currency: 'USD',
    interval: 'monthly',
    stripeProductId: '',
    stripePriceId: '',
    features: [
      'Basic avatar creation',
      'Up to 20 clothing items',
      'Basic outfit suggestions',
      'Manual clothing try-on'
    ],
    featuresLocal: [
      'Temel avatar oluşturma',
      '20 kıyafet parçasına kadar',
      'Temel kıyafet önerileri',
      'Manuel kıyafet deneme'
    ],
    limits: {
      maxAvatars: 1,
      maxClothingItems: 20,
      maxOutfits: 10,
      aiSuggestions: false,
      advancedFeatures: false,
      prioritySupport: false,
      exportFeatures: false,
      weatherIntegration: false,
      virtualTryOn: false,
      communityFeatures: false
    }
  },
  {
    id: 'premium_monthly',
    tier: SubscriptionTier.PREMIUM,
    name: 'Premium',
    nameLocal: 'Premium',
    price: 4.99,
    currency: 'USD',
    interval: 'monthly',
    stripeProductId: 'prod_premium',
    stripePriceId: 'price_premium_monthly',
    isPopular: true,
    features: [
      'Unlimited avatars',
      'Unlimited clothing items',
      'AI-powered outfit suggestions',
      'Weather-based recommendations',
      'Advanced avatar customization',
      'Outfit history & favorites',
      'Virtual try-on'
    ],
    featuresLocal: [
      'Sınırsız avatar',
      'Sınırsız kıyafet parçası',
      'AI destekli kıyafet önerileri',
      'Hava durumuna göre öneriler',
      'Gelişmiş avatar özelleştirme',
      'Kıyafet geçmişi ve favoriler',
      'Sanal deneme'
    ],
    limits: {
      maxAvatars: 'unlimited',
      maxClothingItems: 'unlimited',
      maxOutfits: 'unlimited',
      aiSuggestions: true,
      advancedFeatures: true,
      prioritySupport: false,
      exportFeatures: false,
      weatherIntegration: true,
      virtualTryOn: true,
      communityFeatures: false
    }
  },
  {
    id: 'premium_yearly',
    tier: SubscriptionTier.PREMIUM,
    name: 'Premium (Yearly)',
    nameLocal: 'Premium (Yıllık)',
    price: 49.99,
    currency: 'USD',
    interval: 'yearly',
    stripeProductId: 'prod_premium',
    stripePriceId: 'price_premium_yearly',
    discountPercent: 17, // Save $10 per year
    features: [
      'Everything in Premium Monthly',
      '2 months free per year',
      'Priority customer support'
    ],
    featuresLocal: [
      'Aylık Premium\'daki her şey',
      'Yılda 2 ay ücretsiz',
      'Öncelikli müşteri desteği'
    ],
    limits: {
      maxAvatars: 'unlimited',
      maxClothingItems: 'unlimited',
      maxOutfits: 'unlimited',
      aiSuggestions: true,
      advancedFeatures: true,
      prioritySupport: true,
      exportFeatures: false,
      weatherIntegration: true,
      virtualTryOn: true,
      communityFeatures: false
    }
  },
  {
    id: 'pro_monthly',
    tier: SubscriptionTier.PRO,
    name: 'Pro',
    nameLocal: 'Pro',
    price: 9.99,
    currency: 'USD',
    interval: 'monthly',
    stripeProductId: 'prod_pro',
    stripePriceId: 'price_pro_monthly',
    features: [
      'Everything in Premium',
      'AI-generated clothing visualizations',
      'Professional styling advice',
      'Seasonal wardrobe planning',
      'Brand recommendations',
      'Export outfit photos',
      'Priority support',
      'Community features'
    ],
    featuresLocal: [
      'Premium\'daki her şey',
      'AI destekli kıyafet görselleştirme',
      'Profesyonel stil tavsiyeleri',
      'Mevsimlik gardırop planlama',
      'Marka önerileri',
      'Kıyafet fotoğraflarını dışa aktar',
      'Öncelikli destek',
      'Topluluk özellikleri'
    ],
    limits: {
      maxAvatars: 'unlimited',
      maxClothingItems: 'unlimited',
      maxOutfits: 'unlimited',
      aiSuggestions: true,
      advancedFeatures: true,
      prioritySupport: true,
      exportFeatures: true,
      weatherIntegration: true,
      virtualTryOn: true,
      communityFeatures: true
    }
  },
  {
    id: 'pro_yearly',
    tier: SubscriptionTier.PRO,
    name: 'Pro (Yearly)',
    nameLocal: 'Pro (Yıllık)',
    price: 99.99,
    currency: 'USD',
    interval: 'yearly',
    stripeProductId: 'prod_pro',
    stripePriceId: 'price_pro_yearly',
    discountPercent: 17, // Save $20 per year
    features: [
      'Everything in Pro Monthly',
      '2 months free per year',
      'Early access to new features',
      'Personal styling consultation'
    ],
    featuresLocal: [
      'Aylık Pro\'daki her şey',
      'Yılda 2 ay ücretsiz',
      'Yeni özelliklere erken erişim',
      'Kişisel stil danışmanlığı'
    ],
    limits: {
      maxAvatars: 'unlimited',
      maxClothingItems: 'unlimited',
      maxOutfits: 'unlimited',
      aiSuggestions: true,
      advancedFeatures: true,
      prioritySupport: true,
      exportFeatures: true,
      weatherIntegration: true,
      virtualTryOn: true,
      communityFeatures: true
    }
  }
];

// Feature definitions
export const SUBSCRIPTION_FEATURES: SubscriptionFeature[] = [
  {
    id: 'unlimited_avatars',
    name: 'Unlimited Avatars',
    nameLocal: 'Sınırsız Avatar',
    description: 'Create multiple avatars for different body types and styles',
    descriptionLocal: 'Farklı vücut tipleri ve stiller için birden fazla avatar oluşturun',
    icon: 'person-add',
    requiredTier: SubscriptionTier.PREMIUM
  },
  {
    id: 'ai_suggestions',
    name: 'AI Outfit Suggestions',
    nameLocal: 'AI Kıyafet Önerileri',
    description: 'Get personalized outfit recommendations powered by AI',
    descriptionLocal: 'AI destekli kişiselleştirilmiş kıyafet önerileri alın',
    icon: 'bulb',
    requiredTier: SubscriptionTier.PREMIUM
  },
  {
    id: 'weather_integration',
    name: 'Weather Integration',
    nameLocal: 'Hava Durumu Entegrasyonu',
    description: 'Outfit suggestions based on weather conditions',
    descriptionLocal: 'Hava koşullarına göre kıyafet önerileri',
    icon: 'partly-sunny',
    requiredTier: SubscriptionTier.PREMIUM
  },
  {
    id: 'virtual_tryon',
    name: 'Virtual Try-On',
    nameLocal: 'Sanal Deneme',
    description: 'Try clothes on your avatar virtually',
    descriptionLocal: 'Kıyafetleri avatarınızda sanal olarak deneyin',
    icon: 'camera',
    requiredTier: SubscriptionTier.PREMIUM
  },
  {
    id: 'export_features',
    name: 'Export Features',
    nameLocal: 'Dışa Aktarma Özellikleri',
    description: 'Export and share your outfit photos',
    descriptionLocal: 'Kıyafet fotoğraflarınızı dışa aktarın ve paylaşın',
    icon: 'share',
    requiredTier: SubscriptionTier.PRO
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    nameLocal: 'Öncelikli Destek',
    description: 'Get faster response times for customer support',
    descriptionLocal: 'Müşteri desteği için daha hızlı yanıt süreleri',
    icon: 'headset',
    requiredTier: SubscriptionTier.PRO
  },
  {
    id: 'community_features',
    name: 'Community Features',
    nameLocal: 'Topluluk Özellikleri',
    description: 'Access community styling and outfit sharing',
    descriptionLocal: 'Topluluk stil ve kıyafet paylaşımına erişim',
    icon: 'people',
    requiredTier: SubscriptionTier.PRO
  }
];