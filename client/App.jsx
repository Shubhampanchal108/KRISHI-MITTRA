import React, { useEffect } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export const URL = 'http://192.168.1.7:5000';


export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const user = await AsyncStorage.getItem("name");

        // Smart Daily Caching Check
        const today = new Date().toDateString();
        const lastFetchDate = await AsyncStorage.getItem("lastFetchDate");

        if (lastFetchDate !== today) {
          await AsyncStorage.multiSet([
            ["weatherFetched", "false"],
            ["adviceFetched", "false"],
            ["sprayingAdviceFetched", "false"],
            ["lastFetchDate", today],
          ]);
          console.log("New day detected! Resetting daily advice and weather fetch flags.");
        } else {
          console.log("Same day: keeping daily weather and advice cache.");
        }

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
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {/* <Welcome /> */}
      <Toast />
    </View>
  );
}
