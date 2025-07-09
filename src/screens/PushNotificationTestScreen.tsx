import React, { useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { unifiedPushService } from "../services/unifiedPushService";
import { debugLogger } from "../services/debugLogger";

export default function PushNotificationTestScreen() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const auth = useSelector((state: RootState) => state.auth);

  // Initialize push notifications
  const pushNotifications = usePushNotifications();

  const addResult = (message: string) => {
    setTestResults((prev) => [
      `${new Date().toLocaleTimeString()}: ${message}`,
      ...prev.slice(0, 9),
    ]);
  };

  const testLocalNotification = async () => {
    try {
      addResult("Testing local notification...");
      await unifiedPushService.sendTestNotification();
      addResult("✅ Local notification sent successfully");
    } catch (error) {
      addResult(`❌ Local notification failed: ${error}`);
    }
  };

  const testPermissions = async () => {
    try {
      addResult("Checking permissions...");
      const hasPermission = await unifiedPushService.checkPermissionStatus();
      addResult(
        `Permissions status: ${hasPermission ? "✅ Granted" : "❌ Not granted"}`
      );

      if (!hasPermission) {
        addResult("Requesting permissions...");
        const granted = await unifiedPushService.requestUserPermission();
        addResult(
          `Permission request result: ${granted ? "✅ Granted" : "❌ Denied"}`
        );
      }
    } catch (error) {
      addResult(`❌ Permission check failed: ${error}`);
    }
  };

  const checkDistributors = () => {
    try {
      const distributors = unifiedPushService.getAvailableDistributors();
      const savedDistributor = unifiedPushService.getSavedDistributor();

      addResult(`Found ${distributors.length} distributors`);
      distributors.forEach((dist, index) => {
        addResult(
          `  ${index + 1}. ${dist.name} ${
            dist.isInternal ? "(internal)" : "(external)"
          }`
        );
      });

      if (savedDistributor) {
        addResult(`✅ Saved distributor: ${savedDistributor}`);
      } else {
        addResult("❌ No distributor saved");
      }
    } catch (error) {
      addResult(`❌ Distributor check failed: ${error}`);
    }
  };

  const testFullFlow = async () => {
    addResult("🧪 Starting full test flow...");

    // Check auth
    if (!auth.isAuthenticated || !auth.user?._id) {
      addResult("❌ User not authenticated");
      return;
    }
    addResult(`✅ User authenticated: ${auth.user._id}`);

    // Check permissions
    await testPermissions();

    // Check distributors
    checkDistributors();

    // Test local notification
    await testLocalNotification();

    addResult("🧪 Full test flow completed");
  };

  const clearResults = () => setTestResults([]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Push Notification Test</Text>

      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        <Text>
          Auth:{" "}
          {auth.isAuthenticated ? "✅ Authenticated" : "❌ Not authenticated"}
        </Text>
        <Text>User ID: {auth.user?._id || "N/A"}</Text>
        <Text>Platform: {require("react-native").Platform.OS}</Text>
      </View>

      <View style={styles.buttonSection}>
        <Button title="Test Full Flow" onPress={testFullFlow} />
        <Button title="Test Permissions" onPress={testPermissions} />
        <Button title="Check Distributors" onPress={checkDistributors} />
        <Button
          title="Test Local Notification"
          onPress={testLocalNotification}
        />
        <Button title="Clear Results" onPress={clearResults} />
      </View>

      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>Test Results</Text>
        {testResults.length === 0 ? (
          <Text style={styles.noResults}>
            No test results yet. Run a test above.
          </Text>
        ) : (
          testResults.map((result, index) => (
            <Text key={index} style={styles.result}>
              {result}
            </Text>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  statusSection: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonSection: {
    gap: 10,
    marginBottom: 16,
  },
  resultsSection: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    minHeight: 200,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  result: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: "monospace",
  },
  noResults: {
    fontStyle: "italic",
    color: "#666",
  },
});
