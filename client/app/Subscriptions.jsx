import React, { useState } from 'react';
import {
 
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
// --- Configuration for Subscription Plans ---
// This could be fetched from an API in a real app.
const PLANS = [
  {
    id: 'basic_monthly',
    title: 'Basic',
    price: '₹249',
    period: '/month',
    features: [
      'Access to standard content',
      'Watch on one device at a time',
      'Standard Definition (SD)',
    ],
    isPopular: false,
  },
  {
    id: 'premium_monthly',
    title: 'Premium',
    price: '₹599',
    period: '/month',
    features: [
      'Access to all content',
      'Watch on 4 devices at once',
      'Ultra HD (4K) available',
      'Download for offline viewing',
    ],
    isPopular: true,
  },
  {
    id: 'pro_yearly',
    title: 'Pro (Annual)',
    price: '₹5,999',
    period: '/year',
    features: [
      'All Premium features',
      'Save 20% with annual billing',
      'Priority customer support',
    ],
    isPopular: false,
  },
];

const BuySubscriptionsPage = () => {
  // State to keep track of the currently selected plan's ID
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1].id); // Default to the popular plan

  // --- Handler for the final subscribe button ---
  const handleSubscribe = () => {
    const plan = PLANS.find(p => p.id === selectedPlan);
    if (plan) {
      // In a real app, you would integrate with a payment gateway like
      // Stripe, Razorpay, or use in-app purchase APIs (RevenueCat).
      Alert.alert(
        'Subscription Confirmed',
        `You have subscribed to the ${plan.title} plan for ${plan.price}${plan.period}.`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* --- Header Section --- */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Upgrade Your Plan</Text>
          <Text style={styles.headerSubtitle}>
            Choose the plan that's right for you. Cancel anytime.
          </Text>
        </View>

        {/* --- Plans Section --- */}
        <View style={styles.plansWrapper}>
          {PLANS.map(plan => {
            const isSelected = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  isSelected && styles.selectedPlanCard, // Apply selected style
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {/* "Most Popular" Badge */}
                {plan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>Most Popular</Text>
                  </View>
                )}

                <Text style={styles.planTitle}>{plan.title}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>

                <View style={styles.featuresList}>
                  {plan.features.map((feature, index) => (
                    <Text key={index} style={styles.featureItem}>
                      ✓ {feature}
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* --- Footer / Action Button --- */}
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          disabled={!selectedPlan} // Disable button if no plan is selected
        >
          <Text style={styles.subscribeButtonText}>Continue with Subscription</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f9',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  plansWrapper: {
    gap: 16,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'relative', // For the popular badge
    overflow: 'hidden', // Ensures badge is clipped by borderRadius
  },
  selectedPlanCard: {
    borderColor: '#3b82f6', // A highlight color for selection
    backgroundColor: '#eff6ff',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 12,
  },
  popularBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  planPeriod: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 4,
    marginBottom: 4,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    fontSize: 15,
    color: '#475569',
  },
  subscribeButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BuySubscriptionsPage;