import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";
import NavTab from "../src/components/NavigationTab";
import HeaderTab from "../src/components/HeaderTab";
import { errorMsg, successMsg } from "../src/utils/Notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import FeedbackModal from "../src/components/Modal";
import EditProfileModal from "../src/components/EditProfile";
import SoilDataModal from "../src/components/SoilData";
import ViewSoilModal from "../src/components/ViewSoilModal";
import Toast from "react-native-toast-message";

const Profile = () => {
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [soilModalVisible, setSoilModalVisible] = useState(false);
  const [viewSoilModalVisible, setViewSoilModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [initialData, setInitialData] = useState({
    name: "Farmer",
    state: "",
    district: "",
    phone: "",
  });

  const fetchInitialData = async () => {
    try {
      const name = await AsyncStorage.getItem("name");
      const state = await AsyncStorage.getItem("state");
      const district = await AsyncStorage.getItem("district");
      const phone = await AsyncStorage.getItem("phone");

      setInitialData({
        name: name || "Farmer",
        state: state || "State",
        district: district || "District",
        phone: phone || "",
      });
    } catch (err) {
      console.log("Error fetching profile initial data:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleLogout = async () => {
    try {
      setLogoutModalVisible(false);
      successMsg("Logged out successfully.");
      await AsyncStorage.removeItem("token");

      setTimeout(() => {
        router.push("/login");
      }, 800);
    } catch (error) {
      errorMsg("Oops! Something went wrong.");
      console.log(error);
    }
  };

  return (
    <>
      <HeaderTab />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Farmer Profile Hero Banner */}
          <View style={styles.profileHeroCard}>
            <View style={styles.avatarWrapper}>
              <Image
                source={require("../assets/images/farmer.webp")}
                style={styles.profileImage}
              />
              <TouchableOpacity
                style={styles.avatarEditBadge}
                onPress={() => setEditModalVisible(true)}
              >
                <Feather name="edit-2" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfoCol}>
              <Text style={styles.farmerName}>{initialData.name}</Text>
              {initialData.phone ? (
                <Text style={styles.farmerPhone}>📞 {initialData.phone}</Text>
              ) : null}

              <View style={styles.locationTagsRow}>
                <View style={styles.tagChip}>
                  <Ionicons name="location-sharp" size={12} color="#4CAF50" />
                  <Text style={styles.tagText}>
                    {initialData.district}, {initialData.state}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setEditModalVisible(true)}
              activeOpacity={0.8}
            >
              <Feather name="edit-3" size={14} color="#4CAF50" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Metrics & Membership Row */}
          <View style={styles.metricsRow}>
            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => router.push("/Subscriptions")}
              activeOpacity={0.8}
            >
              <View style={[styles.metricIconCircle, { backgroundColor: "#F1F8E9" }]}>
                <Ionicons name="sparkles" size={16} color="#4CAF50" />
              </View>
              <Text style={styles.metricTitle}>Membership</Text>
              <Text style={styles.metricSub}>Free Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => setViewSoilModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.metricIconCircle, { backgroundColor: "#FFF8E1" }]}>
                <Ionicons name="leaf" size={16} color="#FB8C00" />
              </View>
              <Text style={styles.metricTitle}>Soil Health</Text>
              <Text style={styles.metricSub}>View Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => setEditModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.metricIconCircle, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="shield-checkmark" size={16} color="#1E88E5" />
              </View>
              <Text style={styles.metricTitle}>Account</Text>
              <Text style={styles.metricSub}>Verified</Text>
            </TouchableOpacity>
          </View>

          {/* Section 1: Farming Tools & Services */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>Agri Tools & Services</Text>

            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => router.push("/Subscriptions")}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: "#F1F8E9" }]}>
                <Ionicons name="qr-code-outline" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.itemText}>Subscription Plans</Text>
              <Feather name="chevron-right" size={18} color="#BDBDBD" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => setViewSoilModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: "#F1F8E9" }]}>
                <Ionicons name="leaf-outline" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.itemText}>Soil Health Data</Text>
              <Feather name="chevron-right" size={18} color="#BDBDBD" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => router.push("/GovtSchemes")}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: "#F1F8E9" }]}>
                <FontAwesome5 name="university" size={16} color="#4CAF50" />
              </View>
              <Text style={styles.itemText}>Government Schemes</Text>
              <Feather name="chevron-right" size={18} color="#BDBDBD" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.itemRow, styles.lastItemRow]}
              onPress={() => router.push("/News")}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: "#F1F8E9" }]}>
                <MaterialIcons name="article" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.itemText}>Agriculture News</Text>
              <Feather name="chevron-right" size={18} color="#BDBDBD" />
            </TouchableOpacity>
          </View>

          {/* Section 2: Support & Preferences */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>Support & Preferences</Text>

            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color="#1E88E5"
                />
              </View>
              <Text style={styles.itemText}>App Feedback</Text>
              <Feather name="chevron-right" size={18} color="#BDBDBD" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => router.push("/SecurityQuestions")}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#1E88E5"
                />
              </View>
              <Text style={styles.itemText}>Security Questions</Text>
              <Feather name="chevron-right" size={18} color="#BDBDBD" />
            </TouchableOpacity>

            
          </View>

          {/* Section 3: Account & Policy */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>Account</Text>

            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => router.push("/PrivacyPolicy")}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: "#F5F5F5" }]}>
                <FontAwesome5 name="shield-alt" size={16} color="#616161" />
              </View>
              <Text style={styles.itemText}>Privacy Policy</Text>
              <Feather name="chevron-right" size={18} color="#BDBDBD" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.itemRow, styles.lastItemRow]}
              onPress={() => setLogoutModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: "#FFEBEE" }]}>
                <Ionicons name="log-out-outline" size={20} color="#E53935" />
              </View>
              <Text style={[styles.itemText, { color: "#E53935", fontWeight: "700" }]}>
                Logout
              </Text>
              <Feather name="chevron-right" size={18} color="#E53935" />
            </TouchableOpacity>
          </View>

          {/* Modals */}
          <FeedbackModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSubmit={(feedback) => console.log(feedback)}
          />

          <EditProfileModal
            visible={editModalVisible}
            onClose={() => {
              setEditModalVisible(false);
              fetchInitialData();
            }}
            onSubmit={(data) => console.log(data)}
            initialData={initialData}
          />

          <ViewSoilModal
            visible={viewSoilModalVisible}
            onClose={() => setViewSoilModalVisible(false)}
            onEdit={() => {
              setViewSoilModalVisible(false);
              setSoilModalVisible(true);
            }}
          />

          <SoilDataModal
            visible={soilModalVisible}
            onClose={() => setSoilModalVisible(false)}
            onSuccess={() => {
              successMsg("✅ Soil data saved!", "Your soil information has been updated.");
              setViewSoilModalVisible(true);
            }}
          />

          {/* Logout Confirmation Modal */}
          <Modal
            visible={logoutModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setLogoutModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.logoutModalContent}>
                <View style={styles.logoutIconBox}>
                  <Ionicons name="log-out-outline" size={30} color="#E53935" />
                </View>

                <Text style={styles.logoutModalTitle}>Confirm Logout</Text>
                <Text style={styles.logoutModalText}>
                  Do you really want to logout from Krishi Mittra?
                </Text>

                <View style={styles.logoutBtnRow}>
                  <TouchableOpacity
                    style={styles.cancelLogoutBtn}
                    onPress={() => setLogoutModalVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelLogoutText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmLogoutBtn}
                    onPress={handleLogout}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.confirmLogoutText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>
      <NavTab />
      <Toast />
    </>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBF8",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  profileHeroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCEDC8",
    elevation: 3,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 14,
  },
  avatarWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  profileInfoCol: {
    flex: 1,
    marginLeft: 14,
  },
  farmerName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2E7D32",
  },
  farmerPhone: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
    fontWeight: "500",
  },
  locationTagsRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCEDC8",
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#388E3C",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCEDC8",
    gap: 4,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4CAF50",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCEDC8",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  metricIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  metricTitle: {
    fontSize: 11,
    color: "#888888",
    fontWeight: "600",
  },
  metricSub: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
    marginTop: 1,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DCEDC8",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2E7D32",
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4F0",
  },
  lastItemRow: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  itemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoutModalContent: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  logoutIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoutModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222222",
    marginBottom: 6,
  },
  logoutModalText: {
    fontSize: 13,
    color: "#666666",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  logoutBtnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelLogoutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  cancelLogoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555555",
  },
  confirmLogoutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#E53935",
    alignItems: "center",
  },
  confirmLogoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

