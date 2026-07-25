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
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

// ── Community Feature Cards ──────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "chatbubbles-outline",
    iconLib: "Ionicons",
    title: "Farmer Forums",
    desc: "Ask questions, share experiences, and get answers from thousands of fellow farmers.",
    color: "#2E7D32",
    bg: "#E8F5E9",
  },
  {
    icon: "school-outline",
    iconLib: "Ionicons",
    title: "Expert Q&A",
    desc: "Certified agronomists and agricultural scientists answering your field problems.",
    color: "#1565C0",
    bg: "#E3F2FD",
  },
  {
    icon: "camera-outline",
    iconLib: "Ionicons",
    title: "Photo Discussions",
    desc: "Upload pictures of your crops and get community diagnosis in minutes.",
    color: "#F57C00",
    bg: "#FFF3E0",
  },
  {
    icon: "map-marker-multiple",
    iconLib: "MaterialCommunityIcons",
    title: "Regional Groups",
    desc: "Join groups specific to your state, district, and crop type for hyper-local advice.",
    color: "#6A1B9A",
    bg: "#F3E5F5",
  },
  {
    icon: "trophy-outline",
    iconLib: "Ionicons",
    title: "Top Farmers",
    desc: "Discover and follow top-rated farmers who share their success stories and techniques.",
    color: "#C62828",
    bg: "#FFEBEE",
  },
  {
    icon: "calendar-outline",
    iconLib: "Ionicons",
    title: "Seasonal Events",
    desc: "Participate in online workshops, webinars, and government-backed agri events.",
    color: "#00695C",
    bg: "#E0F2F1",
  },
];

// ── Mock Community Posts Preview ─────────────────────────────────────────────
const MOCK_POSTS = [
  {
    avatar: "👨‍🌾",
    name: "Ramesh Patel",
    state: "Gujarat",
    text: "Mere gehun ki patti par peelay dabbe aa rahe hain. Kya karo? 🌾",
    replies: 14,
    likes: 32,
    tag: "Wheat",
    tagColor: "#F9A825",
  },
  {
    avatar: "👩‍🌾",
    name: "Sunita Devi",
    state: "Punjab",
    text: "Dhaan ki fasal mein kaunsa fertilizer best rahega is season?",
    replies: 8,
    likes: 21,
    tag: "Rice",
    tagColor: "#2E7D32",
  },
  {
    avatar: "🧑‍🌾",
    name: "Vijay Kumar",
    state: "Maharashtra",
    text: "Drip irrigation setup karte waqt kya precautions lene chahiye?",
    replies: 19,
    likes: 45,
    tag: "Irrigation",
    tagColor: "#1565C0",
  },
];

// ── Animated Feature Card ────────────────────────────────────────────────────
const FeatureCard = ({ item, delay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 550, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 550, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const renderIcon = () => {
    if (item.iconLib === "MaterialCommunityIcons")
      return <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />;
    if (item.iconLib === "FontAwesome5")
      return <FontAwesome5 name={item.icon} size={22} color={item.color} />;
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

// ── Mock Post Card ───────────────────────────────────────────────────────────
const MockPostCard = ({ post, delay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.mockPost, { opacity: fadeAnim }]}>
      {/* Blur overlay to signal "locked" content */}
      <View style={styles.mockPostContent}>
        <View style={styles.mockPostHeader}>
          <Text style={styles.mockAvatar}>{post.avatar}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.mockName}>{post.name}</Text>
            <Text style={styles.mockState}>📍 {post.state}</Text>
          </View>
          <View style={[styles.mockTag, { backgroundColor: post.tagColor + "22" }]}>
            <Text style={[styles.mockTagText, { color: post.tagColor }]}>{post.tag}</Text>
          </View>
        </View>
        <Text style={styles.mockText}>{post.text}</Text>
        <View style={styles.mockActions}>
          <View style={styles.mockActionItem}>
            <Ionicons name="heart-outline" size={14} color="#888" />
            <Text style={styles.mockActionText}>{post.likes}</Text>
          </View>
          <View style={styles.mockActionItem}>
            <Ionicons name="chatbubble-outline" size={14} color="#888" />
            <Text style={styles.mockActionText}>{post.replies} replies</Text>
          </View>
        </View>
      </View>
      {/* Lock overlay */}
      <View style={styles.lockOverlay}>
        <Ionicons name="lock-closed" size={16} color="#fff" />
        <Text style={styles.lockText}>Coming Soon</Text>
      </View>
    </Animated.View>
  );
};

