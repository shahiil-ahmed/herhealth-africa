// ─── Polyfills — must be the very first imports ──────────────────────────────
// Fixes "URL.protocol is not implemented" on Hermes/React Native.
import 'react-native-url-polyfill/auto';

import React from 'react';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="dark" backgroundColor="#FAF9F6" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// and ensures the app works correctly in both Expo Go and standalone builds.
export default registerRootComponent(App);
