import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  TextInput,
  ActivityIndicator
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import HeaderTab from "../src/components/HeaderTab";
import NavigationTab from "../src/components/NavigationTab";
import AIAdviceCard from "@/src/components/AIAdvise";
import axios from 'axios'
import {URL} from '../App'
import {speak} from '../src/utils/TTS'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { errorMsg } from "../src/utils/Notification";

const Pest = () => {
  const [imageUrl, setImageUrl] = React.useState(null);
  const [question, setQuestion] = React.useState("");
  const [advice, setAdvice] = React.useState('')
  const [loading , setLoading] = React.useState(false)

  useEffect(()=>{
    const mangeAdviceState = async()=>{
      const data = await AsyncStorage.getItem("pestAdvice")
      if(data){
        setAdvice(data)
      }
    } 
    mangeAdviceState()
  },[])

  // Function for choosing image
  const pickImage = async () => {
    Alert.alert("Select Option", "Choose image source", [
      { text: "📷 Camera", onPress: () => openCamera() },
      { text: "🖼️ Gallery", onPress: () => openGallery() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Open Camera
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("Camera permission is required!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      const image = result.assets[0];
      setImageUrl(image.uri);
      console.log("Camera Image URI:", image.uri);
    }
  };

  // Open Gallery
  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission to access gallery is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      const image = result.assets[0];
      setImageUrl(image.uri);
      console.log("Gallery Image URI:", image.uri);
    }
  };

  //Handle Send 
  const HandleSend = async () => {
  try {
    if (!imageUrl || !question) {
      errorMsg("Please provide both image and query");
      return;
    }
    setLoading(true)

    const data = new FormData();
    data.append("query", question);
    data.append("image", {
      uri: imageUrl,               // ✅ full URI (like file:///...)
      name: "pest_image.jpg",      // ✅ name required
      type: "image/jpeg",          // ✅ type required
    });

    const response = await axios.post(`${URL}/api/main/pestdetection`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data) {
      setAdvice(response.data.response)
      AsyncStorage.setItem("pestAdvice", response.data.response)
      setQuestion('')
      setLoading(false)
    } else {
      console.log("No runned");
    }
  } catch (error) {
    setQuestion('')
    console.error("Upload error:", error.message);
    setLoading(false)
  }
};

  return (
    <>
      <HeaderTab />

      <ScrollView>
        <Text
          style={[
            styles.adviceTitle,
            { marginHorizontal: 12, marginTop: 12, fontSize: 20 },
          ]}
        >
          Detect Pests and Diseases
        </Text>

        {/* Show Selected Image */}
        {imageUrl && (
          <TouchableOpacity onPress={pickImage}>
          <Image
            source={{uri: imageUrl}}
            style={styles.previewImage}
          />
          </TouchableOpacity>
        )}
        {!imageUrl && (
          <TouchableOpacity onPress={pickImage}>
          <Image
            source={require("../assets/images/default.webp")}
            style={styles.previewImage}
          />
          </TouchableOpacity>
        )}

        <View style={styles.inputCont}>
          <TextInput
            style={styles.input}
            placeholder="Ask question about image"
            placeholderTextColor="#888"
            value={question}
            onChangeText={setQuestion}
          />
        </View>
        <View style={styles.adviceContainer}>
          {/* <Text style={styles.adviceTitle}>Detect Pests and Diseases</Text> */}
          <Text style={styles.adviceSubtitle}>
            Upload or click an image to detect pest/disease and get instant
            advice.
          </Text>

          <TouchableOpacity style={styles.adviceButton} onPress={pickImage}>
            <Ionicons
                              name="camera-outline"
                              size={30}
                              color="white"
                            />
            <Text style={styles.adviceButtonText}>Upload Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.adviceButton} onPress={HandleSend}>
            
            {loading ?(<ActivityIndicator size="large" color="white"/>) : (<Text style={styles.adviceButtonText} >Send</Text>)}

          </TouchableOpacity>
        </View>

        <View style={styles.adviceCard}>
          <AIAdviceCard
            title="Advice based on image"
            secondTitle="Model Advice"
            advice={advice}
            onClick={()=>speak(advice)}
          />
        </View>
      </ScrollView>

      <NavigationTab />
    </>
  );
};

export default Pest;

const styles = StyleSheet.create({
  previewImage: {
    width: 340,
    height: 200,
    alignSelf: "center",
    marginTop: 20,
    borderRadius: 10,
    resizeMode: "cover",
    borderColor: "#ccc",
    borderWidth: 1,
    borderStyle: "dotted",
    elevation: 2,
    maxWidth: '92%',
  },
  inputCont: {
    padding: 13,
    backgroundColor: "#F0FAF3",
    borderRadius: 8,
    marginHorizontal: 13,
    marginVertical: 10,
    elevation: 2,
  },
  input: {
    height: 50,
    backgroundColor: 'white',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    paddingHorizontal: 10,
    color: '#000',
  },
  adviceCard: {
    margin: 13,
  },
  adviceContainer: {
    backgroundColor: "#F0FAF3",
    borderRadius: 16,
    padding: 20,
    marginTop: 5,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 5,
  },
  adviceSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
  },
  adviceButton: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    gap: 8,
    margin: 3,
  },
  adviceButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
