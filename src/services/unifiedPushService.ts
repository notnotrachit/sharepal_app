import ExpoUnifiedPush, {
  checkPermissions,
  requestPermissions,
  showLocalNotification,
} from 'expo-unified-push';
import { subscribeDistributorMessages } from "expo-unified-push";
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiService } from './api';
import { secureStorage } from '../utils/secureStorage';
import { STORAGE_KEYS } from '../constants/api';

class UnifiedPushService {
  private unsubscribe: (() => void) | null = null;
  private SERVER_VAPID_KEY: string | undefined;

  constructor() {
    this.SERVER_VAPID_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_SERVER_VAPID_KEY;
    this.setupNotificationListeners();
  }

  public async checkPermissionStatus(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        // UnifiedPush only works on Android
        return false;
      }
      return await checkPermissions();
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  public async requestUserPermission(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        // UnifiedPush only works on Android
        return false;
      }

      const granted = await checkPermissions();
      if (granted) {
        await this.registerDevice();
        return true;
      } else {
        const state = await requestPermissions();
        if (state === 'granted') {
          await this.registerDevice();
          return true;
        } else {
          return false;
        }
      }
    } catch (error) {
      return false;
    }
  }

  public async registerDevice() {
    try {
      if (!this.SERVER_VAPID_KEY) {
        throw new Error('SERVER_VAPID_KEY is not set in environment variables');
      }

      if (Platform.OS !== 'android') {
        return;
      }

      // Check if a distributor is already saved
      const savedDistributor = ExpoUnifiedPush.getSavedDistributor();
      // console.log('Saved UnifiedPush distributor:', savedDistributor);
      const distributors = ExpoUnifiedPush.getDistributors();
      console.log('number of available UnifiedPush distributors:', distributors.length);
      console.log(distributors[0].name)
      // ExpoUnifiedPush.saveDistributor(distributors[0]?.id || null);

      if (!savedDistributor) {
        // Auto-select the first available distributor
        const distributors = ExpoUnifiedPush.getDistributors();
        console.log('Available UnifiedPush distributors:', distributors);
        if (distributors.length > 0) {
          // Prefer internal distributor if available, otherwise use the first one
          const preferredDistributor = distributors.find(d => d.isInternal) || distributors[0];
          ExpoUnifiedPush.saveDistributor(preferredDistributor.id);
          console.log('Auto-selected distributor:', preferredDistributor.name);
        } else {
          console.warn('No UnifiedPush distributors available. Please install a distributor app.');
          return;
        }
      }

      await ExpoUnifiedPush.registerDevice(this.SERVER_VAPID_KEY);
      console.log('UnifiedPush device registration initiated');
    } catch (error) {
      console.error('Error registering device:', error);
    }
  }

  public async unregisterDevice() {
    try {
      if (Platform.OS !== 'android') {
        return;
      }

      await ExpoUnifiedPush.unregisterDevice();
      
      // Clear stored push data
      await secureStorage.removeItem(STORAGE_KEYS.PUSH_ENDPOINT);
      await secureStorage.removeItem(STORAGE_KEYS.PUSH_KEYS);
      
      console.log('UnifiedPush device unregistered');
    } catch (error) {
      console.error('Error unregistering device:', error);
    }
  }

  private async sendPushRegistrationToBackend(registrationData: {
    endpoint: string;
    keys: { auth: string; p256dh: string };
  }) {
    try {
      await apiService.updatePushSubscription(registrationData);
      
      // Store the registration data locally
      await secureStorage.setItem(STORAGE_KEYS.PUSH_ENDPOINT, registrationData.endpoint);
      await secureStorage.setItem(STORAGE_KEYS.PUSH_KEYS, JSON.stringify(registrationData.keys));
      
      console.log('Push subscription sent to backend successfully');
    } catch (error) {
      console.error('Error sending push subscription to backend:', error);
    }
  }

  private async removePushRegistrationFromBackend() {
    try {
      const endpoint = await secureStorage.getItem(STORAGE_KEYS.PUSH_ENDPOINT);
      if (endpoint) {
        await apiService.removePushSubscription(endpoint);
        console.log('Push subscription removed from backend');
      }
    } catch (error) {
      console.error('Error removing push subscription from backend:', error);
    }
  }

  private setupNotificationListeners() {
    if (Platform.OS !== 'android') {
      return;
    }

    this.unsubscribe = subscribeDistributorMessages(async ({ action, data }) => {

      switch (action) {
        case 'registered':
          const registrationPayload = {
            endpoint: data.url,
            keys: {
              auth: data.auth,
              p256dh: data.pubKey,
            },
          };
          await this.sendPushRegistrationToBackend(registrationPayload);
          break;

        case 'unregistered':
          await this.removePushRegistrationFromBackend();
          break;

        case 'message':
          await this.handleIncomingMessage(data);
          break;

        case 'error':
          console.error('UnifiedPush error:', data);
          break;

        default:
          console.log('Unknown UnifiedPush action:', action);
      }
    });
  }

  private async handleIncomingMessage(messageData: any) {
    try {
      // Parse the message data if it's a string
      let parsedData = messageData;
      if (typeof messageData === 'string') {
        try {
          parsedData = JSON.parse(messageData);
        } catch (e) {
          // If parsing fails, treat as plain text
          parsedData = { body: messageData };
        }
      }

      // Extract notification details
      const title = parsedData.title || parsedData.notification?.title || 'SharePal';
      const body = parsedData.body || parsedData.notification?.body || 'You have a new notification';
      const data = parsedData.data || {};

      // Show local notification
      await showLocalNotification({
        id: Date.now(),
        title,
        body,
        data,
      });

      console.log('Local notification displayed');
    } catch (error) {
      console.error('Error handling incoming message:', error);
      
      // Fallback notification
      await showLocalNotification({
        id: Date.now(),
        title: 'SharePal',
        body: 'You have a new notification',
      });
    }
  }

  public async sendTestNotification() {
    try {
      await showLocalNotification({
        id: Date.now(),
        title: 'Test Notification',
        body: 'This is a test notification from SharePal',
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  public getAvailableDistributors() {
    if (Platform.OS !== 'android') {
      return [];
    }
    return ExpoUnifiedPush.getDistributors();
  }

  public getSavedDistributor() {
    if (Platform.OS !== 'android') {
      return null;
    }
    return ExpoUnifiedPush.getSavedDistributor();
  }

  public saveDistributor(distributorId: string | null) {
    if (Platform.OS !== 'android') {
      return;
    }
    ExpoUnifiedPush.saveDistributor(distributorId);
  }

  public cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

export const unifiedPushService = new UnifiedPushService();