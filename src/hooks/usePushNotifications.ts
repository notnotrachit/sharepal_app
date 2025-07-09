import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Platform } from 'react-native';
import ExpoUnifiedPush, {
  checkPermissions,
  requestPermissions,
  subscribeDistributorMessages,
  RegisteredPayload,
  showLocalNotification,
} from 'expo-unified-push';
import Constants from 'expo-constants';
import { RootState } from '../store';
import { apiService } from '../services/api';
import { secureStorage } from '../utils/secureStorage';
import { STORAGE_KEYS } from '../constants/api';
import { debugLogger } from '../services/debugLogger';

async function handleIncomingMessage(messageData: any) {
  try {
    debugLogger.info('Notifications', 'Processing incoming message', messageData);
    
    // Parse the message data if it's a string
    let parsedData = messageData;
    if (typeof messageData === 'string') {
      try {
        parsedData = JSON.parse(messageData);
        debugLogger.info('Notifications', 'Parsed JSON data', parsedData);
      } catch (e) {
        debugLogger.warn('Notifications', 'Failed to parse as JSON, treating as plain text');
        parsedData = { body: messageData };
      }
    }

    // Extract notification details
    const title = parsedData.title || parsedData.notification?.title || 'SharePal';
    const body = parsedData.body || parsedData.notification?.body || parsedData.message || 'You have a new notification';
    const notificationData = parsedData.data || {};

    debugLogger.info('Notifications', 'Notification details', { title, body, data: notificationData });

    // Show local notification
    await showLocalNotification({
      id: Date.now(),
      title,
      body,
      ...(Object.keys(notificationData).length > 0 && { data: notificationData }),
    });

    debugLogger.success('Notifications', 'Local notification displayed successfully');
  } catch (error) {
    debugLogger.error('Notifications', 'Failed to handle incoming message', error);
    
    // Fallback notification
    try {
      await showLocalNotification({
        id: Date.now(),
        title: 'SharePal',
        body: 'You have a new notification',
      });
      debugLogger.success('Notifications', 'Fallback notification displayed');
    } catch (fallbackError) {
      debugLogger.error('Notifications', 'Even fallback notification failed', fallbackError);
    }
  }
}

export function getSavedDistributor() {
  if (Platform.OS !== 'android') return null;
  return ExpoUnifiedPush.getSavedDistributor();
}

export function getDistributors() {
  if (Platform.OS !== 'android') return [];
  return ExpoUnifiedPush.getDistributors();
}

export function saveDistributor(distributorId: string | null) {
  if (Platform.OS !== 'android') return;
  ExpoUnifiedPush.saveDistributor(distributorId);
}

export function registerDevice(vapidKey: string, userId: string) {
  if (Platform.OS !== 'android') return;
  ExpoUnifiedPush.registerDevice(vapidKey, userId);
}

async function registerUnifiedPush(authToken: string, data: RegisteredPayload) {
  try {
    const registrationPayload = {
      endpoint: data.url,
      keys: {
        auth: data.auth,
        p256dh: data.pubKey,
      },
    };
    
    debugLogger.info('UnifiedPush', 'Registering with backend', registrationPayload);
    await apiService.updatePushSubscription(registrationPayload);
    
    // Store the registration data locally
    await secureStorage.setItem(STORAGE_KEYS.PUSH_ENDPOINT, data.url);
    await secureStorage.setItem(STORAGE_KEYS.PUSH_KEYS, JSON.stringify(registrationPayload.keys));
    
    debugLogger.success('UnifiedPush', 'Successfully registered with backend');
  } catch (error) {
    debugLogger.error('UnifiedPush', 'Failed to register with backend', error);
    throw error;
  }
}

async function unregisterUnifiedPush(authToken: string, data: RegisteredPayload) {
  try {
    debugLogger.info('UnifiedPush', 'Unregistering from backend', { url: data.url });
    await apiService.removePushSubscription(data.url);
    
    // Clear stored push data
    await secureStorage.removeItem(STORAGE_KEYS.PUSH_ENDPOINT);
    await secureStorage.removeItem(STORAGE_KEYS.PUSH_KEYS);
    
    debugLogger.success('UnifiedPush', 'Successfully unregistered from backend');
  } catch (error) {
    debugLogger.error('UnifiedPush', 'Failed to unregister from backend', error);
    throw error;
  }
}

