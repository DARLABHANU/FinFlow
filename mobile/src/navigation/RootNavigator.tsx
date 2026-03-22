import React from 'react';
import { View, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../store/authStore';
import { THEME } from '../theme/theme';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/app/DashboardScreen';
import AnalyticsScreen from '../screens/app/AnalyticsScreen';
import TransactionHistoryScreen from '../screens/app/TransactionHistoryScreen';
import SettingsScreen from '../screens/app/SettingsScreen';
import AddTransactionScreen from '../screens/app/AddTransactionScreen';
import ScannerScreen from '../screens/app/ScannerScreen';
import ProfileScreen from '../screens/app/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: THEME.colors.surface,
          borderTopWidth: 1,
          borderTopColor: THEME.colors.border,
          height: Platform.OS === 'ios' ? 88 : 74,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: THEME.colors.secondary,
        tabBarInactiveTintColor: THEME.colors.textTertiary,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = 'grid-view';
          else if (route.name === 'AnalyticsTab') iconName = 'insights';
          else if (route.name === 'HistoryTab') iconName = 'list-alt';
          else if (route.name === 'SettingsTab') iconName = 'tune';
          
          return (
            <View style={[styles.tabIconWrapper, focused && styles.activeTabBg]}>
               <MaterialIcons name={iconName} size={24} color={color} />
            </View>
          );
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 }
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="AnalyticsTab" component={AnalyticsScreen} options={{ title: 'Insights' }} />
      <Tab.Screen name="HistoryTab" component={TransactionHistoryScreen} options={{ title: 'Logs' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="AppHome" component={TabNavigator} />
            <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Scanner" component={ScannerScreen} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = Object.create({
  tabIconWrapper: { width: 50, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  activeTabBg: { backgroundColor: `${THEME.colors.secondary}10` }
});
