import React, {Suspense, useEffect} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {getAuth, onAuthStateChanged} from '@react-native-firebase/auth';
import {useSelector, useDispatch} from '../../redux/store';
import {setUser} from '../../redux/auth/authSlice';
import type {RootStackParamList} from '../types';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Fallback() {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#05aeff" />
    </View>
  );
}

export default function Navigation() {
  const dispatch = useDispatch();
  const {user, isInitialized} = useSelector(state => state.auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), firebaseUser => {
      if (firebaseUser) {
        dispatch(
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          }),
        );
      } else {
        dispatch(setUser(null));
      }
    });
    return unsubscribe;
  }, [dispatch]);

  if (!isInitialized) {
    return <Fallback />;
  }

  return (
    <NavigationContainer>
      <Suspense fallback={<Fallback />}>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {user ? (
            <Stack.Screen name="App" component={AppStack} />
          ) : (
            <Stack.Screen name="Auth" component={AuthStack} />
          )}
        </Stack.Navigator>
      </Suspense>
    </NavigationContainer>
  );
}
