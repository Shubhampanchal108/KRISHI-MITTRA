import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  Animated,
  RefreshControl,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import NavigationTab from '../src/components/NavigationTab';
import { fetchMandiPrices, groupByMarket, POPULAR_CROPS, INDIAN_STATES } from '../src/services/Market';

// ─── Color Palette ────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#1B8A4B',
  primaryLight: '#E8F5EE',
  primaryDark: '#0D5C31',
  accent: '#F59E0B',
  accentLight: '#FEF3C7',
  red: '#EF4444',
  redLight: '#FEE2E2',
  bg: '#F6FAF8',
  card: '#FFFFFF',
  text: '#1A2E22',
  subtext: '#6B7B72',
  border: '#D4E8DC',
  gradient1: '#22C55E',
  gradient2: '#16A34A',
};

// ─── Crop Emoji Map ───────────────────────────────────────────────────────────
const CROP_EMOJI = {
  Wheat: '🌾', Rice: '🍚', Onion: '🧅', Tomato: '🍅', Potato: '🥔',
  Cotton: '☁️', Mustard: '🌼', Maize: '🌽', Soyabean: '🫘', Bajra: '🌾',
  Jowar: '🌾', 'Arhar (Tur)': '🫘', Gram: '🫘', Sugarcane: '🎋', All: '🛒',
};

// ─── Sort Modes ────────────────────────────────────────────────────────────────
const SORT_MODES = [
  { key: 'market', label: 'Name', icon: 'sort-alphabetical-ascending' },
  { key: 'price_asc', label: 'Price ↑', icon: 'trending-up' },
  { key: 'price_desc', label: 'Price ↓', icon: 'trending-down' },
];

