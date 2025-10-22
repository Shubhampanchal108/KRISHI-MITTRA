import React, { useEffect } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Welcome from "./app/Welcome";
import { useRouter } from "expo-router";

export const URL = 'https://krishi-mittra-4.onrender.com';

const App = () => {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("name");
      AsyncStorage.setItem("weatherFetched", "false");
      AsyncStorage.setItem("adviceFetched", "false");
      AsyncStorage.setItem("sprayingAdviceFetched", "false");
      AsyncStorage.removeItem("chatHistory");
      AsyncStorage.removeItem("pestAdvice")

      if (!token && !user) {
        setTimeout(() => router.replace("/signUp"), 3000);
      } else if (!token) {
        setTimeout(() => router.replace("/login"), 3000);
      } else {
        setTimeout(() => router.replace("/Home"), 3000);
      }
    };

    checkUser();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Welcome />
      <Toast />
    </View>
  );
};

export default App;
