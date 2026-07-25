import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { errorMsg, successMsg } from "../utils/Notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { URL } from "../../App";
import Toast from "react-native-toast-message";

const EditProfileModal = ({ visible, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);

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
      setLoading(false)
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      setName(await AsyncStorage.getItem("name"));
      setState(await AsyncStorage.getItem("state"));
      setDistrict(await AsyncStorage.getItem("district"));
      setPhone(await AsyncStorage.getItem("phone"));
    };
    getUserData();
  }, []);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Edit Profile</Text>
          <ScrollView>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="State"
              value={state}
              onChangeText={setState}
            />
            <TextInput
              style={styles.input}
              placeholder="District"
              value={district}
              onChangeText={setDistrict}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone No"
              value={phone}
              onChangeText={setPhone}
            />
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              {loading ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <Text style={styles.buttonText}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Toast />
    </Modal>
  );
};

export default EditProfileModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    maxHeight: "80%",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  closeButton: {
    backgroundColor: "#999",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
});
