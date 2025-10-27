import React, { useEffect } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Welcome from "./app/Welcome";

export const URL = 'http://192.168.1.6:5000';


export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const user = await AsyncStorage.getItem("name");
        await AsyncStorage.multiSet([
          ["weatherFetched", "false"],
          ["adviceFetched", "false"],
          ["sprayingAdviceFetched", "false"],
        ]);
        await AsyncStorage.multiRemove(["chatHistory", "pestAdvice"]);

        setTimeout(() => {
          if (!token && !user) router.replace("/signUp");
          else if (!token) router.replace("/login");
          else router.replace("/Home");
        }, 10);
      } catch (e) {
        console.log("Startup error:", e);
      }
    };
    checkUser();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {/* <Welcome /> */}
      <Toast />
    </View>
  );
}
