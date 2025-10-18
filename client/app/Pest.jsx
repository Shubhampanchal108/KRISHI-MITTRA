import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import HeaderTab from "../src/components/HeaderTab";
import NavigationTab from "../src/components/NavigationTab";
import AIAdviceCard from "@/src/components/AIAdvise";

const Pest = () => {
  const [imageUrl, setImageUrl] = React.useState(null);

  // Function for choosing image
  const pickImage = async () => {
    Alert.alert(
      "Select Option",
      "Choose image source",
      [
        { text: "📷 Camera", onPress: () => openCamera() },
        { text: "🖼️ Gallery", onPress: () => openGallery() },
        { text: "Cancel", style: "cancel" },
      ]
    );
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

  return (
    <>
      <HeaderTab />


      <ScrollView>
      {/* Show Selected Image */}
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.previewImage}
        />
      )}
        <View style={styles.adviceContainer}>
          <Text style={styles.adviceTitle}>Detect Pests and Diseases</Text>
          <Text style={styles.adviceSubtitle}>
            Upload or click an image to detect pest/disease and get instant advice.
          </Text>

          <TouchableOpacity style={styles.adviceButton} onPress={pickImage}>
            <Text style={styles.adviceButtonText}>📷 Upload Image</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.adviceCard}>
          <AIAdviceCard title="Advice based on image" secondTitle="Our Advice" advice='fdklsajjjjjjjjjjjjjjjjjj;;;;;;;;;;;;;;;;;;;;;;;;;;'  />
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
  },
  adviceCard: {
    margin: 13,
  },
  adviceContainer: {
    backgroundColor: "#F0FAF3",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
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
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  adviceButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
