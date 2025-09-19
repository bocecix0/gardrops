import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  SubscriptionPlan, 
  SUBSCRIPTION_PLANS, 
  SubscriptionTier,
  SUBSCRIPTION_FEATURES 
} from '../types/subscription';
import { useSubscription } from '../hooks/useSubscription';

const { width } = Dimensions.get('window');

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const {
    currentSubscription,
    getCurrentTier,
    hasFeature,
    subscribe,
    cancelSubscription,
    updateSubscription,
    restoreSubscription,
    formatPrice,
    isLoading,
    error
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentTier = getCurrentTier();

  // Filter plans based on interval
  const filteredPlans = SUBSCRIPTION_PLANS.filter(plan => {
    if (plan.tier === SubscriptionTier.FREE) return true;
    return isYearly ? plan.interval === 'yearly' : plan.interval === 'monthly';
  });

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan.tier === currentTier && currentSubscription?.status === 'active') {
      return; // Already subscribed to this plan
    }

    setIsProcessing(true);
    setSelectedPlan(plan.id);

    try {
      let success = false;

      if (plan.tier === SubscriptionTier.FREE) {
        // Cancel current subscription
        success = await cancelSubscription();
        if (success) {
          Alert.alert(
            'Subscription Cancelled',
            'Your subscription has been cancelled. You can continue using free features.',
            [{ text: 'OK' }]
          );
        }
      } else if (currentTier === SubscriptionTier.FREE) {
        // Subscribe to paid plan
        success = await subscribe(plan.id);
        if (success) {
          Alert.alert(
            'Welcome to ' + plan.name + '! 🎉',
            'Your subscription is now active. Enjoy your new features!',
            [{ text: 'Great!' }]
          );
        }
      } else {
        // Update existing subscription
        success = await updateSubscription(plan.id);
        if (success) {
          Alert.alert(
            'Subscription Updated',
            `You've successfully switched to ${plan.name}.`,
            [{ text: 'OK' }]
          );
        }
      }

      if (!success && error) {
        Alert.alert('Error', error);
      }
    } catch (err) {
      console.error('Subscription action error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    try {
      const success = await restoreSubscription();
      if (success) {
        Alert.alert(
          'Subscription Restored',
          'Your subscription has been restored successfully.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'No Subscription Found',
          'No active subscription was found to restore.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to restore subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderFeaturesList = (features: string[]) => (
    <View style={styles.featuresList}>
      {features.map((feature, index) => (
        <View key={index} style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}
    </View>
  );

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isCurrentPlan = plan.tier === currentTier && currentSubscription?.status === 'active';
    const isSelected = selectedPlan === plan.id;
    const isFree = plan.tier === SubscriptionTier.FREE;
    const isProcessingThis = isProcessing && isSelected;

    // Calculate savings for yearly plans
    const monthlySavings = plan.discountPercent ? 
      `Save ${plan.discountPercent}%` : null;

    return (
      <View
        key={plan.id}
        style={[
          styles.planCard,
          isCurrentPlan && styles.currentPlanCard,
          plan.isPopular && !isCurrentPlan && styles.popularPlanCard
        ]}
      >
        {plan.isPopular && !isCurrentPlan && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>Most Popular</Text>
          </View>
        )}

        {isCurrentPlan && (
          <View style={styles.currentBadge}>
            <Ionicons name="checkmark-circle" size={16} color="white" />
            <Text style={styles.currentBadgeText}>Current Plan</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            {isFree ? (
              <Text style={styles.priceText}>Free</Text>
            ) : (
              <>
                <Text style={styles.priceText}>
                  {formatPrice(plan.price, plan.currency)}
                </Text>
                <Text style={styles.priceInterval}>/{plan.interval}</Text>
                {monthlySavings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>{monthlySavings}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {renderFeaturesList(plan.features)}

        <TouchableOpacity
          style={[
            styles.subscribeButton,
            isCurrentPlan && styles.currentPlanButton,
            (isProcessingThis) && styles.loadingButton,
            isFree && !isCurrentPlan && styles.downgradeButton
          ]}
          onPress={() => handleSubscribe(plan)}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          {isProcessingThis ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={[
                styles.subscribeButtonText,
                isCurrentPlan && styles.currentPlanButtonText,
                isFree && !isCurrentPlan && styles.downgradeButtonText
              ]}>
                {isCurrentPlan 
                  ? 'Current Plan' 
                  : isFree 
                    ? 'Downgrade' 
                    : currentTier === SubscriptionTier.FREE 
                      ? 'Upgrade' 
                      : plan.tier > currentTier 
                        ? 'Upgrade' 
                        : 'Downgrade'
                }
              </Text>
              {!isCurrentPlan && (
                <Ionicons 
                  name="arrow-forward" 
                  size={16} 
                  color={
                    isFree && !isCurrentPlan 
                      ? "#EF4444" 
                      : isCurrentPlan 
                        ? "#6B7280" 
                        : "white"
                  } 
                />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Current Status */}
        {currentSubscription && (
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={styles.statusBadge}>
                <Ionicons 
                  name={currentSubscription.status === 'active' ? 'checkmark-circle' : 'alert-circle'} 
                  size={16} 
                  color={currentSubscription.status === 'active' ? '#10B981' : '#F59E0B'} 
                />
                <Text style={[
                  styles.statusText,
                  { color: currentSubscription.status === 'active' ? '#10B981' : '#F59E0B' }
                ]}>
                  {currentSubscription.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.tierText}>{currentTier.toUpperCase()}</Text>
            </View>
            {currentSubscription.tier !== SubscriptionTier.FREE && (
              <Text style={styles.renewalText}>
                {currentSubscription.autoRenew 
                  ? `Renews on ${new Date(currentSubscription.endDate).toLocaleDateString()}`
                  : `Expires on ${new Date(currentSubscription.endDate).toLocaleDateString()}`
                }
              </Text>
            )}
          </View>
        )}

        {/* Billing Toggle */}
        <View style={styles.billingToggle}>
          <Text style={[styles.toggleLabel, !isYearly && styles.activeToggleLabel]}>
            Monthly
          </Text>
          <Switch
            value={isYearly}
            onValueChange={setIsYearly}
            trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
            thumbColor={isYearly ? '#ffffff' : '#ffffff'}
            style={styles.switch}
          />
          <View style={styles.yearlyLabelContainer}>
            <Text style={[styles.toggleLabel, isYearly && styles.activeToggleLabel]}>
              Yearly
            </Text>
            <View style={styles.savingsBadgeSmall}>
              <Text style={styles.savingsTextSmall}>Save 17%</Text>
            </View>
          </View>
        </View>

        {/* Plans Grid */}
        <View style={styles.plansContainer}>
          {filteredPlans.map(renderPlanCard)}
        </View>

        {/* Features Comparison */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Feature Comparison</Text>
          <View style={styles.featuresTable}>
            {SUBSCRIPTION_FEATURES.map((feature) => (
              <View key={feature.id} style={styles.featureRow}>
                <View style={styles.featureInfo}>
                  <Ionicons name={feature.icon as any} size={20} color="#2563EB" />
                  <View style={styles.featureDescription}>
                    <Text style={styles.featureTitle}>{feature.name}</Text>
                    <Text style={styles.featureSubtitle}>{feature.description}</Text>
                  </View>
                </View>
                <View style={styles.featureTiers}>
                  <Text style={styles.requiredTierText}>
                    {feature.requiredTier.toUpperCase()}+
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.
          </Text>
          <TouchableOpacity style={styles.supportButton}>
            <Ionicons name="help-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.supportButtonText}>Need Help?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading subscription...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  restoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  statusCard: {
    margin: 24,
    marginBottom: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tierText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  renewalText: {
    fontSize: 12,
    color: '#6B7280',
  },
  billingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeToggleLabel: {
    color: '#111827',
    fontWeight: '600',
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  yearlyLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savingsBadgeSmall: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savingsTextSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
  },
  plansContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currentPlanCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  popularPlanCard: {
    borderColor: '#2563EB',
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  currentBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  planHeader: {
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2563EB',
  },
  priceInterval: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  savingsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  featuresList: {
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  subscribeButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  currentPlanButton: {
    backgroundColor: '#6B7280',
  },
  downgradeButton: {
    backgroundColor: '#EF4444',
  },
  loadingButton: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  currentPlanButtonText: {
    color: 'white',
  },
  downgradeButtonText: {
    color: 'white',
  },
  featuresSection: {
    padding: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  featuresTable: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  featureDescription: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  featureTiers: {
    alignItems: 'flex-end',
  },
  requiredTierText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});