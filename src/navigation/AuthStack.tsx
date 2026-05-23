import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {AuthStackParamList} from '../types';

const LoginScreen = React.lazy(() => import('../screen/auth/LoginScreen'));
const SignupScreen = React.lazy(() => import('../screen/auth/SignupScreen'));

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginScreen as any} />
      <Stack.Screen name="Signup" component={SignupScreen as any} />
    </Stack.Navigator>
  );
}
