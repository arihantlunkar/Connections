import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/Home';
import UploadScreen from './screens/Upload';
import FilterScreen from './screens/Filter';
import ImageSliderScreen from './screens/ImageSlider';
import LoginScreen from './screens/Login';

export default App = () => {

  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer initialRouteName="Login">
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} key="Login" /> 
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} key="Home"/> 
        <Stack.Screen name="Filter" component={FilterScreen} options={{ headerBackVisible: false}} key="Filter" />
        <Stack.Screen name="Upload" component={UploadScreen} key="Upload"  />
        <Stack.Screen name="ImageSlider" component={ImageSliderScreen} options={{ headerShown: false}} key="ImageSlider"  />
      </Stack.Navigator>
    </NavigationContainer>
  )
}