import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  TextInput,
  Platform,
  Modal,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const GOVERNMENT_SCHEMES = [
  {
    id: "1",
    name: "PM Kisan Samman Nidhi (PM-KISAN)",
    ministry: "Ministry of Agriculture",
    category: "Financial Aid",
    icon: "rupee-sign",
    iconLib: "fa5",
    color: "#2E7D32",
    bgColor: "#E8F5E9",
    tagColor: "#4CAF50",
    benefit: "₹6,000 per year in 3 installments",
    eligibility: "Small & marginal farmers with cultivable land",
    description:
      "PM-KISAN provides income support of ₹6,000 per year to all landholder farmer families across India. The benefit is transferred directly to bank accounts in three equal installments of ₹2,000 each.",
    howToApply:
      "Register at the PM-KISAN portal or visit your nearest Common Service Center (CSC). Aadhaar and bank account are mandatory.",
    documents: ["Aadhaar Card", "Bank Account Details", "Land Records", "Mobile Number"],
    link: "https://pmkisan.gov.in",
    status: "Active",
  },
  {
    id: "2",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    ministry: "Ministry of Agriculture",
    category: "Crop Insurance",
    icon: "shield-alt",
    iconLib: "fa5",
    color: "#1565C0",
    bgColor: "#E3F2FD",
    tagColor: "#1976D2",
    benefit: "Coverage for crop loss due to natural calamities",
    eligibility: "All farmers growing notified crops",
    description:
      "PMFBY provides financial support to farmers suffering crop loss/damage due to unforeseen events like natural calamities, pests & diseases. Premium rates are very low — just 1.5% for rabi, 2% for kharif.",
    howToApply:
      "Apply through CSC centers, banks, or the PMFBY portal. Must apply before the last date of the respective season.",
    documents: ["Aadhaar", "Bank Passbook", "Land Record / Khasra-Khatauni", "Sowing Declaration"],
    link: "https://pmfby.gov.in",
    status: "Active",
  },
  {
    id: "3",
    name: "Pradhan Mantri Krishi Sinchai Yojana (PMKSY)",
    ministry: "Ministry of Jal Shakti",
    category: "Irrigation",
    icon: "water",
    iconLib: "ion",
    color: "#00838F",
    bgColor: "#E0F7FA",
    tagColor: "#00ACC1",
    benefit: "Up to 55% subsidy on micro-irrigation systems",
    eligibility: "All farmers, especially small & marginal farmers",
    description:
      "PMKSY focuses on 'Har Khet Ko Pani, More Crop Per Drop' — ensuring access to water to every agricultural field and improving water use efficiency through drip and sprinkler irrigation.",
    howToApply:
      "Apply via State Agriculture Department or the online portal. Subsidy credited after installation verification.",
    documents: ["Aadhaar", "Land Records", "Bank Account", "Farm Photo"],
    link: "https://pmksy.gov.in",
    status: "Active",
  },
  {
    id: "4",
    name: "Soil Health Card Scheme",
    ministry: "Ministry of Agriculture",
    category: "Soil & Nutrients",
    icon: "leaf-outline",
    iconLib: "ion",
    color: "#558B2F",
    bgColor: "#F9FBE7",
    tagColor: "#7CB342",
    benefit: "Free soil testing & fertilizer recommendations",
    eligibility: "All farmers",
    description:
      "Soil Health Cards are issued to farmers with crop-wise recommendations of nutrients/fertilizers required for the farm so as to improve productivity through judicious use of inputs.",
    howToApply:
      "Contact your local Krishi Vigyan Kendra (KVK) or Agriculture Extension Officer for a soil test. Results issued as a card.",
    documents: ["Aadhaar", "Land Records"],
    link: "https://soilhealth.dac.gov.in",
    status: "Active",
  },
  {
    id: "5",
    name: "Paramparagat Krishi Vikas Yojana (PKVY)",
    ministry: "Ministry of Agriculture",
    category: "Organic Farming",
    icon: "leaf",
    iconLib: "ion",
    color: "#6A1B9A",
    bgColor: "#F3E5F5",
    tagColor: "#8E24AA",
    benefit: "₹50,000 per hectare over 3 years for organic farming",
    eligibility: "Farmers forming clusters of 50 acres (20 hectare)",
    description:
      "PKVY promotes organic farming through cluster approach. Farmers receive support for organic input production, on-farm & off-farm inputs, value addition, and marketing of organic produce.",
    howToApply:
      "Form a group of farmers in your village and contact the State Agriculture Department to register as a cluster.",
    documents: ["Aadhaar", "Land Records", "Group Registration", "Bank Account"],
    link: "https://pgsindia-ncof.gov.in",
    status: "Active",
  },
  {
    id: "6",
    name: "Kisan Credit Card (KCC) Scheme",
    ministry: "Ministry of Finance",
    category: "Credit & Loans",
    icon: "card-outline",
    iconLib: "ion",
    color: "#E65100",
    bgColor: "#FFF3E0",
    tagColor: "#FB8C00",
    benefit: "Short-term crop loans at 4% interest p.a.",
    eligibility: "Individual/JLG farmers, tenants, oral lessees",
    description:
      "KCC provides farmers timely credit for crop cultivation, post-harvest expenses, and allied activities at highly subsidized interest rates. Credit limit is based on land holdings and crop pattern.",
    howToApply:
      "Apply at any nationalized bank, cooperative bank, or Regional Rural Bank (RRB) with land and identity documents.",
    documents: ["Aadhaar", "PAN Card", "Land Records", "Bank Statement", "Passport Photo"],
    link: "https://www.nabard.org/content.aspx?id=572",
    status: "Active",
  },
  {
    id: "7",
    name: "National Food Security Mission (NFSM)",
    ministry: "Ministry of Agriculture",
    category: "Food Security",
    icon: "basket-outline",
    iconLib: "ion",
    color: "#F57F17",
    bgColor: "#FFF8E1",
    tagColor: "#FBC02D",
    benefit: "Subsidized seeds, fertilizers and training support",
    eligibility: "Farmers in notified districts growing rice, wheat, pulses, coarse grains",
    description:
      "NFSM aims to increase production of rice, wheat, pulses and coarse cereals through area expansion and productivity enhancement. Farmers receive quality seeds, demonstrations, and training.",
    howToApply:
      "Contact your local Block Agriculture Officer or visit the State NFSM implementation committee office.",
    documents: ["Aadhaar", "Land Records", "Bank Account"],
    link: "https://nfsm.gov.in",
    status: "Active",
  },
  {
    id: "8",
    name: "Rashtriya Krishi Vikas Yojana (RKVY)",
    ministry: "Ministry of Agriculture",
    category: "Development",
    icon: "trending-up-outline",
    iconLib: "ion",
    color: "#880E4F",
    bgColor: "#FCE4EC",
    tagColor: "#C2185B",
    benefit: "Infrastructure development & agri-business support",
    eligibility: "Farmers, FPOs, State Agri Departments",
    description:
      "RKVY funds agricultural development including cold storage, warehousing, food processing, marketing infrastructure, and capacity building for farmers and FPOs.",
    howToApply:
      "Apply via State Agriculture Department. Projects are approved by SLSC (State Level Sanctioning Committee).",
    documents: ["Project Proposal", "Land Records", "Business Plan", "Bank Details"],
    link: "https://rkvy.nic.in",
    status: "Active",
  },
];

