import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppDispatch, RootState } from "../../store";
import { login, clearError, googleSignIn } from "../../store/slices/authSlice";
import { AuthStackParamList } from "../../navigation/AppNavigator";
import { useTheme } from "../../contexts/ThemeContext";
import { spacing, borderRadius, typography } from "../../constants/theme";

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "Login"
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { colors, components } = useTheme();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await dispatch(login(formData)).unwrap();
    } catch (error: any) {
      Alert.alert("Login Failed", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(googleSignIn()).unwrap();
    } catch (error: any) {
      Alert.alert("Google Sign-In Failed", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) {
      dispatch(clearError());
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
      padding: spacing.xl,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      maxWidth: 400,
      alignSelf: "center",
      width: "100%",
    },
    header: {
      alignItems: "center",
      marginBottom: spacing.xxl,
    },
    title: {
      ...typography.h1,
      color: colors.text,
      textAlign: "center",
      marginBottom: spacing.sm,
      fontWeight: "700",
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: "center",
    },
    form: {
      gap: spacing.lg,
    },
    inputContainer: {
      gap: spacing.sm,
    },
    label: {
      ...typography.bodySmall,
      color: colors.text,
      fontWeight: "600",
    },
    input: {
      ...components.input,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      color: colors.text,
    },
    inputFocused: {
      borderColor: colors.primary,
    },
    primaryButton: {
      ...components.button.primary,
      marginTop: spacing.md,
    },
    primaryButtonText: {
      ...typography.button,
      color: "white",
      textAlign: "center",
    },
    secondaryButton: {
      backgroundColor: "transparent",
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: "center",
      marginTop: spacing.sm,
    },
    secondaryButtonText: {
      ...typography.button,
      color: colors.text,
    },
    buttonDisabled: {
      backgroundColor: colors.textSecondary,
      borderColor: colors.textSecondary,
    },
    linkContainer: {
      marginTop: spacing.xl,
      alignItems: "center",
    },
    linkText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: "center",
    },
    link: {
      color: colors.primary,
      fontWeight: "600",
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>
                Sign In with Google
              </Text>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>
                Don't have an account?{" "}
                <Text
                  style={styles.link}
                  onPress={() => navigation.navigate("Register")}
                >
                  Sign Up
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
