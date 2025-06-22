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
import { register, clearError } from "../../store/slices/authSlice";
import { AuthStackParamList } from "../../navigation/AppNavigator";
import { useTheme } from "../../constants/ThemeProvider";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../constants/theme";

type RegisterScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "Register"
>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

export default function RegisterScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { colors, components } = useTheme();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleRegister = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    try {
      await dispatch(
        register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        })
      ).unwrap();
    } catch (error: any) {
      Alert.alert("Registration Failed", error);
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
    buttonDisabled: {
      backgroundColor: colors.textSecondary,
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
    errorText: {
      ...typography.bodySmall,
      color: colors.error,
      marginTop: spacing.xs,
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
            <Text style={styles.title}>Join Sharepal</Text>
            <Text style={styles.subtitle}>
              Create your account to start splitting expenses
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
                autoCapitalize="words"
              />
            </View>

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
                placeholder="Create a password"
                placeholderTextColor={colors.textSecondary}
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textSecondary}
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  handleInputChange("confirmPassword", value)
                }
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>
                Already have an account?{" "}
                <Text
                  style={styles.link}
                  onPress={() => navigation.navigate("Login")}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
