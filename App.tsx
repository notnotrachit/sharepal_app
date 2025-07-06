import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { store } from "./src/store";
import AppNavigator from "./src/navigation/AppNavigator";
import AuthInitializer from "./src/components/AuthInitializer";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { notificationService } from "./src/services/notificationService";

export default function App() {
  useEffect(() => {
    notificationService.requestUserPermission();
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthInitializer>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthInitializer>
      </ThemeProvider>
    </Provider>
  );
}
