import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import CustomDrawerContent from './CustomDrawerContent';

interface WebLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function WebLayout({ children, title = "SharePal" }: WebLayoutProps) {
  const { colors } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');

  // Import screens dynamically to avoid bundling issues
  const ProfileScreen = require('../screens/profile/ProfileScreen').default;
  const SettingsScreen = require('../screens/settings/SettingsScreen').default;
  const EditProfileScreen = require('../screens/profile/EditProfileScreen').default;

  // Declare navigateToScreen first
  const navigateToScreen = (screenName: string) => {
    closeDrawer();
    
    if (Platform.OS === 'web') {
      // Update browser URL
      const newUrl = `/${screenName.toLowerCase()}`;
      window.history.pushState({}, '', newUrl);
      setCurrentScreen(screenName.toLowerCase());
    }
  };

  // Create mock navigation object for screens
  const mockNavigation = {
    navigate: navigateToScreen,
    goBack: () => {
      if (Platform.OS === 'web') {
        window.history.back();
      }
    },
    push: navigateToScreen,
    replace: navigateToScreen,
    reset: () => navigateToScreen('home'),
    canGoBack: () => window.history.length > 1,
    addListener: () => () => {}, // Mock listener
    removeListener: () => {},
    isFocused: () => true,
    getState: () => ({ routes: [], index: 0 }),
    dispatch: () => {},
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'profile':
        return <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />;
      case 'settings':
        return <SettingsScreen navigation={mockNavigation} route={{ params: {} }} />;
      case 'editprofile':
        return <EditProfileScreen navigation={mockNavigation} route={{ params: {} }} />;
      case 'home':
      default:
        return children; // MainTabNavigator
    }
  };

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  // URL-based navigation for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Listen for browser back/forward buttons
      const handlePopState = () => {
        const path = window.location.pathname;
        const screen = path.split('/').pop() || 'home';
        setCurrentScreen(screen);
      };

      window.addEventListener('popstate', handlePopState);
      
      // Set initial screen from URL
      const initialPath = window.location.pathname;
      const initialScreen = initialPath.split('/').pop() || 'home';
      setCurrentScreen(initialScreen);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, []);

  // Create mock drawer props for CustomDrawerContent
  const createDrawerProps = () => {
    return {
      navigation: {
        navigate: navigateToScreen,
        closeDrawer,
        openDrawer: toggleDrawer,
        toggleDrawer,
      },
      state: {
        index: currentScreen === 'home' ? 0 : 
               currentScreen === 'profile' ? 1 :
               currentScreen === 'editprofile' ? 2 :
               currentScreen === 'settings' ? 3 : 0,
        routes: [
          { name: 'MainTabs', key: 'MainTabs' },
          { name: 'Profile', key: 'Profile' },
          { name: 'EditProfile', key: 'EditProfile' },
          { name: 'Settings', key: 'Settings' },
        ],
      },
      descriptors: {
        MainTabs: {
          options: {
            drawerLabel: 'Home',
            drawerIcon: ({ color, size }: any) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          },
        },
        Profile: {
          options: {
            drawerLabel: 'Profile',
            drawerIcon: ({ color, size }: any) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          },
        },
        EditProfile: {
          options: {
            drawerLabel: 'Edit Profile',
            drawerIcon: ({ color, size }: any) => (
              <Ionicons name="person-circle-outline" size={size} color={color} />
            ),
          },
        },
        Settings: {
          options: {
            drawerLabel: 'Settings',
            drawerIcon: ({ color, size }: any) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          },
        },
      },
    };
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
    },
    drawer: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: 280,
      backgroundColor: colors.background,
      zIndex: 1000,
      transform: [{ translateX: isDrawerOpen ? 0 : -280 }],
      borderRightWidth: 1,
      borderRightColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      ...(Platform.OS === 'web' && {
        transition: 'transform 0.3s ease-in-out',
      }),
    },
    content: {
      flex: 1,
    },
    header: {
      height: 60,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      zIndex: 1,
    },
    menuButton: {
      padding: 8,
      marginRight: 16,
      borderRadius: 4,
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
  });

  return (
    <View style={styles.container}>
      {/* Overlay */}
      {isDrawerOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={closeDrawer}
          activeOpacity={1}
        />
      )}

      {/* Drawer */}
      <View style={styles.drawer}>
        <CustomDrawerContent {...createDrawerProps()} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[
              styles.menuButton,
              { backgroundColor: isDrawerOpen ? colors.primaryLight : 'transparent' }
            ]}
            onPress={toggleDrawer}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isDrawerOpen ? "close" : "menu"} 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {currentScreen === 'profile' ? 'Profile' :
             currentScreen === 'settings' ? 'Settings' :
             currentScreen === 'editprofile' ? 'Edit Profile' :
             'Home'}
          </Text>
        </View>
        
        {/* Content */}
        <View style={{ flex: 1 }}>
          {renderCurrentScreen()}
        </View>
      </View>
    </View>
  );
}