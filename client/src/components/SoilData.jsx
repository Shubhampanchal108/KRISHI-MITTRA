import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";

const SoilDataModal = ({ visible, onClose, onSubmit }) => {
  const [soilType, setSoilType] = useState("");
  const [ph, setPh] = useState("");
  const [moisture, setMoisture] = useState("");
  const [temperature, setTemperature] = useState("");

  const handleSubmit = () => {
    if (!soilType || !ph || !moisture || !temperature) {
      alert("Please fill all fields!");
      return;
    }
    const soilData = { soilType, ph, moisture, temperature };
    onSubmit(soilData);
    setSoilType("");
    setPh("");
    setMoisture("");
    setTemperature("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Upload Soil Data</Text>

          <TextInput
            placeholder="Soil Type (e.g. Clay, Sandy)"
            style={styles.input}
            value={soilType}
            onChangeText={setSoilType}
          />
          <TextInput
            placeholder="pH Level"
            keyboardType="numeric"
            style={styles.input}
            value={ph}
            onChangeText={setPh}
          />
          <TextInput
            placeholder="Moisture (%)"
            keyboardType="numeric"
            style={styles.input}
            value={moisture}
            onChangeText={setMoisture}
          />
          <TextInput
            placeholder="Temperature (°C)"
            keyboardType="numeric"
            style={styles.input}
            value={temperature}
            onChangeText={setTemperature}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadBtn} onPress={handleSubmit}>
              <Text style={styles.btnText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  cancelBtn: {
    backgroundColor: "#999",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  uploadBtn: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default SoilDataModal;
