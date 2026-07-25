import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const FEATURES = [
  {
    icon: "video-outline",
    iconLib: "Ionicons",
    title: "Live Expert Sessions",
    desc: "Watch real-time sessions with certified agronomists and farming experts.",
    color: "#4CAF50",
    bg: "#E8F5E9",
  },
  {
    icon: "people-outline",
    iconLib: "Ionicons",
    title: "Farmer Community",
    desc: "Join live group discussions and share field experiences with farmers across India.",
    color: "#1565C0",
    bg: "#E3F2FD",
  },
  {
    icon: "leaf",
    iconLib: "FontAwesome5",
    title: "Crop Care Demos",
    desc: "Live demonstrations on pest control, soil treatment, and seasonal best practices.",
    color: "#F57C00",
    bg: "#FFF3E0",
  },
  {
    icon: "chart-line",
    iconLib: "MaterialCommunityIcons",
    title: "Market Watch Live",
    desc: "Real-time mandi price updates and expert commentary on crop market trends.",
    color: "#6A1B9A",
    bg: "#F3E5F5",
  },
];

const FeatureCard = ({ item, delay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderIcon = () => {
    if (item.iconLib === "FontAwesome5")
      return <FontAwesome5 name={item.icon} size={22} color={item.color} />;
    if (item.iconLib === "MaterialCommunityIcons")
      return (
        <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
      );
    return <Ionicons name={item.icon} size={24} color={item.color} />;
  };

  return (
    <Animated.View
      style={[
        styles.featureCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={[styles.featureIconBox, { backgroundColor: item.bg }]}>
        {renderIcon()}
      </View>
      <View style={styles.featureTextBlock}>
        <Text style={styles.featureTitle}>{item.title}</Text>
        <Text style={styles.featureDesc}>{item.desc}</Text>
      </View>
    </Animated.View>
  );
};

const PulseRing = ({ size, duration, delay, opacity }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(opacity)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.6,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: opacity,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.9)",
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    />
  );
};

const LiveStreamScreen = () => {
  const router = useRouter();
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroPop = useRef(new Animated.Value(0.7)).current;
  const badgeBounce = useRef(new Animated.Value(0)).current;
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(heroPop, {
        toValue: 1,
        friction: 5,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();

    // Badge subtle bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgeBounce, {
          toValue: -4,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(badgeBounce, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleNotify = () => {
    setNotified(true);
    Alert.alert(
      "🎉 You're on the list!",
      "We'll notify you as soon as Live Sessions goes live. Stay tuned!",
      [{ text: "Great!", style: "default" }],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Sessions</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroBanner}>
          {/* Decorative circles in bg */}
          <View style={styles.bgCircle1} />
          <View style={styles.bgCircle2} />

          {/* Pulse rings + center icon */}
          <View style={styles.pulseCenter}>
            <PulseRing size={190} duration={2200} delay={0} opacity={0.25} />
            <PulseRing size={140} duration={2200} delay={550} opacity={0.35} />
            <PulseRing size={90} duration={2200} delay={1100} opacity={0.5} />

            <Animated.View
              style={[
                styles.heroIconCircle,
                { opacity: heroFade, transform: [{ scale: heroPop }] },
              ]}
            >
              <Ionicons name="radio" size={48} color="#fff" />
            </Animated.View>
          </View>

          <Animated.View style={[styles.heroTextBlock, { opacity: heroFade }]}>
            <Animated.View
              style={[
                styles.comingSoonBadge,
                { transform: [{ translateY: badgeBounce }] },
              ]}
            >
              <View style={styles.liveIndicator} />
              <Text style={styles.comingSoonText}>COMING SOON</Text>
            </Animated.View>
            <Text style={styles.heroTitle}>Live Farm{"\n"}Sessions</Text>
            <Text style={styles.heroSubtitle}>
              Connect live with agricultural experts, watch real-time crop care
              demos, and join a thriving community of farmers — all in one
              place.
            </Text>
          </Animated.View>
        </View>

        {/* Launch Timeline Pill */}
        <View style={styles.timelinePill}>
          <Ionicons name="calendar-outline" size={16} color="#2E7D32" />
          <Text style={styles.timelineText}>
            Estimated Launch: <Text style={styles.timelineBold}>Q3 2025</Text>
          </Text>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionHeading}>What's Coming</Text>
          <Text style={styles.sectionSub}>
            A sneak peek into the features we're building for you
          </Text>
          {FEATURES.map((item, i) => (
            <FeatureCard key={i} item={item} delay={i * 130} />
          ))}
        </View>

        {/* Stats Strip */}
        <View style={styles.statsRow}>
          {[
            { value: "500+", label: "Expert\nAgronomists" },
            { value: "20+", label: "Regional\nLanguages" },
            { value: "Live", label: "Q&A\nSessions" },
          ].map((s, i) => (
            <View key={i} style={[styles.statItem, i < 2 && styles.statBorder]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaHeading}>Be the First to Know</Text>
          <Text style={styles.ctaSub}>
            Get notified the moment Live Sessions launches on Krishi Mittra
          </Text>

          <TouchableOpacity
            style={[styles.notifyBtn, notified && styles.notifyBtnDone]}
            onPress={handleNotify}
            activeOpacity={0.85}
          >
            <Ionicons
              name={notified ? "checkmark-circle" : "notifications-outline"}
              size={20}
              color="#fff"
            />
            <Text style={styles.notifyBtnText}>
              {notified ? "You're on the list!" : "Notify Me When Live"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.goBackLink}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back-outline" size={14} color="#888" />
            <Text style={styles.goBackText}> Back to Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F8F4",
  },

  // ── Header ──────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#1B5E20",
    marginTop: "8%",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },

  scroll: { flex: 1 },

  // ── Hero Banner ─────────────────────────────────
  heroBanner: {
    backgroundColor: "#1B5E20",
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  bgCircle1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255,255,255,0.04)",
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: -60,
    left: -40,
  },
  pulseCenter: {
    width: 190,
    height: 190,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  heroIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  heroTextBlock: {
    alignItems: "center",
    paddingHorizontal: 28,
  },
  comingSoonBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,213,79,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,213,79,0.4)",
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD54F",
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFD54F",
    letterSpacing: 2.5,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 22,
  },

  // ── Timeline Pill ───────────────────────────────
  timelinePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: -22,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  timelineText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  timelineBold: {
    fontWeight: "800",
    color: "#2E7D32",
  },

  // ── Features ────────────────────────────────────
  featuresSection: {
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: "#888",
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#F0F4F0",
  },
  featureIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    flexShrink: 0,
  },
  featureTextBlock: { flex: 1 },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A2E1A",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },

  // ── Stats Row ────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: "#1B5E20",
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.15)",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFD54F",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    textAlign: "center",
    lineHeight: 15,
  },

  // ── CTA ─────────────────────────────────────────
  ctaSection: {
    marginHorizontal: 16,
    marginTop: 30,
    alignItems: "center",
  },
  ctaHeading: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 8,
  },
  ctaSub: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  notifyBtn: {
    width: "100%",
    backgroundColor: "#1B5E20",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
    elevation: 4,
    shadowColor: "#1B5E20",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  notifyBtnDone: {
    backgroundColor: "#388E3C",
  },
  notifyBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
  goBackLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 8,
  },
  goBackText: {
    fontSize: 13,
    color: "#888",
    fontWeight: "600",
  },
});

export default LiveStreamScreen;
