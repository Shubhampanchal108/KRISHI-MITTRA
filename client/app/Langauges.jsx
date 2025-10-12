import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";

const languages = [
  { id: "1", name: "English", code: "en", flag: "https://flagcdn.com/w320/gb.png" },
  { id: "2", name: "हिन्दी", code: "hi", flag: "https://flagcdn.com/w320/in.png" },
  { id: "3", name: "ਪੰਜਾਬੀ", code: "pa", flag: "https://flagcdn.com/w320/in.png" },
  { id: "4", name: "मराठी", code: "mr", flag: "https://flagcdn.com/w320/in.png" },
  { id: "5", name: "ગુજરાતી", code: "gu", flag: "https://flagcdn.com/w320/in.png" },
];

const LanguageSelectScreen = () => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (lang) => {
    setSelected(lang.id);
    alert(`Language selected: ${lang.name}`);
    // TODO: Store selected language in AsyncStorage or Context
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Krishi Mittra</Text>
      <Text style={styles.subtitle}>Select your preferred language</Text>

      <FlatList
        data={languages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.languageCard,
              selected === item.id && styles.selectedCard,
            ]}
            onPress={() => handleSelect(item)}
          >
            <View style={styles.flagContainer}>
              <Image source={{ uri: item.flag }} style={styles.flag} />
            </View>
            <Text
              style={[
                styles.languageText,
                selected === item.id && styles.selectedText,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <TouchableOpacity
        style={[
          styles.continueButton,
          { opacity: selected ? 1 : 0.5 },
        ]}
        disabled={!selected}
        onPress={() => alert("Continue to next screen")}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    padding: 1,
    paddingTop: 80,
    width: '100%'
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  subtitle: {
    fontSize: 13,
    color: "#4CAF50",
    marginTop: 8,
    marginBottom: 25,
  },
  languageCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    width: 280,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  selectedCard: {
    backgroundColor: "#4CAF50",
    borderColor: "#2E7D32",
  },
  flagContainer: {
    marginRight: 15,
  },
  flag: {
    width: 32,
    height: 22,
    borderRadius: 4,
  },
  languageText: {
    fontSize: 18,
    color: "#2E7D32",
    fontWeight: "600",
  },
  selectedText: {
    color: "#fff",
  },
  continueButton: {
    backgroundColor: "#388E3C",
    paddingVertical: 14,
    paddingHorizontal: 80,
    borderRadius: 30,
    marginBottom: 50,
  },
  continueText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LanguageSelectScreen;
