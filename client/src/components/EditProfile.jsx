import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

const EditProfileModal = ({ visible, onClose, onSubmit, initialData }) => {
  console.log(initialData.name)
  const [name, setName] = useState(initialData.name || "");
  const [state, setState] = useState(initialData.state || "");
  const [district, setDistrict] = useState(initialData.district || "");
  const [password, setPassword] = useState(initialData.password || "");

  const handleSubmit = () => {
    onSubmit({ name, state, district, password });
    onClose();
  };

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
              value={initialData.name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="State"
              value={initialData.state}
              onChangeText={setState}
            />
            <TextInput
              style={styles.input}
              placeholder="District"
              value={initialData.district}
              onChangeText={setDistrict}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone No"
              value={initialData.phone}
              onChangeText={setPassword}
            />
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
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
