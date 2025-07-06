import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, Image, ScrollView, RefreshControl } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
// import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AppDispatch, RootState } from "../../store";
import { logout, getCurrentUser } from "../../store/slices/authSlice";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useTheme } from "../../contexts/ThemeContext";
import Card from "../../components/Card";
import SecondaryButton from "../../components/SecondaryButton";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../constants/theme";

type ProfileScreenNavigationProp = StackNavigationProp<any>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { colors, components } = useTheme();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const actualUser = user?.user || user;
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getCurrentUser()).unwrap();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      alignItems: "center",
      padding: spacing.xl,
      backgroundColor: colors.surface,
    },
    avatarContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.md,
      ...shadows.medium,
    },
    avatarImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    avatarText: {
      ...typography.h1,
      color: colors.text,
      fontWeight: "700",
    },
    userName: {
      ...typography.h2,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    userEmail: {
      ...typography.body,
      color: colors.textSecondary,
    },
    menuSection: {
      padding: spacing.lg,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      ...typography.h4,
      color: colors.text,
      marginBottom: spacing.md,
    },
    menuItem: {
      marginBottom: spacing.sm,
    },
    errorText: {
      fontSize: 16,
      color: "#6B7280",
      textAlign: "center",
      marginTop: 50,
      fontFamily: "Inter",
    },
  });

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
  if (isLoading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (!user && !isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {actualUser?.profile_pic_url ? (
            <Image 
              source={{ uri: actualUser.profile_pic_url }} 
              style={styles.avatarImage}
              onError={() => {
                // Handle image loading error by falling back to icon
              }}
            />
          ) : (
            <Ionicons name="person" size={40} color={colors.surface} />
          )}
        </View>
        <Text style={styles.userName}>
          {actualUser?.name || "User"}
        </Text>
        <Text style={styles.userEmail}>
          {actualUser?.email || "No email"}
        </Text>
      </View>

      <View style={styles.menuSection}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Card 
            style={styles.menuItem}
            onPress={() => navigation.navigate("EditProfile" as never)}
          >
            <Card.Header
              title="Edit Profile"
              icon="person-circle-outline"
              rightElement={
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textMuted}
                />
              }
            />
          </Card>

          <Card style={styles.menuItem}>
            <Card.Header
              title="Payment Methods"
              icon="card-outline"
              rightElement={
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textMuted}
                />
              }
            />
          </Card>

          <Card style={styles.menuItem}>
            <Card.Header
              title="Notifications"
              icon="notifications-outline"
              rightElement={
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textMuted}
                />
              }
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <Card style={styles.menuItem}>
            <Card.Header
              title="Help & Support"
              icon="help-circle-outline"
              rightElement={
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textMuted}
                />
              }
            />
          </Card>

          <Card style={styles.menuItem}>
            <Card.Header
              title="Terms & Privacy"
              icon="document-text-outline"
              rightElement={
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textMuted}
                />
              }
            />
          </Card>
        </View>

        <SecondaryButton
          title="Logout"
          icon="log-out-outline"
          onPress={handleLogout}
          variant="error"
          style={{ margin: spacing.lg }}
        />
      </View>
    </ScrollView>
  );
}
