import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen       from '../screens/Auth/LoginScreen';
import RegisterScreen    from '../screens/Auth/RegisterScreen';
import PhoneLoginScreen  from '../screens/Auth/PhoneLoginScreen';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="PhoneLogin"  // Start with phone login
    >
      <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
      <Stack.Screen name="Login"      component={LoginScreen} />
      <Stack.Screen name="Register"   component={RegisterScreen} />
    </Stack.Navigator>
  );
}
