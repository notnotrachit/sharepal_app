import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { unifiedPushService } from '../services/unifiedPushService';

interface Distributor {
  id: string;
  name: string;
  icon: string;
  isInternal: boolean;
  isSaved: boolean;
  isConnected: boolean;
}

export const UnifiedPushSetup: React.FC = () => {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [selectedDistributor, setSelectedDistributor] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      updateDistributorList();
    }
  }, []);

  const updateDistributorList = () => {
    const available = unifiedPushService.getAvailableDistributors();
    console.log('Available Distributors:', available);
    const saved = unifiedPushService.getSavedDistributor();
    setDistributors(available);
    setSelectedDistributor(saved);
  };

  const selectDistributor = (distributorId: string) => {
    unifiedPushService.saveDistributor(distributorId);
    updateDistributorList();
    Alert.alert('Success', 'Distributor selected. You can now register for notifications.');
  };

  const registerForNotifications = async () => {
    try {
      const success = await unifiedPushService.requestUserPermission();
      if (success) {
        Alert.alert('Success', 'Successfully registered for push notifications!');
      } else {
        Alert.alert('Error', 'Failed to register for push notifications.');
      }
    } catch (error) {
      Alert.alert('Error', `Registration failed: ${error}`);
    }
  };

  const sendTestNotification = async () => {
    try {
      await unifiedPushService.sendTestNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', `Failed to send test notification: ${error}`);
    }
  };

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>UnifiedPush Setup</Text>
        <Text style={styles.subtitle}>
          UnifiedPush is only available on Android. iOS users will use the default notification system.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UnifiedPush Setup</Text>
      
      {distributors.length === 0 ? (
        <View style={styles.noDistributors}>
          <Text style={styles.subtitle}>No UnifiedPush distributors found</Text>
          <Text style={styles.description}>
            Please install a UnifiedPush distributor app like ntfy, NextPush, or use the built-in FCM distributor.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.subtitle}>Available Distributors:</Text>
          {distributors.map((distributor) => (
            <TouchableOpacity
              key={distributor.id}
              style={[
                styles.distributorItem,
                selectedDistributor === distributor.id && styles.selectedDistributor
              ]}
              onPress={() => selectDistributor(distributor.id)}
              disabled={distributor.isSaved}
            >
              <Text style={styles.distributorName}>{distributor.name}</Text>
              <Text style={styles.distributorType}>
                {distributor.isInternal ? 'Internal' : 'External'}
                {distributor.isSaved && ' • Selected'}
                {distributor.isConnected && ' • Connected'}
              </Text>
            </TouchableOpacity>
          ))}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, !selectedDistributor && styles.buttonDisabled]}
              onPress={registerForNotifications}
              disabled={!selectedDistributor}
            >
              <Text style={styles.buttonText}>Register for Notifications</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.button}
              onPress={sendTestNotification}
            >
              <Text style={styles.buttonText}>Send Test Notification</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 15,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  noDistributors: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  distributorItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedDistributor: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  distributorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  distributorType: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});