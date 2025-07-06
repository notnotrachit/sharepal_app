import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useDispatch } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppDispatch } from "../../store";
import { sendFriendRequest } from "../../store/slices/friendsSlice";
import { FriendsStackParamList } from "../../navigation/AppNavigator";
import { useTheme } from "../../contexts/ThemeContext";
import AnimatedScreen from "../../components/AnimatedScreen";
import InputGroup from "../../components/InputGroup";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import { spacing, typography } from "../../constants/theme";

type AddFriendScreenNavigationProp = StackNavigationProp<
  FriendsStackParamList,
  "AddFriend"
>;

interface Props {
  navigation: AddFriendScreenNavigationProp;
}

export default function AddFriendScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    formContainer: {
      marginTop: spacing.xl,
    },
    actionContainer: {
      marginTop: spacing.xl,
      gap: spacing.md,
    },
    description: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: spacing.xl,
      lineHeight: 24,
    },
  });

  const handleSendFriendRequest = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(sendFriendRequest({ email: email.trim() })).unwrap();
      Alert.alert("Success", "Friend request sent!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <AnimatedScreen>
        <View style={styles.content}>
          <View style={styles.formContainer}>
            <InputGroup
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter friend's email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
          </View>

          <View style={styles.actionContainer}>
            <PrimaryButton
              title="Send Friend Request"
              onPress={handleSendFriendRequest}
              disabled={!email.trim() || isLoading}
              loading={isLoading}
            />

            <SecondaryButton
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
            />
          </View>
        </View>
      </AnimatedScreen>
    </View>
  );
}