async function notificationCleanup({ deleteExpo = false, deleteUP = false }) {
  try {
    if (deleteExpo) {
      // Clean up any Expo push tokens if needed
      debugLogger.info('Cleanup', 'Cleaning up Expo push tokens');
    }
    
    if (deleteUP) {
      // Clean up UnifiedPush registration
      debugLogger.info('Cleanup', 'Cleaning up UnifiedPush registration');
      await secureStorage.removeItem(STORAGE_KEYS.PUSH_ENDPOINT);
      await secureStorage.removeItem(STORAGE_KEYS.PUSH_KEYS);
    }
  } catch (error) {
    debugLogger.error('Cleanup', 'Error during notification cleanup', error);
  }
}

export function usePushNotifications() {
  const auth = useSelector((state: RootState) => state.auth);
  const isAuthenticated = auth.isAuthenticated;
  const userId = auth.user?.user?.id;
  console.log(auth.user?.user)
  const isLoading = auth.isLoading;
  
  const SERVER_VAPID_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_SERVER_VAPID_KEY;

  useEffect(() => {
    if (Platform.OS !== 'android') {
      debugLogger.info('UnifiedPush', 'Skipping setup - not Android platform');
      return;
    }

    debugLogger.info('UnifiedPush', 'Starting notification setup', { 
      isDev: __DEV__,
      isAuthenticated,
      isLoading,
      hasUserId: !!userId,
      userId: userId || 'undefined'
    });

    // Don't proceed if auth is still loading or if we don't have a user ID yet
    if (isLoading) {
      debugLogger.info('UnifiedPush', 'Auth still loading, waiting...');
      return;
    }

    if (!isAuthenticated) {
      debugLogger.info('UnifiedPush', 'User not authenticated, skipping registration');
      return;
    }

    if (!userId) {
      debugLogger.error('UnifiedPush', 'User authenticated but no userId available - this should not happen!');
      return;
    }

    async function checkNotificationPermissions() {
      try {
        const granted = await checkPermissions();
        if (granted) {
          return true;
        } else {
          const state = await requestPermissions();
          return state === "granted";
        }
      } catch (error) {
        debugLogger.error('Permissions', 'Error checking/requesting permissions', error);
        return false;
      }
    }

    const savedDistributor = getSavedDistributor();
    const distributors = getDistributors();

    if (!savedDistributor) {
      // NOTE: initial implementation will always use the first distributor,
      // but we allow the user to select the distributor they want to use in the settings
      if (distributors.length > 0) {
        const preferredDistributor = distributors.find(d => d.isInternal) || distributors[0];
        saveDistributor(preferredDistributor.id);
        debugLogger.info('UnifiedPush', 'Auto-selected distributor', { name: preferredDistributor.name });
      } else {
        debugLogger.warn('UnifiedPush', 'No distributors available');
        return;
      }
    }
    
    if (userId && SERVER_VAPID_KEY) {
      debugLogger.info('UnifiedPush', 'All requirements met, proceeding with registration', {
        userId,
        hasVapidKey: !!SERVER_VAPID_KEY,
        vapidKeyPreview: SERVER_VAPID_KEY?.substring(0, 20) + '...'
      });

      checkNotificationPermissions().then(async (granted) => {
        // Clean up any old Expo tokens but keep UnifiedPush data
        notificationCleanup({ deleteExpo: true, deleteUP: false });
        
        if (granted) {
          debugLogger.info('UnifiedPush', 'Permissions granted, registering device', { userId, isDev: __DEV__ });
          await registerDevice(SERVER_VAPID_KEY, userId);
        } else {
          debugLogger.error('UnifiedPush', 'Notification permissions not granted');
        }
      }).catch((error) => {
        debugLogger.error('UnifiedPush', 'Error in permission check/registration flow', error);
      });
    } else {
      debugLogger.warn('UnifiedPush', 'Missing required data for registration', { 
        hasUserId: !!userId, 
        hasVapidKey: !!SERVER_VAPID_KEY,
        isAuthenticated,
        userId: userId || 'null'
      });
    }
  }, [SERVER_VAPID_KEY, userId, isAuthenticated, isLoading]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    debugLogger.info('UnifiedPush', 'Setting up message listeners', { 
      isDev: __DEV__,
      isAuthenticated,
      hasUserId: !!userId,
      userId: userId || 'undefined',
      isLoading
    });

    // Set up message listeners regardless of auth state to catch all events
    // but only process registration messages when authenticated and user data is available
    const unsubscribe = subscribeDistributorMessages(async (message) => {
      debugLogger.info('UnifiedPush', '🔔 RAW distributor message received', { 
        action: message.action, 
        data: message.data,
        isAuthenticated,
        hasUserId: !!userId,
        isLoading
      });

      // For registration events, we need both authentication and user data
      if (message.action === 'registered' || message.action === 'unregistered') {
        if (!isAuthenticated || !userId || isLoading) {
          debugLogger.warn('UnifiedPush', `${message.action} event received but auth not ready`, { 
            isAuthenticated, 
            hasUserId: !!userId, 
            isLoading,
            action: message.action 
          });
          return;
        }
      }

      try {
        // Get the current auth token from secure storage
        const authToken = await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!authToken) {
          debugLogger.warn('UnifiedPush', 'No access token found in storage');
          return;
        }

        debugLogger.info('UnifiedPush', 'Processing authenticated message', { action: message.action });

        if (message.action === 'registered') {
          debugLogger.success('UnifiedPush', `🎉 REGISTERED! User ${message.data.instance} with url ${message.data.url}`);
          debugLogger.info('UnifiedPush', 'Registration data details', { 
            url: message.data.url,
            auth: message.data.auth ? 'present' : 'missing',
            pubKey: message.data.pubKey ? 'present' : 'missing',
            instance: message.data.instance
          });
          
          const storedEndpoint = await secureStorage.getItem(STORAGE_KEYS.PUSH_ENDPOINT);
          debugLogger.info('UnifiedPush', 'Stored endpoint check', { 
            storedEndpoint, 
            newEndpoint: message.data.url,
            shouldUpdate: !storedEndpoint || storedEndpoint !== message.data.url
          });
          
          // Only register if this is a new endpoint or we don't have one stored
          if (!storedEndpoint || storedEndpoint !== message.data.url) {
            debugLogger.info('UnifiedPush', '📤 Sending registration to backend...');
            await registerUnifiedPush(authToken, message.data);
            debugLogger.success('UnifiedPush', '✅ Backend registration completed!');
          } else {
            debugLogger.info('UnifiedPush', '⏭️ Registration data unchanged, skipping backend update');
          }
        }
        
        if (message.action === 'unregistered') {
          debugLogger.info('UnifiedPush', `Unregistered user ${message.data.instance}`);
          const storedEndpoint = await secureStorage.getItem(STORAGE_KEYS.PUSH_ENDPOINT);
          if (storedEndpoint) {
            const upData = { url: storedEndpoint, auth: '', pubKey: '', instance: message.data.instance };
            await unregisterUnifiedPush(authToken, upData);
          }
        }
        
        if (message.action === 'error') {
          debugLogger.error('UnifiedPush', 'Distributor error', message.data);
        }
        
        if (message.action === 'registrationFailed') {
          debugLogger.error('UnifiedPush', 'Registration failed', message.data);
        }
        
        if (message.action === 'message') {
          debugLogger.info('UnifiedPush', 'Received push message', message);
          // Handle the incoming push message
          await handleIncomingMessage(message.data);
        }
      } catch (error) {
        debugLogger.error('UnifiedPush', 'Error processing distributor message', error);
      }
    });

    return () => {
      debugLogger.info('UnifiedPush', 'Cleaning up message listeners');
      unsubscribe?.();
    };
  }, [isAuthenticated, userId, isLoading]);

  // Return utility functions for manual operations
  return {
    getDistributors,
    getSavedDistributor,
    saveDistributor,
    registerDevice: (vapidKey: string, userId: string) => registerDevice(vapidKey, userId),
    // Manual trigger for testing
    manualRegister: async () => {
      if (Platform.OS !== 'android') return false;
      if (!userId || !SERVER_VAPID_KEY) {
        debugLogger.error('UnifiedPush', 'Manual register failed - missing userId or VAPID key', {
          hasUserId: !!userId,
          hasVapidKey: !!SERVER_VAPID_KEY,
          isAuthenticated,
          isLoading,
          userId: userId || 'undefined'
        });
        return false;
      }
      
      try {
        debugLogger.info('UnifiedPush', 'Manual registration triggered');
        await registerDevice(SERVER_VAPID_KEY, userId);
        return true;
      } catch (error) {
        debugLogger.error('UnifiedPush', 'Manual registration failed', error);
        return false;
      }
    },
    // Debug helper
    debugAuthState: () => {
      debugLogger.info('UnifiedPush', 'Current auth state', {
        isAuthenticated,
        isLoading,
        hasUserId: !!userId,
        userId: userId || 'undefined',
        hasUser: !!auth.user,
        userKeys: auth.user ? Object.keys(auth.user) : [],
        user: auth.user
      });
    }
  };
}
