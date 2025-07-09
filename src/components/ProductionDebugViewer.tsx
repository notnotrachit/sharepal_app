import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { debugLogger } from '../services/debugLogger';

interface DebugLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  category: string;
  message: string;
  data?: any;
}

export const ProductionDebugViewer: React.FC = () => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    refreshLogs();
    
    if (autoRefresh) {
      const interval = setInterval(refreshLogs, 2000); // Refresh every 2 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const refreshLogs = () => {
    const allLogs = debugLogger.getLogs();
    setLogs(allLogs);
  };

  const getFilteredLogs = () => {
    if (selectedCategory === 'all') {
      return logs;
    }
    return logs.filter(log => log.category === selectedCategory);
  };

  const getCategories = () => {
    const categories = ['all', ...new Set(logs.map(log => log.category))];
    return categories;
  };

  const clearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all debug logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            debugLogger.clearLogs();
            refreshLogs();
          },
        },
      ]
    );
  };

  const exportLogs = async () => {
    try {
      const logsText = debugLogger.exportLogs();
      await Share.share({
        message: logsText,
        title: 'UnifiedPush Debug Logs',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export logs');
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return '#ff4444';
      case 'warn': return '#ffaa00';
      case 'success': return '#00aa00';
      default: return '#666666';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const filteredLogs = getFilteredLogs();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Production Debug Logs</Text>
        <Text style={styles.subtitle}>
          {filteredLogs.length} logs {selectedCategory !== 'all' && `(${selectedCategory})`}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, autoRefresh && styles.activeButton]}
          onPress={() => setAutoRefresh(!autoRefresh)}
        >
          <Text style={[styles.buttonText, autoRefresh && styles.activeButtonText]}>
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={refreshLogs}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={clearLogs}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={exportLogs}>
          <Text style={styles.buttonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal style={styles.categoryFilter} showsHorizontalScrollIndicator={false}>
        {getCategories().map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.activeCategoryButton
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.activeCategoryButtonText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Logs */}
      <ScrollView style={styles.logsContainer}>
        {filteredLogs.length === 0 ? (
          <Text style={styles.noLogs}>No logs available</Text>
        ) : (
          filteredLogs.map((log, index) => (
            <View key={index} style={styles.logEntry}>
              <View style={styles.logHeader}>
                <Text style={styles.logTimestamp}>
                  {formatTimestamp(log.timestamp)}
                </Text>
                <Text style={[styles.logLevel, { color: getLogColor(log.level) }]}>
                  {log.level.toUpperCase()}
                </Text>
                <Text style={styles.logCategory}>
                  {log.category}
                </Text>
              </View>
              <Text style={styles.logMessage}>
                {log.message}
              </Text>
              {log.data && (
                <Text style={styles.logData}>
                  {log.data}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  button: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  activeButton: {
    backgroundColor: '#2196f3',
  },
  buttonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  activeButtonText: {
    color: 'white',
  },
  categoryFilter: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activeCategoryButton: {
    backgroundColor: '#2196f3',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  activeCategoryButtonText: {
    color: 'white',
  },
  logsContainer: {
    flex: 1,
    padding: 12,
  },
  noLogs: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 40,
  },
  logEntry: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logTimestamp: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
    marginRight: 8,
  },
  logLevel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 50,
  },
  logCategory: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logMessage: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  logData: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4,
  },
});