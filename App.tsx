import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { store } from "./src/store";
import AppNavigator from "./src/navigation/AppNavigator";
import AuthInitializer from "./src/components/AuthInitializer";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { GlobalOverlayProvider } from "./src/components/PortalLongPressMenu";
import { backgroundNotificationHandler } from "./src/services/backgroundNotificationHandler";
import { usePushNotifications } from "./src/hooks/usePushNotifications";
import { HotUpdater, getUpdateSource } from "@hot-updater/react-native";
import { View, Text } from "react-native";

// Component to handle push notifications after auth is initialized
function PushNotificationHandler() {
  usePushNotifications();
  return null;
}

function App() {
  useEffect(() => {
    // Initialize background notification tracking
    // backgroundNotificationHandler is automatically initialized
    // DON'T cleanup ANYTHING on unmount - we need ALL listeners to persist for background notifications
    // This includes both UnifiedPush listeners AND background state monitoring
    // Cleaning up ANY part can break background notification debugging/functionality
    // return () => {
    //   backgroundNotificationHandler.cleanup(); // This would stop background state monitoring
    // };
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <GlobalOverlayProvider>
          <AuthInitializer>
            <PushNotificationHandler />
            <StatusBar style="auto" />
            <AppNavigator />
          </AuthInitializer>
        </GlobalOverlayProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default HotUpdater.wrap({
  source: getUpdateSource(
    "https://hot-updater.dilutewater.workers.dev/api/check-update",
    {
      updateStrategy: "fingerprint", // or "appVersion"
    },
  ),
  requestHeaders: {
    // if you want to use the request headers, you can add them here
  },
  fallbackComponent: ({ progress, status }) => (
    <View
      style={{
        flex: 1,
        padding: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* You can put a splash image here. */}

      <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
        {status === "UPDATING" ? "Updating..." : "Checking for Update..."}
      </Text>
      {progress > 0 ? (
        <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
          {Math.round(progress * 100)}%
        </Text>
      ) : null}
    </View>
  ),
})(App);
