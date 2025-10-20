import React from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For search icon
import NavigationTab from '../src/components/NavigationTab';

const mandiData = [
  {
    id: '1',
    name: 'Kaithal',
    distance: '1 km',
    price: '₹700 - ₹1350',
    date: '09 Oct • 100 kg',
    isDown: true,
  },
  {
    id: '2',
    name: 'Pehowa',
    distance: '28 km',
    price: '₹2100 - ₹2400',
    date: '08 Oct • 100 kg',
    isDown: false,
  },
  {
    id: '3',
    name: 'Kaithal',
    distance: '1 km',
    price: '₹700 - ₹1350',
    date: '09 Oct • 100 kg',
    isDown: true,
  },
  {
    id: '4',
    name: 'Pehowa',
    distance: '28 km',
    price: '₹2100 - ₹2400',
    date: '08 Oct • 100 kg',
    isDown: false,
  },
  {
    id: '5',
    name: 'Kaithal',
    distance: '1 km',
    price: '₹700 - ₹1350',
    date: '09 Oct • 100 kg',
    isDown: true,
  },
  {
    id: '6',
    name: 'Pehowa',
    distance: '28 km',
    price: '₹2100 - ₹2400',
    date: '08 Oct • 100 kg',
    isDown: false,
  },
  {
    id: '7',
    name: 'Kaithal',
    distance: '1 km',
    price: '₹700 - ₹1350',
    date: '09 Oct • 100 kg',
    isDown: true,
  },
  {
    id: '8',
    name: 'Pehowa',
    distance: '28 km',
    price: '₹2100 - ₹2400',
    date: '08 Oct • 100 kg',
    isDown: false,
  },
];

export default function MandiScreen() {
  return (
    <>
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" />
        <TextInput
          placeholder="Search by Mandi/District/State"
          style={styles.searchInput}
          placeholderTextColor="#999"
        />
      </View>

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>
          18 Mandi <Text style={{ color: '#00A650' }}>Within 150 km</Text>
        </Text>
        <Ionicons name="chevron-down" size={18} color="#000" />
      </View>

      {/* Sort Buttons */}
      <View style={styles.sortRow}>
        <TouchableOpacity style={[styles.sortButton, styles.activeSort]}>
          <Ionicons name="location-outline" size={16} color="#00A650" />
          <Text style={[styles.sortText, { color: '#00A650' }]}>Sort by Distance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>₹ Sort by Price</Text>
        </TouchableOpacity>
      </View>

      {/* Mandi List */}
      <FlatList
        data={mandiData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mandiName}>{item.name}</Text>
              <Text style={styles.distance}>{item.distance}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.price}>
                {item.price}
                {item.isDown && <Text style={styles.priceDown}> ↓</Text>}
              </Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          </View>
        )}
      />
    </View>
    <NavigationTab/>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#000',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    width: 140,
    gap: 10,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  activeSort: {
    backgroundColor: '#E8F9EF',
    borderColor: '#00A650',
  },
  sortText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  mandiName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  distance: {
    fontSize: 13,
    color: '#777',
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  priceDown: {
    color: 'red',
  },
  date: {
    fontSize: 12,
    color: '#777',
  },
  followBtn: {
    backgroundColor: '#00A650',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  followText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  prevPrices: {
    color: '#00A650',
    fontSize: 12,
    marginTop: 4,
  },
});