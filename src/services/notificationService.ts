// Legacy notification service - now using UnifiedPush hook
// This file is kept for backward compatibility but delegates to UnifiedPush
import { unifiedPushService } from './unifiedPushService';

class NotificationService {
  constructor() {
    // No setup needed - usePushNotifications hook handles everything
  }

  public async checkPermissionStatus(): Promise<boolean> {
    return unifiedPushService.checkPermissionStatus();
  }

  public async requestUserPermission(): Promise<boolean> {
    return unifiedPushService.requestUserPermission();
  }

  // Legacy method - now delegates to UnifiedPush hook
  public async getAndSendFCMToken() {
    // This method is deprecated but kept for compatibility
    // Push notifications are now handled automatically by the usePushNotifications hook
    console.log('✅ Token registration is now handled automatically by the usePushNotifications hook');
    console.log('✅ Backend registration happens automatically when user is authenticated');
    console.log('✅ No manual intervention needed');
  }

  // Legacy method - now handled by hook
  private async sendFCMTokenToBackend(token: string) {
    // This is handled automatically by the usePushNotifications hook
    console.log('✅ Backend registration is now managed automatically by usePushNotifications hook');
  }

  // Legacy method - hook handles listeners automatically
  private setupNotificationListeners() {
    // Message listeners are set up automatically by the usePushNotifications hook
  }
}

export const notificationService = new NotificationService();