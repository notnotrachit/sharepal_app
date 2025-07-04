import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { AppDispatch, RootState } from "../store";
import { logout } from "../store/slices/authSlice";
import { useTheme } from "../constants/ThemeProvider";
import { spacing, borderRadius, typography, shadows } from "../constants/theme";

export default function CustomDrawerContent(
  props: DrawerContentComponentProps
) {
  const dispatch = useDispatch<AppDispatch>();
  const { colors, components } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      paddingTop: spacing.xl + spacing.lg, // Account for status bar
      paddingBottom: spacing.lg,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.md,
      ...shadows.medium,
    },
    userName: {
      ...typography.h3,
      color: colors.text,
      fontWeight: "600",
    },
    userEmail: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    navigationSection: {
      flex: 1,
      paddingTop: spacing.lg,
    },
    navItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      marginHorizontal: spacing.md,
      borderRadius: borderRadius.md,
    },
    activeNavItem: {
      backgroundColor: colors.primaryLight,
    },
    navIcon: {
      marginRight: spacing.md,
      width: 24,
    },
    navText: {
      ...typography.body,
      color: colors.text,
      flex: 1,
    },
    activeNavText: {
      color: colors.primary,
      fontWeight: "600",
    },
    sectionHeader: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    bottomSection: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      marginHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.error,
    },
    logoutText: {
      ...typography.body,
      color: colors.surface,
      fontWeight: "600",
      marginLeft: spacing.md,
    },
  });

  const currentRoute = props.state.routes[props.state.index]?.name;

  const profileItems = [
    { name: "Payment Methods", icon: "card-outline" },
    { name: "Notifications", icon: "notifications-outline" },
    { name: "Settings", icon: "settings-outline" },
    { name: "Help & Support", icon: "help-circle-outline" },
    { name: "Terms & Privacy", icon: "document-text-outline" },
  ];

  return (
    <View style={styles.container}>
      {/* Header with user info */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.profile_pic_url ? (
            <Image 
              source={{ uri: user.profile_pic_url }} 
              style={{ width: 80, height: 80, borderRadius: 40 }} 
              onError={() => {
                // Handle image loading error by falling back to icon
                console.log('Failed to load profile image in drawer');
              }}
            />
          ) : (
            <Ionicons name="person" size={32} color={colors.surface} />
          )}
        </View>
        <Text style={styles.userName}>{user?.name || "User"}</Text>
        <Text style={styles.userEmail}>{user?.email || ""}</Text>
      </View>

      <ScrollView style={styles.navigationSection}>
        {/* Profile Section */}
        <Text style={styles.sectionHeader}>Account</Text>
        {profileItems.map((item) => (
          <TouchableOpacity key={item.name} style={styles.navItem}>
            <View style={styles.navIcon}>
              <Ionicons
                name={item.icon as any}
                size={24}
                color={colors.textSecondary}
              />
            </View>
            <Text style={styles.navText}>{item.name}</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Section with Logout */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.surface} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
