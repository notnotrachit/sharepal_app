// Legacy notification service - now using UnifiedPush
// This file is kept for backward compatibility but delegates to UnifiedPush
import { unifiedPushService } from './unifiedPushService';

class NotificationService {
  constructor() {
    // No setup needed - UnifiedPush service handles everything
  }

  public async checkPermissionStatus(): Promise<boolean> {
    return unifiedPushService.checkPermissionStatus();
  }

  public async requestUserPermission(): Promise<boolean> {
    return unifiedPushService.requestUserPermission();
  }

  // Legacy method - now delegates to UnifiedPush
  public async getAndSendFCMToken() {
    // This method is deprecated but kept for compatibility
    // UnifiedPush handles registration automatically
    await unifiedPushService.registerDevice();
  }

  // Legacy method - now delegates to UnifiedPush
  private async sendFCMTokenToBackend(token: string) {
    // This is handled automatically by UnifiedPush service
    console.log('FCM token handling is now managed by UnifiedPush service');
  }

  // Legacy method - UnifiedPush handles listeners automatically
  private setupNotificationListeners() {
    // UnifiedPush service sets up all listeners automatically
  }
}

export const notificationService = new NotificationService();