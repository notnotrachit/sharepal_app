import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { unifiedPushService } from '../services/unifiedPushService';
import Constants from 'expo-constants';
import { ProductionDebugViewer } from '../components/ProductionDebugViewer';

export const UnifiedPushDebugScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'debug' | 'logs'>('debug');
  const [distributors, setDistributors] = useState<any[]>([]);
  const [selectedDistributor, setSelectedDistributor] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<boolean>(false);
  const [vapidKey, setVapidKey] = useState<string | undefined>();
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<string>('Not started');
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    updateStatus();
  }, []);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [...prev.slice(-9), logEntry]); // Keep last 10 logs
    console.log(logEntry);
  };

  const updateStatus = async () => {
    try {
      addDebugLog('Updating status...');
      
      if (Platform.OS === 'android') {
        const available = unifiedPushService.getAvailableDistributors();
        const saved = unifiedPushService.getSavedDistributor();
        const hasPermission = await unifiedPushService.checkPermissionStatus();
        
        addDebugLog(`Found ${available.length} distributors`);
        addDebugLog(`Saved distributor: ${saved || 'None'}`);
        addDebugLog(`Permission status: ${hasPermission}`);
        
        setDistributors(available);
        setSelectedDistributor(saved);
        setPermissionStatus(hasPermission);
      } else {
        addDebugLog('Platform is not Android - UnifiedPush not supported');
      }
      
      const vapid = Constants.expoConfig?.extra?.EXPO_PUBLIC_SERVER_VAPID_KEY;
      setVapidKey(vapid);
      addDebugLog(`VAPID key: ${vapid ? 'Present' : 'Missing'}`);
      
    } catch (error) {
      const errorMsg = `Error updating status: ${error}`;
      addDebugLog(errorMsg);
      setLastError(errorMsg);
    }
  };

  const selectDistributor = (distributorId: string) => {
    try {
      addDebugLog(`Selecting distributor: ${distributorId}`);
      unifiedPushService.saveDistributor(distributorId);
      updateStatus();
      addDebugLog(`✅ Distributor selected: ${distributorId}`);
      Alert.alert('Success', `Selected distributor: ${distributorId}`);
    } catch (error) {
      const errorMsg = `Failed to select distributor: ${error}`;
      addDebugLog(`❌ ${errorMsg}`);
      setLastError(errorMsg);
      Alert.alert('Error', errorMsg);
    }
  };

  const requestPermissions = async () => {
    try {
      setRegistrationStatus('Requesting permissions...');
      addDebugLog('Starting permission request...');
      
      // Check current permission status first
      const currentStatus = await unifiedPushService.checkPermissionStatus();
      addDebugLog(`Current permission status: ${currentStatus}`);
      
      const granted = await unifiedPushService.requestUserPermission();
      addDebugLog(`Permission request result: ${granted}`);
      
      if (granted) {
        setRegistrationStatus('Permissions granted, registration initiated');
        addDebugLog('✅ Permissions granted and registration initiated');
      } else {
        setRegistrationStatus('Permission request failed');
        addDebugLog('❌ Failed to get permissions');
        setLastError('Permission request was denied');
      }
      
      await updateStatus();
      
      Alert.alert(
        granted ? 'Success' : 'Failed',
        granted ? 'Permissions granted and registration initiated' : 'Failed to get permissions'
      );
    } catch (error) {
      const errorMsg = `Permission request failed: ${error}`;
      addDebugLog(`❌ ${errorMsg}`);
      setLastError(errorMsg);
      setRegistrationStatus('Error during permission request');
      Alert.alert('Error', errorMsg);
    }
  };

  const registerDevice = async () => {
    try {
      setRegistrationStatus('Registering device...');
      addDebugLog('Starting device registration...');
      
      await unifiedPushService.registerDevice();
      
      setRegistrationStatus('Device registration initiated');
      addDebugLog('✅ Device registration initiated');
      Alert.alert('Success', 'Device registration initiated');
    } catch (error) {
      const errorMsg = `Registration failed: ${error}`;
      addDebugLog(`❌ ${errorMsg}`);
      setLastError(errorMsg);
      setRegistrationStatus('Registration failed');
      Alert.alert('Error', errorMsg);
    }
  };

  const sendTestNotification = async () => {
    try {
      addDebugLog('Sending test notification...');
      await unifiedPushService.sendTestNotification();
      addDebugLog('✅ Test notification sent');
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      const errorMsg = `Failed to send test notification: ${error}`;
      addDebugLog(`❌ ${errorMsg}`);
      setLastError(errorMsg);
      Alert.alert('Error', errorMsg);
    }
  };

  const clearDistributor = () => {
    try {
      addDebugLog('Clearing distributor selection...');
      unifiedPushService.saveDistributor(null);
      updateStatus();
      addDebugLog('✅ Distributor selection cleared');
      Alert.alert('Success', 'Distributor selection cleared');
    } catch (error) {
      const errorMsg = `Failed to clear distributor: ${error}`;
      addDebugLog(`❌ ${errorMsg}`);
      setLastError(errorMsg);
      Alert.alert('Error', errorMsg);
    }
  };

  const clearLogs = () => {
    setDebugLogs([]);
    setLastError(null);
    addDebugLog('Debug logs cleared');
  };

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>UnifiedPush Debug</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Support</Text>
          <Text style={styles.info}>
            UnifiedPush is only supported on Android. This device is running {Platform.OS}.
          </Text>
        </View>
        
        {/* Show production logs viewer for iOS too */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Production Debug Logs</Text>
          <ProductionDebugViewer />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UnifiedPush Debug</Text>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'debug' && styles.activeTab]}
          onPress={() => setActiveTab('debug')}
        >
          <Text style={[styles.tabText, activeTab === 'debug' && styles.activeTabText]}>
            Debug Interface
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'logs' && styles.activeTab]}
          onPress={() => setActiveTab('logs')}
        >
          <Text style={[styles.tabText, activeTab === 'logs' && styles.activeTabText]}>
            Production Logs
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'logs' ? (
        <ProductionDebugViewer />
      ) : (
        <ScrollView style={styles.scrollContainer}>
      
      {/* Registration Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Registration Status</Text>
        <Text style={[styles.info, { fontWeight: 'bold' }]}>
          Status: {registrationStatus}
        </Text>
        {lastError && (
          <Text style={[styles.info, { color: '#ff6b35', fontWeight: 'bold' }]}>
            Last Error: {lastError}
          </Text>
        )}
      </View>

      {/* Configuration Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        <Text style={styles.info}>
          VAPID Key: {vapidKey ? '✅ Configured' : '❌ Missing'}
        </Text>
        <Text style={styles.info}>
          Platform: {Platform.OS}
        </Text>
        <Text style={styles.info}>
          Permissions: {permissionStatus ? '✅ Granted' : '❌ Not granted'}
        </Text>
      </View>

      {/* Current Distributor */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Distributor</Text>
        {selectedDistributor ? (
          <View>
            <Text style={styles.info}>Selected: {selectedDistributor}</Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={clearDistributor}>
              <Text style={styles.secondaryButtonText}>Clear Selection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.info}>No distributor selected</Text>
        )}
      </View>

      {/* Available Distributors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Distributors ({distributors.length})</Text>
        {distributors.length === 0 ? (
          <Text style={styles.warning}>
            No distributors found. Install a UnifiedPush distributor app or use FCM distributor.
          </Text>
        ) : (
          distributors.map((distributor) => (
            <TouchableOpacity
              key={distributor.id}
              style={[
                styles.distributorItem,
                selectedDistributor === distributor.id && styles.selectedDistributor
              ]}
              onPress={() => selectDistributor(distributor.id)}
            >
              <Text style={styles.distributorName}>{distributor.name}</Text>
              <Text style={styles.distributorDetails}>
                ID: {distributor.id}
              </Text>
              <Text style={styles.distributorDetails}>
                Type: {distributor.isInternal ? 'Internal' : 'External'}
                {distributor.isSaved && ' • Saved'}
                {distributor.isConnected && ' • Connected'}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Request Permissions & Register</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, !selectedDistributor && styles.buttonDisabled]} 
          onPress={registerDevice}
          disabled={!selectedDistributor}
        >
          <Text style={styles.buttonText}>Register Device</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={sendTestNotification}>
          <Text style={styles.buttonText}>Send Test Notification</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={updateStatus}>
          <Text style={styles.secondaryButtonText}>Refresh Status</Text>
        </TouchableOpacity>
      </View>

      {/* Debug Logs */}
      <View style={styles.section}>
        <View style={styles.logHeader}>
          <Text style={styles.sectionTitle}>Debug Logs</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.logContainer} nestedScrollEnabled>
          {debugLogs.length === 0 ? (
            <Text style={styles.logEntry}>No logs yet...</Text>
          ) : (
            debugLogs.map((log, index) => (
              <Text key={index} style={styles.logEntry}>{log}</Text>
            ))
          )}
        </ScrollView>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.instructions}>
          1. Ensure VAPID key is configured in environment{'\n'}
          2. Select a distributor from the list above{'\n'}
          3. Request permissions and register{'\n'}
          4. Watch debug logs for detailed information{'\n'}
          5. Test with a local notification{'\n'}
          6. Check console logs for even more details
        </Text>
      </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  activeTab: {
    backgroundColor: 'white',
    borderBottomWidth: 2,
    borderBottomColor: '#2196f3',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196f3',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  warning: {
    fontSize: 14,
    color: '#ff6b35',
    fontStyle: 'italic',
  },
  distributorItem: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    marginBottom: 8,
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
    marginBottom: 4,
  },
  distributorDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
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
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  instructions: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  logContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    padding: 10,
    maxHeight: 200,
  },
  logEntry: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
    color: '#333',
  },
});