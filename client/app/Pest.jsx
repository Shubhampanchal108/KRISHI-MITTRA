import React from 'react'
import HeaderTab from '../src/components/HeaderTab'
import NavigationTab from '../src/components/NavigationTab'
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native'
import AIAdviceCard from '@/src/components/AIAdvise'

const Pest = () => {
  return (
    <>
    <HeaderTab/>
<ScrollView>
    {/* <Text className={styles.adviceTitle}>Detect Pests and Desieases</Text> */}
    <View  style={styles.adviceContainer}>
              <Text style={styles.adviceTitle}>Detect Pests and Dieases</Text>
              <Text style={styles.adviceSubtitle}>
                Upload or click an image to detect pest/disease and get instant
                advice.
              </Text>
    
              <TouchableOpacity
                style={styles.adviceButton}
                onPress={() => alert("Opening Camera / Gallery...")}
              >
                <Text style={styles.adviceButtonText}>📷 Upload</Text>
              </TouchableOpacity>

            </View>
            <View style={styles.adviceCard}><AIAdviceCard/></View>
              
            </ScrollView>
    <NavigationTab/>
    </>
  )
}

export default Pest

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 13,
  },
  
adviceCard:{
    margin:13,
},
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
  },
  tabItem: {
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    color: "#777",
  },
  adviceContainer: {
    backgroundColor: "#F0FAF3",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    height: "220",
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 5,
  },
  adviceSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
  },
  adviceButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  adviceButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    margin: 16,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 12,
    borderRadius: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
    textAlign: "center",
  },
});