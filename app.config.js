// app.config.js
export default ({ config }) => ({
  expo: {
    name: "SharePal",
    slug: "sharepal-mobile",
    version: "1.7",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#111135",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.notnotrachit.sharepalmobile",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#111135",
      },
      edgeToEdgeEnabled: true,
      package: "com.notnotrachit.sharepalmobile",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "af2b596c-1013-4062-adff-7d7d6d16f324",
      },
      EXPO_PUBLIC_SERVER_VAPID_KEY:
        process.env.EXPO_PUBLIC_SERVER_VAPID_KEY ||
        "BNbN3OiAQo7FYQVqvzDoHiUQVuLkdOcmvp4xDP05v6twLWGRBXvdkLM6EgIahtR5WOhHXfpQUjSrOBmKikhHVrI",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/af2b596c-1013-4062-adff-7d7d6d16f324",
    },
    plugins: [
      [
        "@hot-updater/react-native",
        {
          channel: "production",
        },
      ],
    ],
  },
});
