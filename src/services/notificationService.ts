import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { apiService } from './api';
import { secureStorage } from '../utils/secureStorage';
import { STORAGE_KEYS } from '../constants/api';

class NotificationService {
  constructor() {
    this.setupNotificationListeners();
  }

  public async requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('FCM: Authorization status:', authStatus);
      await this.getAndSendFCMToken();
    } else {
      console.log('FCM: User denied notifications permission');
    }
    return enabled;
  }

  public async getAndSendFCMToken() {
    try {
      console.log('FCM: Attempting to get and send FCM token...');
      let fcmToken = await secureStorage.getItem(STORAGE_KEYS.FCM_TOKEN);
      console.log('FCM: Stored FCM Token (if any):', fcmToken);

      if (!fcmToken) {
        console.log('FCM: No stored token found, fetching new token...');
        fcmToken = await messaging().getToken();
        if (fcmToken) {
          await secureStorage.setItem(STORAGE_KEYS.FCM_TOKEN, fcmToken);
          console.log('FCM: New FCM Token fetched and stored:', fcmToken);
          await this.sendFCMTokenToBackend(fcmToken);
        } else {
          console.log('FCM: Failed to get new FCM token.');
        }
      } else {
        console.log('FCM: Using existing FCM Token:', fcmToken);
        // Always attempt to send the token to the backend on app start if it exists
        // This ensures the backend has the latest active token for the user.
        await this.sendFCMTokenToBackend(fcmToken);
      }
    } catch (error) {
      console.error('FCM: Error getting or sending FCM token:', error);
    }
  }

  private async sendFCMTokenToBackend(token: string) {
    try {
      console.log('FCM: Attempting to send FCM token to backend:', token);
      await apiService.updateFCMToken(token);
      console.log('FCM: FCM token sent to backend successfully');
    } catch (error: any) { // Explicitly type error as 'any'
      console.error('FCM: Failed to send FCM token to backend:', error);
      if (error.response) {
        console.error('FCM: Backend error response:', error.response.data);
      }
    }
  }

  private setupNotificationListeners() {
    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground Message:', JSON.stringify(remoteMessage));
      // You can display a local notification here if needed
    });

    // Handle background/quit messages (when app is in background or closed)
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background Message:', JSON.stringify(remoteMessage));
      // Perform background tasks
    });

    // Handle notification opened from a quit state
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          JSON.stringify(remoteMessage),
        );
      }
    });

    // Handle notification opened from a background state
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        JSON.stringify(remoteMessage),
      );
    });

    // Handle token refresh
    messaging().onTokenRefresh(async token => {
      console.log('FCM Token Refreshed:', token);
      await secureStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
      await this.sendFCMTokenToBackend(token);
    });
  }
}

export const notificationService = new NotificationService();