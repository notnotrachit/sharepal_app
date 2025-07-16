import { Platform } from 'react-native';

// Platform-specific credential manager
let credentialsManager: any = null;

if (Platform.OS === 'android') {
  try {
    credentialsManager = require('react-native-credentials-manager');
  } catch (error) {
    console.warn('react-native-credentials-manager not available on this platform');
  }
}

export const signUpWithGoogle = async (config: any) => {
  if (Platform.OS !== 'android' || !credentialsManager) {
    throw new Error('Google Sign-In is only available on Android');
  }
  
  return credentialsManager.signUpWithGoogle(config);
};