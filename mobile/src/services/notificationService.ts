import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications should handle when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  
  return true;
}

export async function notifyTransaction(type: string, amount: number, category: string, symbol: string = '₹') {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: type === 'Income' ? '💰 Money In!' : '💸 Money Out!',
      body: `${type === 'Income' ? 'Received' : 'Spent'} ${symbol}${amount.toLocaleString()} for ${category}`,
      data: { type, amount, category },
      sound: true,
    },
    trigger: null, // show immediately
  });
}
