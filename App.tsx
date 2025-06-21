import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { store } from "./src/store";
import AppNavigator from "./src/navigation/AppNavigator";
import AuthInitializer from "./src/components/AuthInitializer";
import { ThemeProvider } from "./src/constants/ThemeProvider";

export default function App() {
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