// ── Pulse Ring ───────────────────────────────────────────────────────────────
const PulseRing = ({ size, duration, delay, opacity }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(opacity)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.6, duration, delay, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, { toValue: 0, duration, delay, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: opacity, duration: 0, useNativeDriver: true }),
        ]),
      ])
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

// ── Main Screen ──────────────────────────────────────────────────────────────
const CommunityScreen = () => {
  const router = useRouter();
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroPop = useRef(new Animated.Value(0.7)).current;
  const badgeBounce = useRef(new Animated.Value(0)).current;
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(heroPop, { toValue: 1, friction: 5, tension: 55, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(badgeBounce, { toValue: -5, duration: 800, useNativeDriver: true }),
        Animated.timing(badgeBounce, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleNotify = () => {
    setNotified(true);
    Alert.alert(
      "🌾 You're on the list!",
      "We'll let you know as soon as Krishi Mittra Community launches. Thank you for your support!",
      [{ text: "Great, can't wait!", style: "default" }]
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
        <Text style={styles.headerTitle}>Community</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero ─────────────────────────────────────────── */}
        <View style={styles.heroBanner}>
          {/* Decorative blobs */}
          <View style={styles.bgBlob1} />
          <View style={styles.bgBlob2} />
          <View style={styles.bgBlob3} />

          {/* Pulse Icon */}
          <View style={styles.pulseCenter}>
            <PulseRing size={200} duration={2400} delay={0} opacity={0.22} />
            <PulseRing size={145} duration={2400} delay={600} opacity={0.32} />
            <PulseRing size={92} duration={2400} delay={1200} opacity={0.5} />
            <Animated.View
              style={[
                styles.heroIconCircle,
                { opacity: heroFade, transform: [{ scale: heroPop }] },
              ]}
            >
              <Ionicons name="people" size={46} color="#fff" />
            </Animated.View>
          </View>

          <Animated.View style={[styles.heroTextBlock, { opacity: heroFade }]}>
            <Animated.View
              style={[styles.comingSoonBadge, { transform: [{ translateY: badgeBounce }] }]}
            >
              <View style={styles.dotPulse} />
              <Text style={styles.comingSoonText}>COMING SOON</Text>
            </Animated.View>
            <Text style={styles.heroTitle}>Krishi Mittra{"\n"}Community</Text>
            <Text style={styles.heroSubtitle}>
              India's largest platform for farmers to connect, share knowledge,
              ask experts, and grow together.
            </Text>
          </Animated.View>

          {/* Floating stat pills inside hero */}
          <View style={styles.heroPillRow}>
            {[
              { icon: "people-outline", label: "10,000+ Farmers" },
              { icon: "chatbubbles-outline", label: "500+ Experts" },
              { icon: "leaf-outline", label: "20+ Crops" },
            ].map((p, i) => (
              <View key={i} style={styles.heroPill}>
                <Ionicons name={p.icon} size={13} color="#FFD54F" />
                <Text style={styles.heroPillText}>{p.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Peek at Posts ────────────────────────────────── */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionHeading}>Community Discussions</Text>
            <View style={styles.lockedBadge}>
              <Ionicons name="lock-closed" size={11} color="#F57C00" />
              <Text style={styles.lockedBadgeText}>Locked</Text>
            </View>
          </View>
          <Text style={styles.sectionSub}>
            A glimpse of what farmers will be discussing on launch day
          </Text>

          {MOCK_POSTS.map((post, i) => (
            <MockPostCard key={i} post={post} delay={i * 150} />
          ))}
        </View>

        {/* ── Feature Cards ────────────────────────────────── */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeading}>What's Coming</Text>
          <Text style={styles.sectionSub}>
            Features we're building just for you
          </Text>
          {FEATURES.map((item, i) => (
            <FeatureCard key={i} item={item} delay={i * 110} />
          ))}
        </View>

        {/* ── Numbers Strip ─────────────────────────────────── */}
        <View style={styles.statsRow}>
          {[
            { val: "10K+", label: "Farmers\nJoining" },
            { val: "500+", label: "Expert\nAgronomists" },
            { val: "18", label: "Indian\nLanguages" },
            { val: "Free", label: "Always\nFree" },
          ].map((s, i) => (
            <View key={i} style={[styles.statItem, i < 3 && styles.statBorder]}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── CTA ──────────────────────────────────────────── */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <View style={styles.ctaIconRow}>
              <View style={styles.ctaIconCircle}>
                <Ionicons name="people" size={28} color="#2E7D32" />
              </View>
            </View>
            <Text style={styles.ctaHeading}>Join the Waitlist</Text>
            <Text style={styles.ctaSub}>
              Be among the first farmers to access Krishi Mittra Community when
              we launch. Your feedback will shape how we build it.
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
                {notified ? "You're on the waitlist!" : "Notify Me on Launch"}
              </Text>
            </TouchableOpacity>

            <View style={styles.shareRow}>
              <TouchableOpacity style={styles.shareBtn}>
                <Ionicons name="share-social-outline" size={16} color="#2E7D32" />
                <Text style={styles.shareBtnText}>Share with Farmers</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.goBackLink} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={14} color="#aaa" />
            <Text style={styles.goBackText}> Back to Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Stylesheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F8F4" },

  // Header
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
    letterSpacing: 0.4,
  },

  scroll: { flex: 1 },

  // Hero
  heroBanner: {
    backgroundColor: "#1B5E20",
    paddingTop: 36,
    paddingBottom: 32,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  bgBlob1: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.04)",
    top: -80,
    right: -80,
  },
  bgBlob2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: -50,
    left: -40,
  },
  bgBlob3: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,213,79,0.06)",
    top: 20,
    left: 20,
  },
  pulseCenter: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  heroIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  heroTextBlock: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  comingSoonBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,213,79,0.18)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,213,79,0.35)",
  },
  dotPulse: {
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
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    lineHeight: 38,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  heroPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },

  // Section wrapper
  sectionWrap: {
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1B5E20",
  },
  sectionSub: {
    fontSize: 13,
    color: "#888",
    marginBottom: 18,
    lineHeight: 19,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF3E0",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#F57C00",
  },

  // Mock Post
  mockPost: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#F0F4F0",
  },
  mockPostContent: {
    padding: 14,
    opacity: 0.35,
  },
  mockPostHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  mockAvatar: {
    fontSize: 28,
  },
  mockName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A2E1A",
  },
  mockState: {
    fontSize: 11,
    color: "#888",
    marginTop: 1,
  },
  mockTag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  mockTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  mockText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 19,
    marginBottom: 10,
  },
  mockActions: {
    flexDirection: "row",
    gap: 14,
  },
  mockActionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mockActionText: {
    fontSize: 11,
    color: "#888",
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "rgba(27,94,32,0.45)",
  },
  lockText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  // Feature Cards
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
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
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: "#1B5E20",
    borderRadius: 20,
    paddingVertical: 22,
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
  statVal: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFD54F",
  },
  statLbl: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    textAlign: "center",
    lineHeight: 14,
  },

  // CTA Card
  ctaSection: {
    paddingHorizontal: 16,
    marginTop: 28,
    alignItems: "center",
  },
  ctaCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#1B5E20",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#E8F5E9",
    marginBottom: 16,
  },
  ctaIconRow: {
    marginBottom: 16,
  },
  ctaIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#C8E6C9",
  },
  ctaHeading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 8,
  },
  ctaSub: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
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
    marginBottom: 12,
  },
  notifyBtnDone: {
    backgroundColor: "#388E3C",
  },
  notifyBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
  shareRow: {
    width: "100%",
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E7D32",
  },
  goBackLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 4,
  },
  goBackText: {
    fontSize: 13,
    color: "#aaa",
    fontWeight: "600",
  },
});

export default CommunityScreen;
