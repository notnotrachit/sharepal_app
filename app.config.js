// app.config.js
export default ({ config }) => ({
  expo: {
    name: "sharepal-mobile",
    slug: "sharepal-mobile",
    version: "1.1.0",
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
      googleServicesFile: "./GoogleService-Info.plist",
      bundleIdentifier: "com.notnotrachit.sharepalmobile",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#111135",
      },
      edgeToEdgeEnabled: true,
      package: "com.notnotrachit.sharepalmobile",
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "af2b596c-1013-4062-adff-7d7d6d16f324",
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/af2b596c-1013-4062-adff-7d7d6d16f324",
    },
    plugins: ["@react-native-firebase/app"],
  },
});
