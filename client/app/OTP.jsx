import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function App() {
  const [otp, setOtp] = useState(new Array(5).fill(""));
  const [countdown, setCountdown] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const inputsRef = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (countdown === 0) {
      setIsResendDisabled(false);
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (value, index) => {
    const filtered = value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = filtered;
    setOtp(newOtp);

    if (filtered && index < 4) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleResend = () => {
    console.log("Resend OTP clicked");
    setCountdown(30);
    setIsResendDisabled(true);
  };

  const handleVerify = () => {
    const enteredOtp = otp.join("");
    console.log("Verifying OTP:", enteredOtp);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Krishi Mittra</Text>
          <Text style={styles.subtitle}>OTP Verification</Text>
          <Text style={styles.text}>Enter the 6-digit code sent to your mobile number</Text>
          <Text style={styles.number}>+91 ******7890</Text>

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={styles.input}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                ref={(el) => (inputsRef.current[index] = el)}
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              { backgroundColor: otp.join("").length === 6 ? "#16A34A" : "#9CA3AF" },
            ]}
            disabled={otp.join("").length !== 6}
            onPress={handleVerify}
          >
            <Text style={styles.verifyText}>Verify OTP</Text>
          </TouchableOpacity>

          {/* Resend Link */}
          <View style={styles.resendContainer}>
            {/* <Text style={styles.text}>Didn't receive the code? </Text> */}
            <TouchableOpacity disabled={isResendDisabled} onPress={handleResend}>
              <Text
                style={[
                  styles.resendText,
                  isResendDisabled ? styles.disabledText : styles.activeText,
                ]}
              >
                {isResendDisabled
                  ? `Resend OTP in ${countdown}s`
                  : "Resend OTP"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    width: "100%"
  },
  card: {
    // backgroundColor: "#fff",
    marginTop: "30%",
    padding: 24,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    justifyContent: "center"
    // elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#15803D",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
    color: "#1F2937",
  },
  text: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  number: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
    marginTop: 4,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 24,
  },
  input: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  verifyButton: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 28,
    alignItems: "center",
  },
  verifyText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  resendContainer: {
    flexDirection: "row",
    marginTop: 16,
    maxWidth: "90%"
  },
  resendText: {
    fontWeight: "bold",
  },
  disabledText: {
    color: "#9CA3AF",
  },
  activeText: {
    color: "#16A34A",
  },
});
