import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, FontAwesome } from "@expo/vector-icons";
import NavTab from '../src/components/NavigationTab'
import HeaderTab from "../src/components/HeaderTab";
import {errorMsg, successMsg} from '../src/utils/Notification'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import FeedbackModal from "../src/components/Modal";
import EditProfileModal from "../src/components/EditProfile";

const Profile = () => {

  const Router = useRouter()

  const [modalVisible, setModalVisible] = React.useState(false);
  const [editModalVisible, setEditModalVisible] = React.useState(false);

  const [name, setName] = React.useState(`${AsyncStorage.getItem('name')}`);
  const [state, setState] = React.useState(`${AsyncStorage.getItem('state')}`);
  const [district, setDistrict] = React.useState(`${AsyncStorage.getItem('district')}`);
  const [password, setPassword] = React.useState('');

  const handleLogout = async()=>{
    try {
      AsyncStorage.removeItem('token');
      // AsyncStorage.removeItem('name');
      // AsyncStorage.removeItem('userId');
      // AsyncStorage.removeItem('phone');
      // AsyncStorage.removeItem('state');
      // AsyncStorage.removeItem('district');

      successMsg("Logout Succesfully.")
      setTimeout(()=>{
        Router.push('/login')
      }, 1000)

    } catch (error) {
      errorMsg("Opps! something went wrong.")
      console.log(error)
    }
  }
  return (
    <>
    <HeaderTab/>
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>


        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={require("../assets/images/farmer.webp")} // apni image path lagao
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{AsyncStorage.getItem('name')}</Text>
            <TouchableOpacity onPress={()=>setEditModalVisible(true)}>
              <Text style={styles.editProfile}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>

          <TouchableOpacity style={styles.linkItem}>
            <Ionicons name="qr-code-outline" size={20} color="#333" />
            <Text style={styles.linkText}>Subscribe</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <MaterialIcons name="article" size={20} color="#333" />
            <Text style={styles.linkText}>News</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <FontAwesome5 name="university" size={18} color="#333" />
            <Text style={styles.linkText}>Government Schemes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem} onPress={() => setModalVisible(true)}>
            <FontAwesome name="newspaper-o" size={18} color="#333" />
            <Text style={styles.linkText}>Feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <Ionicons name="leaf-outline" size={20} color="#333" />
            <Text style={styles.linkText}>Soil Data</Text>
          </TouchableOpacity>
        </View>

        {/* My Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Others Links</Text>

          <TouchableOpacity style={styles.linkItem}>
            <FontAwesome5 name="shield-alt" size={18} color="#333" />
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem} onPress={handleLogout}>
            <FontAwesome5 name="exclamation" size={18} color="#333" />
            <Text style={styles.linkText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <FeedbackModal visible={modalVisible} onClose={() => setModalVisible(false)} onSubmit={(feedback) => console.log(feedback)} />

          <EditProfileModal
            visible={editModalVisible}
            onClose={() => setEditModalVisible(false)}
            onSubmit={(data) => console.log(data)}
            initialData={{
              name: AsyncStorage.getItem('name'),
              state: AsyncStorage.getItem('state'),
              district: AsyncStorage.getItem('district'),
              password: AsyncStorage.getItem('password'),
            }}
          />
      </ScrollView>

      {/* Bottom Navigation */}
    </View>
      <NavTab/>
      </>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    paddingHorizontal: 15,
    width : '100%',
    // marginTop: 50,
  },
  header: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 10,
    color: "#222",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    backgroundColor: "#cbedc9ff",
    padding: 15,
    borderRadius: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
  },
  editProfile: {
    fontSize: 14,
    color: "#1a8f4b",
    marginTop: 2,
  },
  coinContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinBadge: {
    backgroundColor: "#0a8f47",
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  coinText: {
    color: "#fff",
    fontWeight: "bold",
  },
  coinValue: {
    marginLeft: 5,
    fontWeight: "600",
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },
  linkText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  badge: {
    backgroundColor: "#e53935",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 2,
    color: "#666",
  },
  activeNav: {
    backgroundColor: "#e6f5ec",
    borderRadius: 20,
    paddingHorizontal: 10,
  },
});
