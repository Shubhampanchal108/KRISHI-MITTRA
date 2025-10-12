import React from "react";
import HomeScreen from './app/Home'
import { View } from "react-native"
import Pest from './app/Pest'


const App = () => {
  return (
    <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
    <HomeScreen/>
    {/* <Pest></Pest> */}
    </View>
  );
};

export default App;