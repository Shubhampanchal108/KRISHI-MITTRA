import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import {URL} from "../../App"
import axios from "axios";
import {errorMsg, successMsg} from '../utils/Notification'
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const SoilDataModal = ({ visible, onClose, onSubmit }) => {
  const [soilType, setSoilType] = useState("");
  const [phLevel, setPhLevel] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [organicMatter, setOrganicMatter] = useState("");
  const [phosphorus, setPhosphorus] = useState('')
  const [potassium, setPotassium] = useState('')
  const [moisture, setMoisture] = useState('')
  const [loading , setLoading] = useState(false)

  const handleSubmit = async() => {
    if (!nitrogen ||!potassium || !phosphorus) {
      alert("nitrogen, potassium and phosphorus are required feilds");
      return;
    }
    setLoading(true)
    const userId = await AsyncStorage.getItem("userId")
    const soilData = {userId, soilType, phLevel, moisture, nitrogen, phosphorus, potassium, organicMatter };
    // onSubmit(soilData);

    try {
      const response = await axios.post(`${URL}/api/main/soil/add`, soilData)
      
      if(response.data){
        successMsg("Soil Data uploaded Sucessfully.")
        console.log(response.data)
        AsyncStorage.setItem("soilData", JSON.stringify(soilData))
        
        // setSoilType("");
        // setPhLevel("");
        // setPotassium("");
        // setNitrogen("");
        // setOrganicMatter('')
        // setMoisture('')
        // setPhosphorus('')
        setLoading(false)
      }
    } catch (error) {
      console.log(error)
      errorMsg("Someting went wrong")
      setLoading(false)
    }
    
  };

useEffect(() => {
  const getSoilData = async () => {
    try {
      // ✅ Correct way — key ko string me do, parse mat karo
      const storedData = await AsyncStorage.getItem("soilData");
      
      if (storedData) {
        const data = JSON.parse(storedData); // ✅ ab yahan parse karo
        setSoilType(data.soilType);
        setPhLevel(data.phLevel);
        setPotassium(data.potassium);
        setNitrogen(data.nitrogen);
        setOrganicMatter(data.organicMatter);
        setMoisture(data.moisture);
        setPhosphorus(data.phosphorus);
      }
    } catch (error) {
      console.error("Error fetching soil data:", error);
    }
  };

  getSoilData();
}, []);


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
            placeholder="pH Level (%)"
            keyboardType="numeric"
            style={styles.input}
            value={phLevel}
            onChangeText={setPhLevel}
          />
          <TextInput
            placeholder="Moisture (%)"
            keyboardType="numeric"
            style={styles.input}
            value={moisture}
            onChangeText={setMoisture}
          />
          <TextInput
            placeholder="Nitrogen (%)"
            keyboardType="numeric"
            style={styles.input}
            value={nitrogen}
            onChangeText={setNitrogen}
          />
          <TextInput
            placeholder="phosphorus (%)"
            keyboardType="numeric"
            style={styles.input}
            value={phosphorus}
            onChangeText={setPhosphorus}
          />
          <TextInput
            placeholder="potassium (%)"
            keyboardType="numeric"
            style={styles.input}
            value={potassium}
            onChangeText={setPotassium}
          />
          <TextInput
            placeholder="organicMatter (%)"
            keyboardType="numeric"
            style={styles.input}
            value={organicMatter}
            onChangeText={setOrganicMatter}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadBtn} onPress={handleSubmit}>
              {/* */}
              {loading ?(<ActivityIndicator size="small" color="white"/>) 
              :( <Text style={styles.btnText}>Upload</Text>)}
              
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Toast/>
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