const CATEGORIES = ["All", "Financial Aid", "Crop Insurance", "Irrigation", "Soil & Nutrients", "Organic Farming", "Credit & Loans", "Food Security", "Development"];

const iconLibraries = {
  fa5: ({ name, size, color }) => <FontAwesome5 name={name} size={size} color={color} />,
  ion: ({ name, size, color }) => <Ionicons name={name} size={size} color={color} />,
  mi: ({ name, size, color }) => <MaterialIcons name={name} size={size} color={color} />,
  mc: ({ name, size, color }) => <MaterialCommunityIcons name={name} size={size} color={color} />,
};

const DynamicIcon = ({ lib, name, size, color }) => {
  const IconComponent = iconLibraries[lib];
  return IconComponent ? <IconComponent name={name} size={size} color={color} /> : null;
};

const GovtSchemesScreen = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScheme, setSelectedScheme] = useState(null);

  const filteredSchemes = useMemo(() => {
    let result = GOVERNMENT_SCHEMES;
    if (selectedCategory !== "All") {
      result = result.filter((item) => item.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.benefit.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [selectedCategory, searchQuery]);

  const openLink = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  const renderSchemeCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.schemeCard, { borderLeftColor: item.color }]}
      activeOpacity={0.88}
      onPress={() => setSelectedScheme(item)}
    >
      <View style={styles.schemeCardTop}>
        <View style={[styles.schemeIconBox, { backgroundColor: item.bgColor }]}>
          <DynamicIcon lib={item.iconLib} name={item.icon} size={22} color={item.color} />
        </View>
        <View style={styles.schemeHeaderInfo}>
          <View style={[styles.tagBadge, { backgroundColor: item.bgColor }]}>
            <Text style={[styles.tagText, { color: item.tagColor }]}>{item.category}</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: "#4CAF50" }]} />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.schemeName} numberOfLines={2}>
        {item.name}
      </Text>

      <View style={styles.benefitRow}>
        <Ionicons name="gift-outline" size={14} color="#4CAF50" />
        <Text style={styles.benefitText} numberOfLines={1}>
          {item.benefit}
        </Text>
      </View>

      <Text style={styles.schemeDesc} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardFooterRow}>
        <View style={styles.ministryRow}>
          <Ionicons name="business-outline" size={12} color="#4CAF50" />
          <Text style={styles.ministryText} numberOfLines={1}>
            {item.ministry}
          </Text>
        </View>
        <View style={styles.detailsBtn}>
          <Text style={styles.detailsBtnText}>View Details</Text>
          <Ionicons name="chevron-forward" size={13} color="#2E7D32" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <FontAwesome5 name="university" size={18} color="#1B5E20" />
          <Text style={styles.headerTitle}>Government Schemes</Text>
        </View>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      {/* Banner */}
      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerTitle}>Sarkari Yojanaen</Text>
          <Text style={styles.bannerSubtitle}>{GOVERNMENT_SCHEMES.length} schemes available for farmers</Text>
        </View>
        <View style={styles.bannerEmoji}>
          <Text style={{ fontSize: 30 }}>🌾</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#666" style={{ marginLeft: 12 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search schemes, benefits..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} style={{ paddingRight: 12 }}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? "s" : ""} found</Text>
      </View>

      {/* Schemes List */}
      <FlatList
        data={filteredSchemes}
        keyExtractor={(item) => item.id}
        renderItem={renderSchemeCard}
        contentContainerStyle={styles.schemeList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="university" size={55} color="#C8E6C9" />
            <Text style={styles.emptyText}>No schemes found</Text>
            <Text style={styles.emptySubText}>Try a different search or category</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      {selectedScheme && (
        <Modal
          visible={!!selectedScheme}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedScheme(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Modal Header */}
              <View style={[styles.modalHeader, { backgroundColor: selectedScheme.color }]}>
                <View style={styles.modalHeaderContent}>
                  <View style={styles.modalIconBox}>
                    <DynamicIcon lib={selectedScheme.iconLib} name={selectedScheme.icon} size={26} color={selectedScheme.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>{selectedScheme.name}</Text>
                    <Text style={styles.modalMinistry}>{selectedScheme.ministry}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedScheme(null)}>
                  <Ionicons name="close" size={22} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Benefit */}
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Ionicons name="gift-outline" size={18} color="#4CAF50" />
                    <Text style={styles.modalSectionTitle}>Benefit</Text>
                  </View>
                  <View style={[styles.benefitBox, { backgroundColor: selectedScheme.bgColor }]}>
                    <Text style={[styles.benefitBoxText, { color: selectedScheme.color }]}>
                      {selectedScheme.benefit}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Ionicons name="information-circle-outline" size={18} color="#4CAF50" />
                    <Text style={styles.modalSectionTitle}>About the Scheme</Text>
                  </View>
                  <Text style={styles.modalBodyText}>{selectedScheme.description}</Text>
                </View>

                {/* Eligibility */}
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Ionicons name="people-outline" size={18} color="#4CAF50" />
                    <Text style={styles.modalSectionTitle}>Who is Eligible?</Text>
                  </View>
                  <View style={styles.eligibilityBox}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.eligibilityText}>{selectedScheme.eligibility}</Text>
                  </View>
                </View>

                {/* How to Apply */}
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Ionicons name="document-text-outline" size={18} color="#4CAF50" />
                    <Text style={styles.modalSectionTitle}>How to Apply</Text>
                  </View>
                  <Text style={styles.modalBodyText}>{selectedScheme.howToApply}</Text>
                </View>

                {/* Documents */}
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Ionicons name="folder-outline" size={18} color="#4CAF50" />
                    <Text style={styles.modalSectionTitle}>Required Documents</Text>
                  </View>
                  {selectedScheme.documents.map((doc, idx) => (
                    <View key={idx} style={styles.documentRow}>
                      <View style={styles.documentDot} />
                      <Text style={styles.documentText}>{doc}</Text>
                    </View>
                  ))}
                </View>

                {/* Apply Button */}
                <TouchableOpacity
                  style={[styles.applyButton, { backgroundColor: selectedScheme.color }]}
                  onPress={() => openLink(selectedScheme.link)}
                >
                  <Ionicons name="open-outline" size={18} color="#fff" />
                  <Text style={styles.applyButtonText}>Visit Official Website</Text>
                </TouchableOpacity>

                <View style={{ height: 30 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default GovtSchemesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F8F1",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop: Platform.OS === "ios" ? 0 : "14%",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#C8E6C9",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  backBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginLeft: 8,
  },
  banner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 16,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
  bannerSubtitle: {
    fontSize: 12,
    color: "#A5D6A7",
    marginTop: 2,
  },
  bannerEmoji: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 40,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#333",
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#555",
  },
  categoryChipTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  countRow: {
    paddingHorizontal: 18,
    marginBottom: 6,
  },
  countText: {
    fontSize: 13,
    color: "#888",
  },
  schemeList: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  schemeCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderLeftWidth: 4,
  },
  schemeCardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  schemeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  schemeHeaderInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "600",
  },
  schemeName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A2E1A",
    lineHeight: 21,
    marginBottom: 8,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#F1F8F1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  benefitText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E7D32",
    marginLeft: 6,
    flex: 1,
  },
  schemeDesc: {
    fontSize: 13,
    color: "#666",
    lineHeight: 19,
    marginBottom: 12,
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F8F1",
    paddingTop: 10,
  },
  ministryRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  ministryText: {
    fontSize: 11,
    color: "#888",
    marginLeft: 4,
    flex: 1,
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  detailsBtnText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
    marginRight: 2,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#A5D6A7",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#BCCCBC",
    marginTop: 6,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: "92%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 18,
    paddingRight: 14,
  },
  modalHeaderContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  modalIconBox: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 21,
    flex: 1,
  },
  modalMinistry: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  modalCloseBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 6,
    marginLeft: 8,
    marginTop: -2,
  },
  modalBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  modalSection: {
    marginBottom: 18,
  },
  modalSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A2E1A",
    marginLeft: 6,
  },
  modalBodyText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 21,
  },
  benefitBox: {
    borderRadius: 10,
    padding: 12,
  },
  benefitBoxText: {
    fontSize: 14,
    fontWeight: "700",
  },
  eligibilityBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F1F8F1",
    padding: 12,
    borderRadius: 10,
  },
  eligibilityText: {
    fontSize: 14,
    color: "#2E7D32",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  documentDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 10,
  },
  documentText: {
    fontSize: 14,
    color: "#444",
  },
  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 8,
    elevation: 2,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginLeft: 8,
  },
});
