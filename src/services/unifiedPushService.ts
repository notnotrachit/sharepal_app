import { Platform } from 'react-native';

// Platform-specific unified push imports
let ExpoUnifiedPush: any = null;
let checkPermissions: any = null;
let requestPermissions: any = null;
let showLocalNotification: any = null;

if (Platform.OS !== 'web') {
  try {
    const unifiedPush = require('expo-unified-push');
    ExpoUnifiedPush = unifiedPush.default;
    checkPermissions = unifiedPush.checkPermissions;
    requestPermissions = unifiedPush.requestPermissions;
    showLocalNotification = unifiedPush.showLocalNotification;
  } catch (error) {
    console.warn('expo-unified-push not available on this platform');
  }
}

class UnifiedPushService {
  constructor() {
    // Legacy service - use usePushNotifications hook for full functionality
  }

  public async checkPermissionStatus(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android' || !checkPermissions) {
        return false;
      }
      const hasPermission = await checkPermissions();
      return hasPermission;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  public async requestUserPermission(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android' || !checkPermissions || !requestPermissions) {
        console.log('UnifiedPush is only supported on Android');
        return false;
      }

      const granted = await checkPermissions();
      
      if (granted) {
        return true;
      } else {
        const state = await requestPermissions();
        
        if (state === 'granted') {
          return true;
        } else {
          return false;
        }
      }
    } catch (error) {
      console.error('Error in requestUserPermission:', error);
      return false;
    }
  }

  public async sendTestNotification() {
    try {
      if (Platform.OS !== 'android' || !checkPermissions || !requestPermissions || !showLocalNotification) {
        console.log('Test notification not supported on this platform');
        return;
      }

      console.log('=== Sending Test Notification ===');
      
      // Check permissions first
      const hasPermission = await checkPermissions();
      console.log('Current notification permission:', hasPermission);
      
      if (!hasPermission) {
        console.log('No notification permissions, requesting...');
        const granted = await requestPermissions();
        console.log('Permission request result:', granted);
        
        if (granted !== 'granted') {
          throw new Error('Notification permissions not granted');
        }
      }
      
      console.log('Displaying test notification...');
      await showLocalNotification({
        id: Date.now(),
        title: 'Test Notification',
        body: 'This is a test notification from SharePal',
      });
      
      console.log('SUCCESS: Test notification sent');
      console.log('================================');
    } catch (error) {
      console.error('ERROR: Failed to send test notification:', error);
      throw error;
    }
  }

  public getAvailableDistributors() {
    if (Platform.OS !== 'android' || !ExpoUnifiedPush) {
      return [];
    }
    const distributors = ExpoUnifiedPush.getDistributors();
    console.log('Getting available distributors:', distributors.length);
    return distributors;
  }

  public getSavedDistributor() {
    if (Platform.OS !== 'android' || !ExpoUnifiedPush) {
      return null;
    }
    const saved = ExpoUnifiedPush.getSavedDistributor();
    console.log('Getting saved distributor:', saved);
    return saved;
  }

  public saveDistributor(distributorId: string | null) {
    if (Platform.OS !== 'android' || !ExpoUnifiedPush) {
      return;
    }
    console.log('Saving distributor:', distributorId);
    ExpoUnifiedPush.saveDistributor(distributorId);
  }

  public async registerDevice() {
    // This method is kept for backward compatibility
    // The actual registration is now handled by the usePushNotifications hook
    console.log('Legacy registerDevice called - registration is now handled by the hook');
    console.log('Device registration is now handled automatically by the usePushNotifications hook');
  }

  public async unregisterDevice() {
    try {
      if (Platform.OS !== 'android' || !ExpoUnifiedPush) {
        console.log('Unregister skipped - not Android platform or module not available');
        return;
      }

      console.log('Unregistering device from UnifiedPush');
      await ExpoUnifiedPush.unregisterDevice();
      console.log('Device unregistered successfully');
    } catch (error) {
      console.error('Error unregistering device:', error);
      throw error;
    }
  }

  public cleanup() {
    console.log('Legacy cleanup called - this method is deprecated');
    console.log('The usePushNotifications hook now handles all registration and cleanup');
  }

}

export const unifiedPushService = new UnifiedPushService();