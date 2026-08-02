import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { errorMsg, successMsg } from "../utils/Notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { URL } from "../../App";
import Toast from "react-native-toast-message";

/* ─── Reusable styled input ─── */
const InputField = ({ icon, label, value, onChangeText, keyboardType, placeholder }) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={iStyles.wrapper}>
      <View style={[iStyles.container, focused && iStyles.containerFocused]}>
        <View style={[iStyles.iconBox, focused && iStyles.iconBoxFocused]}>
          {icon}
        </View>
        <View style={iStyles.textArea}>
          <Text style={[iStyles.label, focused && iStyles.labelFocused]}>
            {label}
          </Text>
          <TextInput
            style={iStyles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder || `Enter ${label}`}
            placeholderTextColor="#BDBDBD"
            keyboardType={keyboardType || "default"}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>
      </View>
    </View>
  );
};

const iStyles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FBF8",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E0EDE0",
    paddingRight: 14,
    overflow: "hidden",
  },
  containerFocused: {
    borderColor: "#4CAF50",
    backgroundColor: "#FFFFFF",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  iconBox: {
    width: 50,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F8F1",
  },
  iconBoxFocused: { backgroundColor: "#E8F5E9" },
  textArea: { flex: 1, paddingVertical: 10, paddingLeft: 10 },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#AAAAAA",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  labelFocused: { color: "#4CAF50" },
  input: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1B5E20",
    padding: 0,
    margin: 0,
  },
});

/* ─── Main Modal ─── */
const EditProfileModal = ({ visible, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(600)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 600,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSubmit = async () => {
    try {
      if (!name || !phone || !district || !state)
        return errorMsg("All Fields Required");

      if (phone.trim().length < 10) {
        return errorMsg("Mobile number should not be less than 10 digits!");
      }

      setLoading(true);

      // Validate state and district via LLM endpoint first
      const validationResponse = await axios.post(`${URL}/api/main/validate-location`, {
        state: state.trim(),
        district: district.trim(),
      });

      if (validationResponse.data?.status !== "valid") {
        errorMsg("Please enter a valid State and District of India.");
        setLoading(false);
        return;
      }

      const userId = await AsyncStorage.getItem("userId");
      const data = { name, phone, district, state };
      const response = await axios.put(
        `${URL}/api/main/updateuser/${userId}`,
        data
      );

      if (response.data) {
        setLoading(false);
        console.log(response.data);
        successMsg("Profile Updated Successfully");
        await AsyncStorage.multiSet([
          ["name", name],
          ["phone", phone],
          ["state", state],
          ["district", district],
        ]);
        onSubmit(data);
        onClose();
      }
    } catch (e) {
      console.log(e);
      errorMsg("Something went Wrong.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      setName((await AsyncStorage.getItem("name")) || "");
      setState((await AsyncStorage.getItem("state")) || "");
      setDistrict((await AsyncStorage.getItem("district")) || "");
      setPhone((await AsyncStorage.getItem("phone")) || "");
    };
    getUserData();
  }, []);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Dimmed backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Sliding bottom sheet */}
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Drag handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconRing}>
              <Feather name="user" size={22} color="#4CAF50" />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <Text style={styles.headerSub}>Update your farmer details</Text>
            </View>
            <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
              <Feather name="x" size={18} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Input fields */}
          <ScrollView
            style={styles.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <InputField
              icon={<Feather name="user" size={18} color={name ? "#4CAF50" : "#AAAAAA"} />}
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
            />
            <InputField
              icon={<MaterialIcons name="phone" size={18} color={phone ? "#4CAF50" : "#AAAAAA"} />}
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="10-digit mobile number"
            />
            <InputField
              icon={<Ionicons name="map-outline" size={18} color={state ? "#4CAF50" : "#AAAAAA"} />}
              label="State"
              value={state}
              onChangeText={setState}
              placeholder="e.g. Maharashtra"
            />
            <InputField
              icon={<Ionicons name="location-outline" size={18} color={district ? "#4CAF50" : "#AAAAAA"} />}
              label="District"
              value={district}
              onChangeText={setDistrict}
              placeholder="e.g. Pune"
            />

            {/* Validation note */}
            <View style={styles.infoNote}>
              <Ionicons name="information-circle-outline" size={14} color="#66BB6A" />
              <Text style={styles.infoText}>
                State &amp; District will be validated for accuracy
              </Text>
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.75}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.saveBtnLoading]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather
                    name="check"
                    size={16}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
      <Toast />
    </Modal>
  );
};

export default EditProfileModal;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
  },
  headerIconRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E8F5E9",
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextCol: { flex: 1 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: 12,
    color: "#888888",
    fontWeight: "500",
    marginTop: 1,
  },
  closeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F4F0",
    marginHorizontal: 20,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 18,
    maxHeight: 360,
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 2,
    marginBottom: 8,
    gap: 6,
  },
  infoText: {
    fontSize: 11,
    color: "#558B2F",
    fontWeight: "600",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#777777",
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnLoading: { opacity: 0.75 },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
