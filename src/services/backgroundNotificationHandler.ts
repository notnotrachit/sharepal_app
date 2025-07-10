import { Platform, AppState } from 'react-native';

class BackgroundNotificationHandler {
  private appStateSubscription: any = null;

  constructor() {
    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    if (Platform.OS !== 'android') {
      return;
    }

    console.log('Setting up app state listener for background notification tracking');

    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('App state changed:', nextAppState);

      if (nextAppState === 'background') {
        console.log('App moved to background - UnifiedPush listeners should remain active');
      } else if (nextAppState === 'active') {
        console.log('App became active - checking for missed notifications');
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