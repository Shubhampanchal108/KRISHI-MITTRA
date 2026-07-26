// app/_layout.js
import React from "react";
import { Stack } from "expo-router";
import ErrorBoundary from "../src/components/ErrorBoundary";

export default function Layout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </ErrorBoundary>
  );
}

