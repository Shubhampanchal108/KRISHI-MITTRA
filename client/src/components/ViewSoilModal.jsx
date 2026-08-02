import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome5, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { URL } from "../../App";

const SCREEN_WIDTH = Dimensions.get("window").width;

const ViewSoilModal = ({ visible, onClose, onEdit }) => {
  const [soilData, setSoilData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSoilData = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        try {
          const res = await axios.get(`${URL}/api/main/soil/get/user/${userId}`);
          if (res.data && !res.data.msg) {
            setSoilData(res.data);
            await AsyncStorage.setItem(`soilData_${userId}`, JSON.stringify(res.data));
            setLoading(false);
            return;
          }
        } catch (serverErr) {
          console.log("Server fetch failed, reading cache:", serverErr.message);
        }

        const cached = await AsyncStorage.getItem(`soilData_${userId}`);
        if (cached) {
          setSoilData(JSON.parse(cached));
        } else {
          setSoilData(null);
        }
      } else {
        setSoilData(null);
      }
    } catch (err) {
      console.error("Error fetching soil data for view modal:", err);
      setSoilData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchSoilData();
    }
  }, [visible, fetchSoilData]);

  // Helper to determine pH status
  const getPhInfo = (ph) => {
    if (!ph || isNaN(ph)) return { label: "Not Set", color: "#9E9E9E", desc: "No pH recorded" };
    const num = parseFloat(ph);
    if (num < 6.0) return { label: "Acidic", color: "#FF9800", desc: "Slightly low pH" };
    if (num <= 7.5) return { label: "Optimal (Neutral)", color: "#4CAF50", desc: "Ideal for most crops" };
    return { label: "Alkaline", color: "#2196F3", desc: "Slightly high pH" };
  };

  // Helper to estimate fertility state
  const getFertilityStatus = (data) => {
    if (!data) return { text: "No Data", color: "#757575", badge: "Unknown" };
    const { nitrogen, phosphorus, potassium } = data;
    if (nitrogen > 0 && phosphorus > 0 && potassium > 0) {
      return { text: "Rich Fertility", color: "#2E7D32", badge: "High Health" };
    }
    return { text: "Moderate Fertility", color: "#FB8C00", badge: "Needs Care" };
  };

  const phInfo = getPhInfo(soilData?.phLevel);
  const fertility = getFertilityStatus(soilData);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="leaf" size={22} color="#2E7D32" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Soil Health Card</Text>
                <Text style={styles.headerSubtitle}>Field Analysis & Nutrients</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#666" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Fetching Soil Report...</Text>
            </View>
          ) : !soilData ? (
            /* Empty State */
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconCircle}>
                <FontAwesome5 name="seedling" size={36} color="#4CAF50" />
              </View>
              <Text style={styles.emptyTitle}>No Soil Data Recorded</Text>
              <Text style={styles.emptySub}>
                Add your soil test report values to view personalized soil health indicators & nutrient levels.
              </Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  onClose();
                  if (onEdit) onEdit();
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                <Text style={styles.addBtnText}>Add Soil Data</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Soil Data View Content */
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Soil Type Banner */}
              <View style={styles.heroBanner}>
                <View style={styles.heroLeft}>
                  <Text style={styles.heroSoilType}>
                    {soilData.soilType || "General Agricultural Soil"}
                  </Text>
                  <View style={styles.statusBadgeRow}>
                    <View style={[styles.statusTag, { backgroundColor: fertility.color + "18" }]}>
                      <View style={[styles.dot, { backgroundColor: fertility.color }]} />
                      <Text style={[styles.statusTagText, { color: fertility.color }]}>
                        {fertility.badge}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.heroRightIcon}>
                  <MaterialCommunityIcons name="nature" size={40} color="#388E3C" />
                </View>
              </View>

              {/* Main Parameter Grid */}
              <Text style={styles.sectionHeader}>Key Parameters</Text>
              <View style={styles.gridRow}>
                {/* pH Card */}
                <View style={styles.gridCard}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="flask-outline" size={18} color={phInfo.color} />
                    <Text style={styles.cardLabel}>pH Level</Text>
                  </View>
                  <Text style={[styles.cardValue, { color: phInfo.color }]}>
                    {soilData.phLevel !== undefined && soilData.phLevel !== "" ? soilData.phLevel : "N/A"}
                  </Text>
                  <Text style={[styles.cardSubText, { color: phInfo.color }]}>
                    {phInfo.label}
                  </Text>
                </View>

                {/* Moisture Card */}
                <View style={styles.gridCard}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="water-outline" size={18} color="#0288D1" />
                    <Text style={styles.cardLabel}>Moisture</Text>
                  </View>
                  <Text style={[styles.cardValue, { color: "#0288D1" }]}>
                    {soilData.moisture ? `${soilData.moisture}%` : "N/A"}
                  </Text>
                  <Text style={styles.cardSubText}>Water Content</Text>
                </View>

                {/* Organic Matter Card */}
                <View style={styles.gridCard}>
                  <View style={styles.cardHeaderRow}>
                    <FontAwesome5 name="leaf" size={14} color="#689F38" />
                    <Text style={styles.cardLabel}>Organic</Text>
                  </View>
                  <Text style={[styles.cardValue, { color: "#689F38" }]}>
                    {soilData.organicMatter ? `${soilData.organicMatter}%` : "N/A"}
                  </Text>
                  <Text style={styles.cardSubText}>Organic Matter</Text>
                </View>
              </View>

              {/* N-P-K Nutrients Section */}
              <Text style={styles.sectionHeader}>Primary Nutrients (NPK)</Text>
              <View style={styles.npkCard}>
                {/* Nitrogen */}
                <View style={styles.npkRow}>
                  <View style={styles.npkLabelCol}>
                    <View style={[styles.npkBadge, { backgroundColor: "#E8F5E9" }]}>
                      <Text style={[styles.npkBadgeText, { color: "#2E7D32" }]}>N</Text>
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.npkName}>Nitrogen</Text>
                      <Text style={styles.npkDesc}>Foliage & shoot growth</Text>
                    </View>
                  </View>
                  <Text style={styles.npkValue}>
                    {soilData.nitrogen !== undefined ? `${soilData.nitrogen}` : "—"} <Text style={styles.unitText}>%</Text>
                  </Text>
                </View>

                <View style={styles.divider} />

                {/* Phosphorus */}
                <View style={styles.npkRow}>
                  <View style={styles.npkLabelCol}>
                    <View style={[styles.npkBadge, { backgroundColor: "#FFF3E0" }]}>
                      <Text style={[styles.npkBadgeText, { color: "#E65100" }]}>P</Text>
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.npkName}>Phosphorus</Text>
                      <Text style={styles.npkDesc}>Root & flower formation</Text>
                    </View>
                  </View>
                  <Text style={styles.npkValue}>
                    {soilData.phosphorus !== undefined ? `${soilData.phosphorus}` : "—"} <Text style={styles.unitText}>%</Text>
                  </Text>
                </View>

                <View style={styles.divider} />

                {/* Potassium */}
                <View style={styles.npkRow}>
                  <View style={styles.npkLabelCol}>
                    <View style={[styles.npkBadge, { backgroundColor: "#E1F5FE" }]}>
                      <Text style={[styles.npkBadgeText, { color: "#0277BD" }]}>K</Text>
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.npkName}>Potassium</Text>
                      <Text style={styles.npkDesc}>Disease & stress resistance</Text>
                    </View>
                  </View>
                  <Text style={styles.npkValue}>
                    {soilData.potassium !== undefined ? `${soilData.potassium}` : "—"} <Text style={styles.unitText}>%</Text>
                  </Text>
                </View>
              </View>

              {/* Recommendation Box */}
              <View style={styles.recommendBox}>
                <View style={styles.recommendHeader}>
                  <Ionicons name="sparkles" size={16} color="#2E7D32" />
                  <Text style={styles.recommendTitle}>Agri Health Insight</Text>
                </View>
                <Text style={styles.recommendText}>
                  {soilData.phLevel >= 6.0 && soilData.phLevel <= 7.5
                    ? "Soil pH is balanced for major staple crops. Maintain organic matter levels with proper crop rotation."
                    : "Consider consulting agricultural advisors for soil amendments based on current pH & nutrient indicators."}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => {
                    onClose();
                    if (onEdit) onEdit();
                  }}
                  activeOpacity={0.85}
                >
                  <Feather name="edit-3" size={16} color="#FFF" />
                  <Text style={styles.editBtnText}>Edit Soil Data</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryCloseBtn}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ViewSoilModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4F1",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666666",
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
  },
  loadingBox: {
    paddingVertical: 50,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  /* Empty State */
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  addBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },
  /* Content */
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  heroBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCEDC8",
    marginBottom: 18,
  },
  heroLeft: {
    flex: 1,
  },
  heroSoilType: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 6,
  },
  statusBadgeRow: {
    flexDirection: "row",
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  heroRightIcon: {
    marginLeft: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  gridCard: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginHorizontal: 3,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    marginLeft: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  cardSubText: {
    fontSize: 10,
    color: "#757575",
  },
  /* NPK */
  npkCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 18,
  },
  npkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  npkLabelCol: {
    flexDirection: "row",
    alignItems: "center",
  },
  npkBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  npkBadgeText: {
    fontSize: 15,
    fontWeight: "800",
  },
  npkName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  npkDesc: {
    fontSize: 11,
    color: "#757575",
  },
  npkValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2E7D32",
  },
  unitText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#666",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 4,
  },
  /* Recommendation */
  recommendBox: {
    backgroundColor: "#F1F8E9",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    marginBottom: 20,
  },
  recommendHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  recommendTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1B5E20",
    marginLeft: 6,
  },
  recommendText: {
    fontSize: 12,
    color: "#388E3C",
    lineHeight: 18,
  },
  /* Actions */
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 10,
  },
  editBtn: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 14,
    marginRight: 10,
    elevation: 2,
  },
  editBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
  },
  secondaryCloseBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  secondaryCloseText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
});
