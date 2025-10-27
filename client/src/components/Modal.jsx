import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import axios from "axios";
import { errorMsg, successMsg } from "../utils/Notification";
import { URL } from "../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const FeedbackModal = ({ visible, onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false)

  const handleSubmit = async() => {
    if (feedback.trim() === "") return; // empty feedback check
    
    try{
      setLoading(true)
      const userId = await AsyncStorage.getItem("userId")
      const data = {userId,feedback}
      const response = await axios.post(`${URL}/api/main/feedback/add`, data)

      if(response.data){
        successMsg("Your Feedback is send to admins.")
        console.log(response.data)
        setFeedback("")
        setLoading(false)
      }
    }catch(e){
      console.log(e)
      setFeedback("")
      setLoading(false)
      errorMsg("Something went wrong.")
    }
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
          <Text style={styles.title}>Krishi Mittra Feedback</Text>

          <TextInput
            style={styles.input}
            placeholder="Apna feedback likhiye..."
            multiline
            value={feedback}
            onChangeText={setFeedback}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              
              {loading ? (<ActivityIndicator size="small" color="white"/>): (<Text style={styles.buttonText}>Submit</Text>)}
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Toast/>
    </Modal>
  );
};

export default FeedbackModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  input: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: "top",
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
