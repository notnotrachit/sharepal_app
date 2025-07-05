import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { loadStoredAuth, getCurrentUser } from "../store/slices/authSlice";

interface Props {
  children: React.ReactNode;
}

export default function AuthInitializer({ children }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAuthResult = await dispatch(loadStoredAuth()).unwrap();
        if (storedAuthResult) {
          console.log("Found stored auth, fetching fresh user data...");
          await dispatch(getCurrentUser()).unwrap();
        }
      } catch (error) {
        console.log("Auth initialization failed:", error);
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
});
