import React, { useEffect, useState, useRef } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import SplashScreen from "./src/components/SplashScreen";
import logger from "./src/utils/logger";
export const URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.9:5000';

export default function Index() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const targetRouteRef = useRef("/login");

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
          logger.info("New day detected! Resetting daily advice and weather fetch flags.");
        } else {
          logger.info("Same day: keeping daily weather and advice cache.");
        }

        await AsyncStorage.multiRemove(["chatHistory", "pestAdvice"]);

        if (!token && !user) {
          targetRouteRef.current = "/signUp";
        } else if (!token) {
          targetRouteRef.current = "/login";
        } else {
          targetRouteRef.current = "/Home";
        }
      } catch (e) {
        logger.error("Startup error:", e);
      }
    };

    checkUser();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    router.replace(targetRouteRef.current);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F8F4" }}>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <Toast />
    </View>
  );
}

