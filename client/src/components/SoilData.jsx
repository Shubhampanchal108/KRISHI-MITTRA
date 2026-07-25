import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { URL } from "../../App";
import axios from "axios";
import { errorMsg, successMsg } from "../utils/Notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const SCREEN_WIDTH = Dimensions.get("window").width;

// ─── Labeled Input ────────────────────────────────────────────────────────────
const LabeledInput = ({
  label,
  hint,
  value,
  onChangeText,
  keyboardType = "default",
  unit,
}) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    <View style={styles.inputRow}>
      <TextInput
        style={[styles.input, unit ? { paddingRight: 44 } : null]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor="#bbb"
        placeholder="—"
      />
      {unit ? <Text style={styles.unitLabel}>{unit}</Text> : null}
    </View>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const SoilDataModal = ({ visible, onClose, onSuccess }) => {
  const [soilType, setSoilType] = useState("");
  const [phLevel, setPhLevel] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [organicMatter, setOrganicMatter] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [moisture, setMoisture] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  // Slide animation: 0 → step1 visible, 1 → step2 visible
  const slideX = useRef(new Animated.Value(0)).current;

  const goToStep = useCallback(
    (targetStep, animate = true) => {
      const toValue = -targetStep * SCREEN_WIDTH;
      if (animate) {
        Animated.spring(slideX, {
          toValue,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }).start();
      } else {
        slideX.setValue(toValue);
      }
      setStep(targetStep);
    },
    [slideX],
  );

  useEffect(() => {
    const loadSaved = async () => {
      try {
        // Always fetch from server using userId to guarantee user-specific data
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          try {
            const res = await axios.get(`${URL}/api/main/soil/get/user/${userId}`);
            if (res.data && !res.data.msg) {
              const d = res.data;
              setSoilType(d.soilType ? String(d.soilType) : "");
              setPhLevel(d.phLevel != null ? String(d.phLevel) : "");
              setPotassium(d.potassium != null ? String(d.potassium) : "");
              setNitrogen(d.nitrogen != null ? String(d.nitrogen) : "");
              setOrganicMatter(d.organicMatter != null ? String(d.organicMatter) : "");
              setMoisture(d.moisture != null ? String(d.moisture) : "");
              setPhosphorus(d.phosphorus != null ? String(d.phosphorus) : "");
              // Update local cache for offline fallback
              await AsyncStorage.setItem(`soilData_${userId}`, JSON.stringify(d));
              return;
            }
          } catch (serverErr) {
            console.log("Server fetch failed, falling back to local cache:", serverErr.message);
          }
          // Offline fallback: read user-scoped cache
          const raw = await AsyncStorage.getItem(`soilData_${userId}`);
          if (raw) {
            const d = JSON.parse(raw);
            setSoilType(d.soilType ? String(d.soilType) : "");
            setPhLevel(d.phLevel != null ? String(d.phLevel) : "");
            setPotassium(d.potassium != null ? String(d.potassium) : "");
            setNitrogen(d.nitrogen != null ? String(d.nitrogen) : "");
            setOrganicMatter(d.organicMatter != null ? String(d.organicMatter) : "");
            setMoisture(d.moisture != null ? String(d.moisture) : "");
            setPhosphorus(d.phosphorus != null ? String(d.phosphorus) : "");
          }
        } else {
          // Not logged in — clear fields
          setSoilType(""); setPhLevel(""); setPotassium("");
          setNitrogen(""); setOrganicMatter(""); setMoisture(""); setPhosphorus("");
        }
      } catch (err) {
        console.error("Error loading soil data:", err);
      }
    };
    if (visible) {
      loadSaved();
      goToStep(0, false);
    }
  }, [visible, goToStep]);

  const handleNext = () => {
    goToStep(1);
  };

  const handleBack = () => {
    goToStep(0);
  };

  const handleSubmit = async () => {
    if (!nitrogen || !potassium || !phosphorus) {
      alert("Nitrogen, Potassium and Phosphorus are required.");
      return;
    }
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const soilData = {
        userId,
        soilType,
        phLevel,
        moisture,
        nitrogen,
        phosphorus,
        potassium,
        organicMatter,
      };
      const response = await axios.post(`${URL}/api/main/soil/add`, soilData);
      if (response.data) {
        // Cache under user-scoped key so it never bleeds to other accounts
        await AsyncStorage.setItem(`soilData_${userId}`, JSON.stringify(soilData));
        // Close the modal first, then fire the toast in the parent layer
        onClose();
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            successMsg("✅ Soil data saved!", "Your soil information has been updated.");
          }
        }, 300);
      }
    } catch (err) {
      console.log(err);
      errorMsg("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.sheet}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="leaf-outline" size={22} color="#2E7D32" />
              <Text style={styles.headerTitle}>Soil Data</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          {/* ── Step Indicator ── */}
          <View style={styles.stepIndicatorRow}>
            {/* circle 1 */}
            <View
              style={[styles.stepCircle, step >= 0 && styles.stepCircleActive]}
            >
              {step > 0 ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : (
                <Text style={styles.stepNum}>1</Text>
              )}
            </View>
            <View
              style={[styles.stepLine, step > 0 && styles.stepLineActive]}
            />
            {/* circle 2 */}
            <View
              style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}
            >
              <Text style={[styles.stepNum, step >= 1 && { color: "#fff" }]}>
                2
              </Text>
            </View>
          </View>
          <View style={styles.stepLabelRow}>
            <Text
              style={[styles.stepLabel, step === 0 && styles.stepLabelActive]}
            >
              Basic Info
            </Text>
            <Text
              style={[styles.stepLabel, step === 1 && styles.stepLabelActive]}
            >
              Nutrients
            </Text>
          </View>

          {/* ── Sliding content strip ── */}
          <View style={styles.viewport}>
            <Animated.View
              style={[styles.strip, { transform: [{ translateX: slideX }] }]}
            >
              {/* ── Step 1 ── */}
              <ScrollView
                style={styles.page}
                contentContainerStyle={styles.pageContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.pageTitle}>Basic Soil Information</Text>
                <Text style={styles.pageSubtitle}>
                  Enter the general characteristics of your soil.
                </Text>

                <LabeledInput
                  label="Soil Type"
                  hint="e.g. Clay, Sandy, Loamy, Silty"
                  value={soilType}
                  onChangeText={setSoilType}
                />
                <LabeledInput
                  label="pH Level"
                  hint="Scale 0–14 · Ideal crop range: 6–7"
                  value={phLevel}
                  onChangeText={setPhLevel}
                  keyboardType="numeric"
                />
                <LabeledInput
                  label="Moisture"
                  hint="Water content currently held in the soil"
                  value={moisture}
                  onChangeText={setMoisture}
                  keyboardType="numeric"
                  unit="%"
                />
                <LabeledInput
                  label="Organic Matter"
                  hint="Decomposed plant/animal material — enriches fertility"
                  value={organicMatter}
                  onChangeText={setOrganicMatter}
                  keyboardType="numeric"
                  unit="%"
                />

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleNext}
                >
                  <Text style={styles.primaryBtnText}>Next</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#fff"
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>

                <View style={{ height: 40 }} />
              </ScrollView>

              {/* ── Step 2 ── */}
              <ScrollView
                style={styles.page}
                contentContainerStyle={styles.pageContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.pageTitle}>Nutrient Levels (NPK)</Text>
                <Text style={styles.pageSubtitle}>
                  Enter values from your soil test report. All three fields are
                  required.
                </Text>

                <LabeledInput
                  label="Nitrogen (N) *"
                  hint="Key nutrient for leaf & shoot growth"
                  value={nitrogen}
                  onChangeText={setNitrogen}
                  keyboardType="numeric"
                  unit="%"
                />
                <LabeledInput
                  label="Phosphorus (P) *"
                  hint="Supports root development & flowering"
                  value={phosphorus}
                  onChangeText={setPhosphorus}
                  keyboardType="numeric"
                  unit="%"
                />
                <LabeledInput
                  label="Potassium (K) *"
                  hint="Water regulation & disease resistance"
                  value={potassium}
                  onChangeText={setPotassium}
                  keyboardType="numeric"
                  unit="%"
                />

                <View style={styles.requiredNote}>
                  <Ionicons
                    name="information-circle-outline"
                    size={14}
                    color="#FB8C00"
                  />
                  <Text style={styles.requiredNoteText}>
                    Fields marked with * are required
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.outlineBtn}
                    onPress={handleBack}
                  >
                    <Ionicons name="arrow-back" size={16} color="#2E7D32" />
                    <Text style={styles.outlineBtnText}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      styles.submitBtn,
                      loading && { opacity: 0.7 },
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons
                          name="cloud-upload-outline"
                          size={18}
                          color="#fff"
                        />
                        <Text
                          style={[styles.primaryBtnText, { marginLeft: 6 }]}
                        >
                          Submit
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default SoilDataModal;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    // Important: no overflow:hidden here — it clips the Animated.View
  },

  // ── Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F5E9",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginLeft: 8,
  },
  closeBtn: {
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 6,
  },

  // ── Step Indicator
  stepIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 18,
    paddingHorizontal: 80,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#C8E6C9",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  stepNum: {
    fontSize: 13,
    fontWeight: "700",
    color: "#A5D6A7",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#C8E6C9",
    marginHorizontal: 6,
  },
  stepLineActive: {
    backgroundColor: "#2E7D32",
  },
  stepLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 56,
    marginTop: 6,
    marginBottom: 2,
  },
  stepLabel: {
    fontSize: 12,
    color: "#AAAAAA",
    fontWeight: "500",
  },
  stepLabelActive: {
    color: "#2E7D32",
    fontWeight: "700",
  },

  // ── Slide Viewport
  viewport: {
    overflow: "hidden", // clips the strip horizontally
    height: 420, // fixed height so fields are always visible
  },
  strip: {
    flexDirection: "row",
    width: SCREEN_WIDTH * 2,
    height: "100%",
  },
  page: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
  pageContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
  },

  // ── Page text
  pageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#888",
    lineHeight: 18,
    marginBottom: 16,
  },

  // ── Form field
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldHint: {
    fontSize: 11,
    color: "#999",
    marginBottom: 6,
  },
  inputRow: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#FAFFFE",
  },
  unitLabel: {
    position: "absolute",
    right: 14,
    fontSize: 13,
    color: "#888",
    fontWeight: "600",
  },

  // ── Buttons
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 6,
    elevation: 2,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2E7D32",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 6,
  },
  outlineBtnText: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  submitBtn: {
    flex: 1,
  },

  // ── Required note
  requiredNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    marginTop: 4,
  },
  requiredNoteText: {
    fontSize: 12,
    color: "#F57F17",
    marginLeft: 6,
  },
});