export default function MandiScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedState, setSelectedState] = useState('Haryana');
  const [mandiData, setMandiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortMode, setSortMode] = useState('market');
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [expandedMarket, setExpandedMarket] = useState(null);
  const [error, setError] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const commodity = selectedCrop === 'All' ? '' : selectedCrop;
      const records = await fetchMandiPrices({
        state: selectedState,
        commodity,
        limit: 200,
      });

      const grouped = groupByMarket(records);
      setMandiData(grouped);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    } catch (e) {
      setError('Could not fetch mandi data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCrop, selectedState]);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    loadData();
  }, [loadData]);

  // ─── Filter & Sort ─────────────────────────────────────────────────────────
  const filteredData = mandiData
    .filter((m) => {
      if (!searchText) return true;
      const q = searchText.toLowerCase();
      return (
        m.market?.toLowerCase().includes(q) ||
        m.district?.toLowerCase().includes(q) ||
        m.entries?.some((e) => e.commodity?.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortMode === 'market') return a.market?.localeCompare(b.market || '');
      const aModal = a.entries[0]?.modalPrice || 0;
      const bModal = b.entries[0]?.modalPrice || 0;
      return sortMode === 'price_asc' ? aModal - bModal : bModal - aModal;
    });

  // ─── Price trend indicator ─────────────────────────────────────────────────
  const getPriceTrend = (min, max, modal) => {
    if (!modal) return null;
    const range = max - min;
    const pos = modal - min;
    if (range === 0) return 'stable';
    const ratio = pos / range;
    if (ratio > 0.6) return 'high';
    if (ratio < 0.4) return 'low';
    return 'stable';
  };

  // ─── Render Crop Tab ──────────────────────────────────────────────────────
  const renderCropTab = (crop) => {
    const isActive = crop === selectedCrop;
    return (
      <TouchableOpacity
        key={crop}
        onPress={() => setSelectedCrop(crop)}
        style={[styles.cropTab, isActive && styles.cropTabActive]}
        activeOpacity={0.7}
      >
        <Text style={styles.cropEmoji}>{CROP_EMOJI[crop] || '🌱'}</Text>
        <Text style={[styles.cropTabText, isActive && styles.cropTabTextActive]}>
          {crop}
        </Text>
      </TouchableOpacity>
    );
  };

  // ─── Render Entry Row ─────────────────────────────────────────────────────
  const renderEntry = (entry, idx) => {
    const trend = getPriceTrend(entry.minPrice, entry.maxPrice, entry.modalPrice);
    const trendColor = trend === 'high' ? COLORS.primary : trend === 'low' ? COLORS.red : COLORS.accent;
    const trendIcon = trend === 'high' ? 'trending-up' : trend === 'low' ? 'trending-down' : 'remove';

    return (
      <View key={idx} style={styles.entryRow}>
        <View style={{ flex: 1.2 }}>
          <Text style={styles.entryName}>{entry.commodity}</Text>
          {entry.variety ? (
            <Text style={styles.entryVariety}>{entry.variety}</Text>
          ) : null}
          {entry.arrivalDate ? (
            <Text style={styles.entryDate}>📅 {entry.arrivalDate}</Text>
          ) : null}
        </View>

        <View style={styles.priceBlock}>
          <Text style={styles.modalPriceLabel}>Modal</Text>
          <Text style={styles.modalPrice}>₹{entry.modalPrice.toLocaleString('en-IN')}</Text>
          <Text style={styles.priceRange}>
            ₹{entry.minPrice.toLocaleString('en-IN')} – ₹{entry.maxPrice.toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={[styles.trendBadge, { backgroundColor: trendColor + '20' }]}>
          <MaterialCommunityIcons name={trendIcon} size={18} color={trendColor} />
        </View>
      </View>
    );
  };

  // ─── Render Mandi Card ────────────────────────────────────────────────────
  const renderMandiCard = ({ item, index }) => {
    const isExpanded = expandedMarket === item.market;
    const firstEntry = item.entries[0];
    const minModal = Math.min(...item.entries.map((e) => e.modalPrice).filter(Boolean));
    const maxModal = Math.max(...item.entries.map((e) => e.modalPrice).filter(Boolean));
    const cropCount = item.entries.length;

    return (
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setExpandedMarket(isExpanded ? null : item.market)}
          activeOpacity={0.85}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <FontAwesome5 name="store" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.marketName}>{item.market}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={12} color={COLORS.subtext} />
                <Text style={styles.metaText}>{item.district}, {item.state}</Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              <View style={styles.cropCountBadge}>
                <Text style={styles.cropCountText}>{cropCount} crops</Text>
              </View>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={COLORS.subtext}
                style={{ marginTop: 4 }}
              />
            </View>
          </View>

          {/* Price Summary Row */}
          {!isExpanded && firstEntry ? (
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Min Price</Text>
                <Text style={styles.summaryValue}>₹{minModal.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Max Price</Text>
                <Text style={styles.summaryValueHighlight}>₹{maxModal.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Today</Text>
                <Text style={styles.summaryDate}>{firstEntry.arrivalDate || 'N/A'}</Text>
              </View>
            </View>
          ) : null}
        </TouchableOpacity>

        {/* Expanded Entries */}
        {isExpanded && (
          <View style={styles.expandedContainer}>
            <View style={styles.entryHeader}>
              <Text style={[styles.entryHeaderText, { flex: 1.2 }]}>Crop</Text>
              <Text style={[styles.entryHeaderText, { flex: 1 }]}>Price (₹/Qtl)</Text>
              <Text style={styles.entryHeaderText}>Trend</Text>
            </View>
            {item.entries.map((e, i) => renderEntry(e, i))}
          </View>
        )}
      </Animated.View>
    );
  };

  // ─── Stats Banner ─────────────────────────────────────────────────────────
  const renderStatsBanner = () => {
    const totalCrops = [...new Set(mandiData.flatMap((m) => m.entries.map((e) => e.commodity)))].length;
    return (
      <View style={styles.statsBanner}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{filteredData.length}</Text>
          <Text style={styles.statLabel}>Mandis</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalCrops}</Text>
          <Text style={styles.statLabel}>Crops</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{selectedState.split(' ')[0]}</Text>
          <Text style={styles.statLabel}>State</Text>
        </View>
      </View>
    );
  };

  // ─── State Picker Modal ────────────────────────────────────────────────────
  const renderStateModal = () => (
    <Modal
      visible={stateModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setStateModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setStateModalVisible(false)}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Select State</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {INDIAN_STATES.map((state) => (
              <TouchableOpacity
                key={state}
                style={[
                  styles.stateOption,
                  selectedState === state && styles.stateOptionActive,
                ]}
                onPress={() => {
                  setSelectedState(state);
                  setStateModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.stateOptionText,
                    selectedState === state && styles.stateOptionTextActive,
                  ]}
                >
                  {state}
                </Text>
                {selectedState === state && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🌾 Mandi Bhav</Text>
          <Text style={styles.headerSubtitle}>Live crop prices across India</Text>
        </View>
        <TouchableOpacity
          style={styles.stateSelector}
          onPress={() => setStateModalVisible(true)}
        >
          <Ionicons name="location" size={14} color={COLORS.primary} />
          <Text style={styles.stateSelectorText}>{selectedState}</Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ──────────────────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.subtext} />
        <TextInput
          placeholder="Search mandi, district or crop..."
          style={styles.searchInput}
          placeholderTextColor={COLORS.subtext}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.subtext} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Crop Filter Tabs ─────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.cropTabsScroll}
        contentContainerStyle={styles.cropTabsContent}
      >
        {POPULAR_CROPS.map(renderCropTab)}
      </ScrollView>

      {/* ── Sort Row ────────────────────────────────────────────────────── */}
      <View style={styles.sortRow}>
        {SORT_MODES.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            style={[styles.sortBtn, sortMode === mode.key && styles.sortBtnActive]}
            onPress={() => setSortMode(mode.key)}
          >
            <MaterialCommunityIcons
              name={mode.icon}
              size={14}
              color={sortMode === mode.key ? COLORS.primary : COLORS.subtext}
            />
            <Text
              style={[
                styles.sortBtnText,
                sortMode === mode.key && styles.sortBtnTextActive,
              ]}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => loadData()} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Stats Banner ─────────────────────────────────────────────────── */}
      {!loading && mandiData.length > 0 && renderStatsBanner()}

      {/* ── Main List ────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching live mandi prices...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={{ fontSize: 40 }}>😕</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadData()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredData.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ fontSize: 40 }}>📭</Text>
          <Text style={styles.emptyText}>No mandi data found</Text>
          <Text style={styles.emptySubText}>Try changing the crop or state filter</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.market + item.district}
          renderItem={renderMandiCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      )}

      {renderStateModal()}
      <NavigationTab />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ── Layout ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: COLORS.bg,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 1,
  },
  stateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stateSelectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    maxWidth: 80,
  },

  // ── Search ──────────────────────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text,
  },

  // ── Crop Tabs ────────────────────────────────────────────────────────────
  cropTabsScroll: {
    marginBottom: 10,
  },
  cropTabsContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  cropTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  cropTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cropEmoji: {
    fontSize: 14,
  },
  cropTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.subtext,
  },
  cropTabTextActive: {
    color: '#fff',
  },

  // ── Sort Row ─────────────────────────────────────────────────────────────
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.subtext,
  },
  sortBtnTextActive: {
    color: COLORS.primary,
  },
  refreshBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // ── Stats Banner ─────────────────────────────────────────────────────────
  statsBanner: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.subtext,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },

  // ── List ─────────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  // ── Mandi Card ────────────────────────────────────────────────────────────
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  cardIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  marketName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.subtext,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cropCountBadge: {
    backgroundColor: COLORS.accentLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cropCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },

  // ── Summary Row ──────────────────────────────────────────────────────────
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.bg,
    marginTop: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: COLORS.subtext,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  summaryValueHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryDate: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.subtext,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },

  // ── Expanded Entries ──────────────────────────────────────────────────────
  expandedContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.bg,
  },
  entryHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 4,
  },
  entryHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg,
  },
  entryName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  entryVariety: {
    fontSize: 11,
    color: COLORS.subtext,
    marginTop: 1,
  },
  entryDate: {
    fontSize: 10,
    color: COLORS.subtext,
    marginTop: 2,
  },
  priceBlock: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  modalPriceLabel: {
    fontSize: 9,
    color: COLORS.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  priceRange: {
    fontSize: 10,
    color: COLORS.subtext,
    marginTop: 1,
  },
  trendBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── State Modal ───────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  stateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  stateOptionActive: {
    backgroundColor: COLORS.primaryLight,
  },
  stateOptionText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  stateOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // ── States ────────────────────────────────────────────────────────────────
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.subtext,
    fontWeight: '500',
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.red,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 5,
    textAlign: 'center',
  },
});