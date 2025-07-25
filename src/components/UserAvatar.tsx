import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { User } from "../types/api";
import { shadows } from "../constants/theme";

interface UserAvatarProps {
  user?: User | null;
  userId?: string;
  name?: string;
  size?: "small" | "medium" | "large" | number;
  showBorder?: boolean;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
}

export default function UserAvatar({
  user,
  userId,
  name,
  size = "medium",
  showBorder = false,
  fallbackIcon = "person",
}: UserAvatarProps) {
  const { colors } = useTheme();

  const sizeConfig = {
    small: { width: 32, height: 32, borderRadius: 16, iconSize: 16 },
    medium: { width: 48, height: 48, borderRadius: 24, iconSize: 24 },
    large: { width: 80, height: 80, borderRadius: 40, iconSize: 32 },
  };

  const config =
    typeof size === "number"
      ? {
          width: size,
          height: size,
          borderRadius: size / 2,
          iconSize: size * 0.6,
        }
      : sizeConfig[size];

  const containerStyle = [
    styles.container,
    {
      width: config.width,
      height: config.height,
      borderRadius: config.borderRadius,
      backgroundColor: colors.primary,
      borderWidth: showBorder ? 2 : 0,
      borderColor: colors.surface,
    },
    size === "large" && shadows.medium,
  ];

  const imageStyle = {
    width: config.width,
    height: config.height,
    borderRadius: config.borderRadius,
  };

  // Generate initials from name
  const getInitials = (displayName: string) => {
    return displayName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const displayName = user?.name || name || `User ${userId?.slice(-4) || ""}`;
  const initials = getInitials(displayName);

  return (
    <View style={containerStyle}>
      {user?.profile_pic_url ? (
        <Image
          source={{ uri: user.profile_pic_url }}
          style={imageStyle}
          onError={() => {}}
        />
      ) : (
        <Ionicons
          name={fallbackIcon}
          size={config.iconSize}
          color={colors.surface}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
});
