import React, { useEffect } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Welcome from "./app/Welcome";
import { useRouter } from "expo-router";

export const URL = 'http://192.168.31.174:5000';

const App = () => {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("name");
      AsyncStorage.setItem("weatherFetched", "false");
      AsyncStorage.setItem("adviceFetched", "false");
      AsyncStorage.setItem("sprayingAdviceFetched", "false");

      if (!token && !user) {
        setTimeout(() => router.replace("/signUp"), 1000);
      } else if (!token) {
        setTimeout(() => router.replace("/login"), 1000);
      } else {
        setTimeout(() => router.replace("/Home"), 1000);
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
