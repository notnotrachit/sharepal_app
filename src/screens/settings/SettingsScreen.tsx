import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// Platform-specific constants import
let Constants: any = null;

if (Platform.OS !== 'web') {
  try {
    Constants = require("expo-constants").default;
  } catch (error) {
    console.warn('expo-constants not available on this platform');
  }
}
import { useTheme } from "../../contexts/ThemeContext";
import { notificationService } from "../../services/notificationService";
import { unifiedPushService } from "../../services/unifiedPushService";
import Card from "../../components/Card";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../constants/theme";

type ThemeOption = 'light' | 'dark' | 'system';

interface SettingsScreenProps {
  navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { colors, colorScheme, themeMode, setThemeMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>('system');
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [selectedDistributor, setSelectedDistributor] = useState<string | null>(null);

  useEffect(() => {
    checkNotificationPermissions();
    loadThemePreference();
    loadUnifiedPushDistributors();
  }, []);

  const loadUnifiedPushDistributors = () => {
    if (Platform.OS === 'android') {
      const availableDistributors = unifiedPushService.getAvailableDistributors();
      const savedDistributor = unifiedPushService.getSavedDistributor();
      setDistributors(availableDistributors);
      setSelectedDistributor(savedDistributor);
    }
  };

  const checkNotificationPermissions = async () => {
    try {
      setIsCheckingPermissions(true);
      const hasPermission = await notificationService.checkPermissionStatus();
      setNotificationsEnabled(hasPermission);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const loadThemePreference = async () => {
    try {
      setSelectedTheme(themeMode);
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      try {
        const granted = await notificationService.requestUserPermission();
        if (granted) {
          setNotificationsEnabled(true);
          Alert.alert(
            "Notifications Enabled",
            "You'll now receive notifications for group activities and payment reminders."
          );
        } else {
          setNotificationsEnabled(false);
          Alert.alert(
            "Permission Denied",
            "To enable notifications, please go to Settings and allow notifications for SharePal.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() }
            ]
          );
        }
      } catch (error) {
        setNotificationsEnabled(false);
        Alert.alert("Error", "Failed to enable notifications. Please try again.");
      }
    } else {
      Alert.alert(
        "Disable Notifications",
        "You can disable notifications in your device settings. Would you like to open settings?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      );
    }
  };

  const handleThemeChange = async (theme: ThemeOption) => {
    try {
      setSelectedTheme(theme);
      await setThemeMode(theme);
      Alert.alert(
        "Theme Changed",
        `Theme set to ${theme}. ${theme === 'system' ? 'The app will follow your device theme.' : `The app will use ${theme} theme.`}`
      );
    } catch (error) {
      console.error('Error saving theme preference:', error);
      Alert.alert("Error", "Failed to save theme preference.");
    }
  };

  const handleDistributorChange = (distributorId: string) => {
    try {
      unifiedPushService.saveDistributor(distributorId);
      setSelectedDistributor(distributorId);
      
      const distributor = distributors.find(d => d.id === distributorId);
      Alert.alert(
        "Distributor Changed",
        `Push notifications will now use ${distributor?.name}. You may need to re-register for notifications.`
      );
      
      loadUnifiedPushDistributors();
    } catch (error) {
      Alert.alert("Error", "Failed to change distributor. Please try again.");
    }
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {rightComponent || (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  const renderThemeOption = (theme: ThemeOption, label: string, description: string) => (
    <TouchableOpacity
      style={[
        styles.themeOption,
        selectedTheme === theme && styles.selectedThemeOption
      ]}
      onPress={() => handleThemeChange(theme)}
    >
      <View style={styles.themeOptionContent}>
        <Text style={[
          styles.themeOptionTitle,
          selectedTheme === theme && styles.selectedThemeText
        ]}>
          {label}
        </Text>
        <Text style={[
          styles.themeOptionDescription,
          selectedTheme === theme && styles.selectedThemeDescription
        ]}>
          {description}
        </Text>
      </View>
      {selectedTheme === theme && (
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xl * 2, // Extra bottom padding to ensure content isn't cut off
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      ...shadows.small,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      ...typography.body,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    settingSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    themeSection: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.small,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedThemeOption: {
      backgroundColor: `${colors.primary}10`,
      borderColor: colors.primary,
    },
    themeOptionContent: {
      flex: 1,
    },
    themeOptionTitle: {
      ...typography.body,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    selectedThemeText: {
      color: colors.primary,
    },
    themeOptionDescription: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    selectedThemeDescription: {
      color: colors.primary,
    },
    notificationSwitch: {
      transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
    },
    permissionStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    permissionStatusText: {
      ...typography.caption,
      marginLeft: spacing.sm,
    },
    permissionGranted: {
      color: colors.success,
    },
    permissionDenied: {
      color: colors.error,
    },
    aboutSection: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...shadows.small,
      alignItems: 'center',
    },
    appName: {
      ...typography.h2,
      color: colors.text,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    appVersion: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
    appDescription: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    distributorHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    distributorHeaderContent: {
      flex: 1,
    },
    distributorHeaderTitle: {
      ...typography.body,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    distributorHeaderSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    distributorOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedDistributorOption: {
      backgroundColor: `${colors.primary}10`,
      borderColor: colors.primary,
    },
    distributorContent: {
      flex: 1,
    },
    distributorTitle: {
      ...typography.body,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    selectedDistributorText: {
      color: colors.primary,
    },
    distributorDescription: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    selectedDistributorDescription: {
      color: colors.primary,
    },
    distributorInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: spacing.md,
      backgroundColor: `${colors.primary}05`,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: `${colors.primary}20`,
      marginTop: spacing.md,
    },
    distributorInfoText: {
      ...typography.caption,
      color: colors.textSecondary,
      marginLeft: spacing.sm,
      flex: 1,
      lineHeight: 16,
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card>
          <Card.Content>
            {renderSettingItem(
              "notifications-outline",
              "Push Notifications",
              notificationsEnabled 
                ? "Receive notifications for group activities" 
                : "Enable notifications to stay updated",
              () => {},
              <Switch
                style={styles.notificationSwitch}
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                thumbColor={notificationsEnabled ? colors.primary : colors.textSecondary}
                disabled={isCheckingPermissions}
              />
            )}
            
            <View style={styles.permissionStatus}>
              <Ionicons 
                name={notificationsEnabled ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={notificationsEnabled ? colors.success : colors.error} 
              />
              <Text style={[
                styles.permissionStatusText,
                notificationsEnabled ? styles.permissionGranted : styles.permissionDenied
              ]}>
                {notificationsEnabled ? "Notifications enabled" : "Notifications disabled"}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* UnifiedPush Distributor Section */}
      {Platform.OS === 'android' && distributors.length > 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Provider</Text>
          <Card>
            <Card.Content>
              <View style={styles.distributorHeader}>
                <View style={styles.distributorHeaderContent}>
                  <Text style={styles.distributorHeaderTitle}>Notification Provider</Text>
                  <Text style={styles.distributorHeaderSubtitle}>
                    Choose how you want to receive push notifications
                  </Text>
                </View>
                <Ionicons name="server-outline" size={24} color={colors.primary} />
              </View>
              
              {distributors.map((distributor) => (
                <TouchableOpacity
                  key={distributor.id}
                  style={[
                    styles.distributorOption,
                    selectedDistributor === distributor.id && styles.selectedDistributorOption
                  ]}
                  onPress={() => handleDistributorChange(distributor.id)}
                >
                  <View style={styles.distributorContent}>
                    <Text style={[
                      styles.distributorTitle,
                      selectedDistributor === distributor.id && styles.selectedDistributorText
                    ]}>
                      {distributor.name}
                    </Text>
                    <Text style={[
                      styles.distributorDescription,
                      selectedDistributor === distributor.id && styles.selectedDistributorDescription
                    ]}>
                      {distributor.isInternal ? 'Built-in distributor' : 'External app'} - 
                      {distributor.isConnected ? ' Connected' : ' Available'}
                    </Text>
                  </View>
                  {selectedDistributor === distributor.id && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
              
              <View style={styles.distributorInfo}>
                <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.distributorInfoText}>
                  UnifiedPush allows you to choose your preferred notification provider for better privacy and control.
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.themeSection}>
          {renderThemeOption('light', 'Light', 'Always use light theme')}
          {renderThemeOption('dark', 'Dark', 'Always use dark theme')}
          {renderThemeOption('system', 'System', 'Follow device theme settings')}
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutSection}>
          <Text style={styles.appName}>SharePal</Text>
          <Text style={styles.appVersion}>Version {Constants?.expoConfig?.version || '1.0.0'}</Text>
          <Text style={styles.appDescription}>
            Split expenses with friends and family easily. 
            Track shared costs, settle debts, and manage group finances all in one place.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}