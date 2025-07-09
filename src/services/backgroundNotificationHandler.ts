import { Platform, AppState } from 'react-native';
import { debugLogger } from './debugLogger';

class BackgroundNotificationHandler {
  private appStateSubscription: any = null;

  constructor() {
    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    if (Platform.OS !== 'android') {
      return;
    }

    debugLogger.info('Background', 'Setting up app state listener for background notification tracking');

    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      debugLogger.info('Background', 'App state changed', { 
        state: nextAppState,
        timestamp: new Date().toISOString()
      });

      if (nextAppState === 'background') {
        debugLogger.info('Background', 'App moved to background - UnifiedPush listeners should remain active');
      } else if (nextAppState === 'active') {
        debugLogger.info('Background', 'App became active - checking for missed notifications');
      }
    });
  }

  public cleanup() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

export const backgroundNotificationHandler = new BackgroundNotificationHandler();