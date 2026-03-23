import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { requestNotificationPermissions } from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    // Proactively request notification permissions on launch
    requestNotificationPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="transparent" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
