import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { apiService } from './api';
import { secureStorage } from '../utils/secureStorage';
import { STORAGE_KEYS } from '../constants/api';

class NotificationService {
  constructor() {
    this.setupNotificationListeners();
  }

  public async checkPermissionStatus(): Promise<boolean> {
    try {
      const authStatus = await messaging().hasPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      return false;
    }
  }

  public async requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await this.getAndSendFCMToken();
    } else {
    }
    return enabled;
  }

  public async getAndSendFCMToken() {
    try {
      let fcmToken = await secureStorage.getItem(STORAGE_KEYS.FCM_TOKEN);

      if (!fcmToken) {
        fcmToken = await messaging().getToken();
        if (fcmToken) {
          await secureStorage.setItem(STORAGE_KEYS.FCM_TOKEN, fcmToken);
          await this.sendFCMTokenToBackend(fcmToken);
        } else {
        }
      } else {
        // Always attempt to send the token to the backend on app start if it exists
        // This ensures the backend has the latest active token for the user.
        await this.sendFCMTokenToBackend(fcmToken);
      }
    } catch (error) {
    }
  }

  private async sendFCMTokenToBackend(token: string) {
    try {
      await apiService.updateFCMToken(token);
    } catch (error: any) { // Explicitly type error as 'any'
    }
  }

  private setupNotificationListeners() {
    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {
      // You can display a local notification here if needed
    });

    // Handle background/quit messages (when app is in background or closed)
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      // Perform background tasks
    });

    // Handle notification opened from a quit state
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
      }
    });

    // Handle notification opened from a background state
    messaging().onNotificationOpenedApp(remoteMessage => {
    });

    // Handle token refresh
    messaging().onTokenRefresh(async token => {
      await secureStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
      await this.sendFCMTokenToBackend(token);
    });
  }
}

export const notificationService = new NotificationService();