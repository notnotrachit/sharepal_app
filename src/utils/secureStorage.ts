import { Platform } from 'react-native';

// Platform-specific secure storage
let SecureStore: any = null;

if (Platform.OS !== 'web') {
  try {
    SecureStore = require('expo-secure-store');
  } catch (error) {
    console.warn('expo-secure-store not available on this platform');
  }
}

export const secureStorage = {
  async setItem(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (Platform.OS === 'web') {
        // Use localStorage for web
        localStorage.setItem(key, stringValue);
        if (key === 'access_token') {
          console.log('Web: Stored access token in localStorage');
        }
      } else if (SecureStore) {
        await SecureStore.setItemAsync(key, stringValue);
      } else {
        throw new Error('Secure storage not available');
      }
    } catch (error) {
      console.log('Error storing item:', error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        const value = localStorage.getItem(key);
        if (key === 'access_token') {
          console.log('Web: Retrieved access token from localStorage:', value ? 'Found' : 'Not found');
        }
        return value;
      } else if (SecureStore) {
        return await SecureStore.getItemAsync(key);
      } else {
        return null;
      }
    } catch (error) {
      console.log('Error retrieving item from storage:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else if (SecureStore) {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      throw error;
    }
  },

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const value = await this.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  },
};
