import ExpoUnifiedPush, {
  checkPermissions,
  requestPermissions,
  showLocalNotification,
} from 'expo-unified-push';
import { Platform } from 'react-native';
import { debugLogger } from './debugLogger';

class UnifiedPushService {
  constructor() {
    debugLogger.info('UnifiedPush', 'Legacy service initialized - use usePushNotifications hook for full functionality', { 
      platform: Platform.OS
    });
  }

  public async checkPermissionStatus(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        return false;
      }
      const hasPermission = await checkPermissions();
      debugLogger.info('Permissions', 'Permission check result', { hasPermission });
      return hasPermission;
    } catch (error) {
      debugLogger.error('Permissions', 'Error checking permissions', error);
      return false;
    }
  }

  public async requestUserPermission(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        debugLogger.warn('UnifiedPush', 'Platform not supported', { platform: Platform.OS });
        return false;
      }

      debugLogger.info('Permissions', 'Checking current permissions');
      const granted = await checkPermissions();
      debugLogger.info('Permissions', 'Current permission status', { granted });
      
      if (granted) {
        debugLogger.success('Permissions', 'Permissions already granted');
        return true;
      } else {
        debugLogger.info('Permissions', 'Requesting permissions');
        const state = await requestPermissions();
        debugLogger.info('Permissions', 'Permission request result', { state });
        
        if (state === 'granted') {
          debugLogger.success('Permissions', 'Permissions granted');
          return true;
        } else {
          debugLogger.error('Permissions', 'Permissions denied', { state });
          return false;
        }
      }
    } catch (error) {
      debugLogger.error('Permissions', 'Error in requestUserPermission', error);
      return false;
    }
  }

  public async sendTestNotification() {
    try {
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
    if (Platform.OS !== 'android') {
      return [];
    }
    const distributors = ExpoUnifiedPush.getDistributors();
    console.log('Getting available distributors:', distributors.length);
    return distributors;
  }

  public getSavedDistributor() {
    if (Platform.OS !== 'android') {
      return null;
    }
    const saved = ExpoUnifiedPush.getSavedDistributor();
    console.log('Getting saved distributor:', saved);
    return saved;
  }

  public saveDistributor(distributorId: string | null) {
    if (Platform.OS !== 'android') {
      return;
    }
    console.log('Saving distributor:', distributorId);
    ExpoUnifiedPush.saveDistributor(distributorId);
  }

  public async registerDevice() {
    // This method is kept for backward compatibility
    // The actual registration is now handled by the usePushNotifications hook
    debugLogger.info('UnifiedPush', 'Legacy registerDevice called - registration is now handled by the hook');
    console.log('Device registration is now handled automatically by the usePushNotifications hook');
  }

  public cleanup() {
    debugLogger.warn('UnifiedPush', 'Legacy cleanup called - this method is deprecated');
    debugLogger.info('UnifiedPush', 'The usePushNotifications hook now handles all registration and cleanup');
  }
}

export const unifiedPushService = new UnifiedPushService();