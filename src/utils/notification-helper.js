import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, DeviceEventEmitter } from 'react-native';
import client from '../api/client'; // using existing client
import { showMessage } from 'react-native-flash-message';
import { router } from 'expo-router';

export async function requestUserPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      console.log('Android 13+ Notification Permission Status:', granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Error requesting Android notification permission:', err);
      return false;
    }
  }

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return true;
  }
  return false;
}

export async function getFcmToken(currentUserToken) {
  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('Your Firebase Token is:', fcmToken);
      // Send token to backend
      if (currentUserToken) {
          await updateTokenInBackend(fcmToken, currentUserToken);
      } else {
          console.log('User not logged in, skipping backend sync');
      }
    } else {
      console.log('Failed', 'No token received');
    }
  } catch (error) {
    console.log('Error getting token:', error);
  }
}

async function updateTokenInBackend(fcmToken, jwtToken) {
    try {
        const tokenString = typeof jwtToken === 'string' ? jwtToken : (jwtToken?.token || JSON.stringify(jwtToken));
        
        console.log(`Syncing FCM Token. Token length: ${tokenString?.length}`);

        await client.patch('/user/fcm-token', {
            fcmToken: fcmToken
        }, {
            headers: { 
                'Authorization': `Bearer ${tokenString}`,
                'x-access-token': tokenString
            }
        });
        console.log("FCM Token synced with backend successfully");
    } catch (error) {
        console.error("Backend sync failed for FCM token");
    }
}

export function notificationListener() {
  // 1. Background/Quit Notification Handler
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage.notification,
    );
    router.push('NotificationScreen');
  });

  // 2. Quit State Handler
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );
        setTimeout(() => {
          router.push('NotificationScreen');
        }, 1000);
      }
    });

  // 3. Foreground State Handler
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
    
    // Auto-refresh logic: Emit event to listeners (HomeScreen, TimetableScreen, etc.)
    const { type } = remoteMessage.data || {};
    DeviceEventEmitter.emit('REFRESH_DATA', { type });

    const { notification } = remoteMessage;
    if (notification) {
      showMessage({
        message: notification.title || 'New Update',
        description: notification.body || 'You have a new notification.',
        type: "info",
        backgroundColor: "#023c69", // App primary color
        color: "#ffffff",
        onPress: () => {
          router.push('NotificationScreen');
        },
        duration: 4000,
        floating: true,
        icon: "info",
        statusBarTranslucent: true,
        titleStyle: { fontWeight: 'bold' },
        textStyle: { fontSize: 14 }
      });
    }
  });

  return unsubscribe;
}
