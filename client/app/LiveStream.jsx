import React from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView, Text } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
// import { Camera } from 'expo-camera';

const VideoCallScreen = () => {
  return (
    <View style={styles.container}>
      {/* Fullscreen Camera Preview */}
      {/* <Camera style={styles.cameraView} type={Camera.Constants.Type.front} /> */}
      <Text>Hello</Text>

      {/* Bottom Navbar */}
      <SafeAreaView style={styles.navbar}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="camera-reverse-outline" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconButton, styles.endButton]}>
          <MaterialIcons name="call-end" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Feather name="video-off" size={26} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraView: {
    flex: 1,
    width: '100%',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iconButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 50,
  },
  endButton: {
    backgroundColor: '#E53935',
  },
});

export default VideoCallScreen;
