import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const PLANS = [
  {
    id: "kisan_free",
    title: "Kisan Basic",
    price: "₹0",
    period: "/month",
    badge: "Free Forever",
    badgeColor: "#757575",
    features: [
      "Standard daily weather forecast",
      "5 AI Crop Disease scans per month",
      "Mandi price access for your district",
      "Community forum participation",
    ],
    isPopular: false,
  },
  {
    id: "krishi_pro_monthly",
    title: "Krishi Pro",
    price: "₹199",
    period: "/month",
    badge: "MOST POPULAR",
    badgeColor: "#4CAF50",
    features: [
      "Unlimited 24/7 AI Agronomist Chatbot",
      "Unlimited instant Crop Disease & Pest scans",
      "Real-time micro-climate weather & rain alerts",
      "Direct interactive Live Sessions with experts",
      "Priority Soil Health Diagnosis reports",
    ],
    isPopular: true,
  },
  {
    id: "samriddhi_annual",
    title: "Samriddhi Annual",
    price: "₹1,499",
    period: "/year",
    badge: "SAVE 37%",
    badgeColor: "#FB8C00",
    features: [
      "All Krishi Pro features included",
      "Save ₹889 with annual billing",
      "Personalized Crop Yield Advisory & Fertilizer Calculator",
      "Govt Scheme & Subsidy Application assistance",
      "24/7 Priority Farmer Helpline & Voice Advice",
    ],
    isPopular: false,
  },
];

const BuySubscriptionsPage = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1].id);

  const handleSubscribe = () => {
    const plan = PLANS.find((p) => p.id === selectedPlan);
    if (plan) {
      if (plan.id === "kisan_free") {
        Alert.alert(
          "Current Active Plan",
          "You are currently on the Kisan Basic Free plan."
        );
        return;
      }

      Alert.alert(
        "Subscription Confirmed",
        `Welcome to ${plan.title}! You selected ${plan.price}${plan.period}.\nYour agricultural tools have been unlocked.`
      );
    }
  };

  const currentPlan = PLANS.find((p) => p.id === selectedPlan);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FBF8" />

      {/* Top Header Navigation */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Krishi Mittra Subscriptions</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Banner Section */}
        <View style={styles.bannerSection}>
          <View style={styles.badgeRow}>
            <FontAwesome5 name="seedling" size={18} color="#4CAF50" />
            <Text style={styles.bannerTag}>KRISHI MITTRA PRO</Text>
          </View>
          <Text style={styles.headerTitle}>Supercharge Your Crop Yield</Text>
          <Text style={styles.headerSubtitle}>
            Get unlimited AI crop advice, instant disease scanning, and live mandi insights.
          </Text>
        </View>

        {/* Plans Section */}
        <View style={styles.plansWrapper}>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  isSelected && styles.selectedPlanCard,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.9}
              >
                {/* Badge Header */}
                <View style={styles.cardHeaderRow}>
                  <Text
                    style={[
                      styles.planTitle,
                      isSelected && styles.selectedPlanTitle,
                    ]}
                  >
                    {plan.title}
                  </Text>

                  {plan.badge && (
                    <View
                      style={[
                        styles.badgePill,
                        { backgroundColor: plan.badgeColor },
                      ]}
                    >
                      <Text style={styles.badgePillText}>{plan.badge}</Text>
                    </View>
                  )}
                </View>

                {/* Price Display */}
                <View style={styles.priceContainer}>
                  <Text
                    style={[
                      styles.planPrice,
                      isSelected && styles.selectedPlanPrice,
                    ]}
                  >
                    {plan.price}
                  </Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>

                {/* Features List */}
                <View style={styles.featuresList}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={isSelected ? "#4CAF50" : "#81C784"}
                      />
                      <Text style={styles.featureItemText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {/* Radio selection indicator */}
                <View style={styles.radioIndicatorRow}>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text
                    style={[
                      styles.radioText,
                      isSelected && styles.radioTextSelected,
                    ]}
                  >
                    {isSelected ? "Selected Plan" : "Tap to Select Plan"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Security & Guarantee Footer */}
        <View style={styles.securityBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
          <Text style={styles.securityText}>
            100% Secure Checkout • Cancel or switch plan anytime
          </Text>
        </View>

        {/* Action Subscribe Button */}
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          activeOpacity={0.85}
        >
          <Feather name="lock" size={18} color="#FFFFFF" />
          <Text style={styles.subscribeButtonText}>
            {selectedPlan === "kisan_free"
              ? "Continue with Basic Free Plan"
              : `Unlock ${currentPlan?.title || "Plan"} (${currentPlan?.price}${currentPlan?.period})`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBF8",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F8E9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCEDC8",
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1B5E20",
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  bannerSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCEDC8",
    gap: 6,
    marginBottom: 8,
  },
  bannerTag: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2E7D32",
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2E7D32",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#666666",
    marginTop: 4,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  plansWrapper: {
    gap: 16,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#DCEDC8",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  selectedPlanCard: {
    borderColor: "#4CAF50",
    backgroundColor: "#F1F8E9",
    elevation: 5,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#333333",
  },
  selectedPlanTitle: {
    color: "#2E7D32",
  },
  badgePill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgePillText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 14,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: "800",
    color: "#212121",
  },
  selectedPlanPrice: {
    color: "#2E7D32",
  },
  planPeriod: {
    fontSize: 13,
    color: "#666666",
    marginLeft: 4,
    fontWeight: "600",
  },
  featuresList: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 14,
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  featureItemText: {
    flex: 1,
    fontSize: 13,
    color: "#424242",
    lineHeight: 18,
    fontWeight: "500",
  },
  radioIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E8F5E9",
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#BDBDBD",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: "#4CAF50",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
  radioText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#757575",
  },
  radioTextSelected: {
    color: "#2E7D32",
    fontWeight: "700",
  },
  securityBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
  },
  subscribeButton: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 8,
    elevation: 3,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  subscribeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});

export default BuySubscriptionsPage;