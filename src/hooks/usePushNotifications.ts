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

async function handleIncomingMessage(messageData: any) {
  try {
    console.log('Processing incoming message:', messageData);
    
    // Parse the message data if it's a string
    let parsedData = messageData;
    if (typeof messageData === 'string') {
      try {
        parsedData = JSON.parse(messageData);
        console.log('Parsed JSON data:', parsedData);
      } catch (e) {
        console.log('Failed to parse as JSON, treating as plain text');
        parsedData = { body: messageData };
      }
    }

    // Extract notification details
    const title = parsedData.title || parsedData.notification?.title || 'SharePal';
    const body = parsedData.body || parsedData.notification?.body || parsedData.message || 'You have a new notification';
    const notificationData = parsedData.data || {};

    console.log('Notification details:', { title, body, data: notificationData });

    // Show local notification
    await showLocalNotification({
      id: Date.now(),
      title,
      body,
      data: notificationData,
    });

    console.log('Local notification displayed successfully');
  } catch (error) {
    console.error('Failed to handle incoming message:', error);
    
    // Fallback notification
    try {
      await showLocalNotification({
        id: Date.now(),
        title: 'SharePal',
        body: 'You have a new notification',
      });
      console.log('Fallback notification displayed');
    } catch (fallbackError) {
      console.error('Even fallback notification failed:', fallbackError);
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
    
    console.log('Registering with backend:', registrationPayload);
    await apiService.updatePushSubscription(registrationPayload);
    
    // Store the registration data locally
    await secureStorage.setItem(STORAGE_KEYS.PUSH_ENDPOINT, data.url);
    await secureStorage.setItem(STORAGE_KEYS.PUSH_KEYS, JSON.stringify(registrationPayload.keys));
    
    console.log('Successfully registered with backend');
  } catch (error) {
    console.error('Failed to register with backend:', error);
    throw error;
  }
}

async function unregisterUnifiedPush(authToken: string, data: RegisteredPayload) {
  try {
    console.log('Unregistering from backend:', { url: data.url });
    await apiService.removePushSubscription(data.url);
    
    // Clear stored push data
    await secureStorage.removeItem(STORAGE_KEYS.PUSH_ENDPOINT);
    await secureStorage.removeItem(STORAGE_KEYS.PUSH_KEYS);
    
    console.log('Successfully unregistered from backend');
  } catch (error) {
    console.error('Failed to unregister from backend:', error);
    throw error;
  }
}

async function notificationCleanup({ deleteExpo = false, deleteUP = false }) {
  try {
    if (deleteExpo) {
      console.log('Cleaning up Expo push tokens');
    }
    
    if (deleteUP) {
      console.log('Cleaning up UnifiedPush registration');
      await secureStorage.removeItem(STORAGE_KEYS.PUSH_ENDPOINT);
      await secureStorage.removeItem(STORAGE_KEYS.PUSH_KEYS);
    }
  } catch (error) {
    console.error('Error during notification cleanup:', error);
  }
}

export function usePushNotifications() {
  const auth = useSelector((state: RootState) => state.auth);
  const isAuthenticated = auth.isAuthenticated;
  const isLoading = auth.isLoading;
  
  const userId = auth.user?.user?.id || auth.user?.id || auth.user?._id || auth.user?.user?._id ;
  const SERVER_VAPID_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_SERVER_VAPID_KEY;

  useEffect(() => {
    if (Platform.OS !== 'android') {
      // console.log('UnifiedPush: Skipping setup - not Android platform');
      return;
    }



    // Don't proceed if auth is still loading or if we don't have a user ID yet
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      
      // If user was previously authenticated and now is not, unregister
      const handleLogout = async () => {
        const storedEndpoint = await secureStorage.getItem(STORAGE_KEYS.PUSH_ENDPOINT);
        if (storedEndpoint) {
          try {
            await ExpoUnifiedPush.unregisterDevice();
            await secureStorage.removeItem(STORAGE_KEYS.PUSH_ENDPOINT);
            await secureStorage.removeItem(STORAGE_KEYS.PUSH_KEYS);
          } catch (error) {
            console.error('UnifiedPush: Failed to unregister after logout:', error);
          }
        }
      };
      
      handleLogout();
      return;
    }

    if (!userId) {
      console.error('UnifiedPush: User authenticated but no userId available - this should not happen!');
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
        console.error('Error checking/requesting permissions:', error);
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
      } else {
        console.warn('UnifiedPush: No distributors available');
        return;
      }
    }
    
    if (userId && SERVER_VAPID_KEY) {

      checkNotificationPermissions().then(async (granted) => {
        // Clean up any old Expo tokens but keep UnifiedPush data
        notificationCleanup({ deleteExpo: true, deleteUP: false });
        
        if (granted) {
          await registerDevice(SERVER_VAPID_KEY, userId);
        } else {
          console.error('UnifiedPush: Notification permissions not granted');
        }
      }).catch((error) => {
        console.error('UnifiedPush: Error in permission check/registration flow:', error);
      });
    } else {
      console.warn('UnifiedPush: Missing required data for registration', { 
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

    // Set up message listeners regardless of auth state to catch all events
    // but only process registration messages when authenticated and user data is available
    const unsubscribe = subscribeDistributorMessages(async (message) => {

      // For registration events, we need both authentication and user data
      if (message.action === 'registered' || message.action === 'unregistered') {
        if (!isAuthenticated || !userId || isLoading) {
          console.warn('UnifiedPush: Registration event received but auth not ready', { 
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
          console.warn('UnifiedPush: No access token found in storage');
          return;
        }

        if (message.action === 'registered') {
          
          const storedEndpoint = await secureStorage.getItem(STORAGE_KEYS.PUSH_ENDPOINT);
          
          // Only register if this is a new endpoint or we don't have one stored
          if (!storedEndpoint || storedEndpoint !== message.data.url) {
            await registerUnifiedPush(authToken, message.data);
          }
        }
        
        if (message.action === 'unregistered') {
          const storedEndpoint = await secureStorage.getItem(STORAGE_KEYS.PUSH_ENDPOINT);
          if (storedEndpoint) {
            const upData = { url: storedEndpoint, auth: '', pubKey: '', instance: message.data.instance };
            await unregisterUnifiedPush(authToken, upData);
          }
        }
        
        if (message.action === 'error') {
          console.error('UnifiedPush: Distributor error', message.data);
        }
        
        if (message.action === 'registrationFailed') {
          console.error('UnifiedPush: Registration failed', message.data);
        }
        
        if (message.action === 'message') {
          // Handle the incoming push message
          await handleIncomingMessage(message.data);
        }
      } catch (error) {
        console.error('UnifiedPush: Error processing distributor message', error);
      }
    });

    return () => {
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
        return false;
      }
      
      try {
        await registerDevice(SERVER_VAPID_KEY, userId);
        return true;
      } catch (error) {
        return false;
      }
    },
    // Debug helper
    debugAuthState: () => {
      console.log('UnifiedPush: Current auth state', {
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