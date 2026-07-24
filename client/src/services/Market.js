import axios from 'axios';

// data.gov.in API for current daily price of various commodities from various markets
// Dataset: Current Daily Price of Various Commodities from Various Markets Mandi
const DATA_GOV_API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aab0bf04a59e0d3cb97';
const DATA_GOV_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

/**
 * Fetch mandi prices from data.gov.in
 * @param {string} state - State name (e.g., "Haryana", "Punjab")
 * @param {string} commodity - Crop/commodity name (e.g., "Wheat", "Rice")
 * @param {number} limit - Number of records to fetch
 */
export const fetchMandiPrices = async ({ state = '', commodity = '', district = '', limit = 100 } = {}) => {
  try {
    const params = {
      'api-key': DATA_GOV_API_KEY,
      format: 'json',
      limit,
    };

    if (state) params['filters[state]'] = state;
    if (commodity) params['filters[commodity]'] = commodity;
    if (district) params['filters[district]'] = district;

    const response = await axios.get(DATA_GOV_BASE_URL, { params });
    const records = response.data?.records || [];
    return records;
  } catch (error) {
    console.error('Mandi API error:', error?.message);
    return [];
  }
};

/**
 * Fetch distinct commodities from a state
 */
export const fetchCommodities = async (state = 'Haryana') => {
  try {
    const records = await fetchMandiPrices({ state, limit: 500 });
    const commodities = [...new Set(records.map((r) => r.commodity).filter(Boolean))].sort();
    return commodities;
  } catch {
    return [];
  }
};

/**
 * Group mandi records by market/city for display
 */
export const groupByMarket = (records) => {
  const grouped = {};
  records.forEach((record) => {
    const key = record.market || record.district;
    if (!key) return;
    if (!grouped[key]) {
      grouped[key] = {
        market: key,
        district: record.district || '',
        state: record.state || '',
        entries: [],
      };
    }
    grouped[key].entries.push({
      commodity: record.commodity,
      variety: record.variety,
      minPrice: parseFloat(record.min_price) || 0,
      maxPrice: parseFloat(record.max_price) || 0,
      modalPrice: parseFloat(record.modal_price) || 0,
      arrivalDate: record.arrival_date,
    });
  });
  return Object.values(grouped);
};

// Popular Indian crops for filter tabs
export const POPULAR_CROPS = [
  'All',
  'Wheat',
  'Rice',
  'Onion',
  'Tomato',
  'Potato',
  'Cotton',
  'Mustard',
  'Maize',
  'Soyabean',
  'Bajra',
  'Jowar',
  'Arhar (Tur)',
  'Gram',
  'Sugarcane',
];

// Popular Indian states
export const INDIAN_STATES = [
  'Haryana',
  'Punjab',
  'Uttar Pradesh',
  'Rajasthan',
  'Madhya Pradesh',
  'Maharashtra',
  'Gujarat',
  'Bihar',
  'West Bengal',
  'Andhra Pradesh',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'Odisha',
  'Himachal Pradesh',
];
