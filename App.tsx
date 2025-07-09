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

// Component to handle push notifications after auth is initialized
function PushNotificationHandler() {
  usePushNotifications();
  return null;
}

export default function App() {
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
