import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const SplashScreen = ({ onFinish }) => {
  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const badgeScaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const exitFadeAnim = useRef(new Animated.Value(1)).current;

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    // 1. Entrance Sequence
    Animated.sequence([
      // Stage A: Fade & Scale in Logo
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.back(1.5),
        }),
      ]),
      // Stage B: Slide up Text & Badge
      Animated.parallel([
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.2)),
        }),
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(badgeScaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]),
    ]).start();

    // 2. Ambient Logo Rotation (Subtle 360 degree spin loop)
    Animated.loop(
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 18000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();

    // 4. Loading Progress Bar Animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2100,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.quad),
    }).start();

    // 5. Exit Transition Timer
    const timer = setTimeout(() => {
      Animated.timing(exitFadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }).start(() => {
        if (onFinishRef.current) onFinishRef.current();
      });
    }, 2400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.container, { opacity: exitFadeAnim }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F8F4" />

      {/* Decorative Background Glowing Circles */}
      <View style={styles.bgCircleTopRight} />
      <View style={styles.bgCircleBottomLeft} />

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {/* Logo Card with Shadow & Border */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require("../../assets/images/logo.jpeg")}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Animated Text & Branding */}
        <Animated.View
          style={{
            alignItems: "center",
            opacity: textFadeAnim,
            transform: [{ translateY: textTranslateY }],
          }}
        >
          {/* App Title with Leaf Badge */}
          <View style={styles.titleRow}>
            <MaterialCommunityIcons name="sprout" size={32} color="#2E7D32" />
            <Text style={styles.appNameText}>Krishi Mittra</Text>
          </View>

          {/* Subtitle / Tagline Badge */}
          <Animated.View
            style={[
              styles.badgeContainer,
              { transform: [{ scale: badgeScaleAnim }] },
            ]}
          >
            <MaterialCommunityIcons name="leaf" size={16} color="#388E3C" />
            <Text style={styles.taglineText}>
              Smart Farming || Smarter Future
            </Text>
            <Text style={styles.emojiText}>🌾</Text>
          </Animated.View>
        </Animated.View>

        {/* Smooth Animated Loading Progress Bar */}
        <Animated.View style={[styles.progressTrack, { opacity: textFadeAnim }]}>
          <Animated.View
            style={[styles.progressFill, { width: progressWidth }]}
          />
        </Animated.View>
      </View>

      {/* Footer Branding */}
      <Animated.View
        style={[
          styles.footer,
          {
            opacity: textFadeAnim,
          },
        ]}
      >
        <View style={styles.footerBadge}>
          <MaterialCommunityIcons name="code-tags" size={16} color="#2E7D32" />
          <Text style={styles.footerText}>Developed by </Text>
          <Text style={styles.authorHighlight}>Shubham 👨‍💻</Text>
        </View>
        <Text style={styles.versionText}>v1.0.0 • Empowering Farmers</Text>
      </Animated.View>
    </Animated.View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F4F8F4", // Soft eco mint background
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 99999,
  },

  // Ambient Backdrops
  bgCircleTopRight: {
    position: "absolute",
    top: -height * 0.1,
    right: -width * 0.15,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: "rgba(76, 175, 80, 0.08)",
  },
  bgCircleBottomLeft: {
    position: "absolute",
    bottom: -height * 0.1,
    left: -width * 0.15,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: "rgba(46, 125, 50, 0.06)",
  },

  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    elevation: 12,
    shadowColor: "#1B5E20",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    borderWidth: 3,
    borderColor: "#A5D6A7",
    overflow: "hidden",
  },
  logoImage: {
    width: 134,
    height: 134,
    borderRadius: 67,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: 8,
  },
  appNameText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1B5E20",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.05)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(232, 245, 233, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    gap: 6,
    marginBottom: 32,
  },
  taglineText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E7D32",
    letterSpacing: 0.2,
  },
  emojiText: {
    fontSize: 14,
  },

  progressTrack: {
    width: width * 0.45,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },

  footer: {
    paddingBottom: 40,
    alignItems: "center",
    gap: 4,
  },
  footerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  footerText: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
    marginLeft: 4,
  },
  authorHighlight: {
    fontSize: 14,
    color: "#1B5E20",
    fontWeight: "800",
  },
  versionText: {
    fontSize: 11,
    color: "#757575",
    fontWeight: "500",
    marginTop: 4,
  },
});
