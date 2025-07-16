import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import CustomDrawerContent from './CustomDrawerContent';

interface WebDrawerProps {
  children: React.ReactNode;
  title?: string;
}

export default function WebDrawer({ children, title = "SharePal" }: WebDrawerProps) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const toggleDrawer = () => {
    console.log('Toggle drawer clicked, current state:', isDrawerOpen);
    const newState = !isDrawerOpen;
    console.log('Setting drawer state to:', newState);
    setIsDrawerOpen(newState);
  };

  const closeDrawer = () => {
    console.log('Closing drawer');
    setIsDrawerOpen(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      ...(Platform.OS === 'web' && {
        height: '100vh',
        overflow: 'hidden',
      }),
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
      borderRightWidth: 1,
      borderRightColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    content: {
      flex: 1,
      ...(Platform.OS === 'web' && {
        overflowY: 'auto',
        height: '100vh',
      }),
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
      backgroundColor: 'transparent',
    },
  });

  // Enhanced navigation for web drawer
  const enhancedNavigation = {
    ...navigation,
    closeDrawer,
    openDrawer: toggleDrawer,
    toggleDrawer,
    navigate: (screenName: string, params?: any) => {
      console.log('WebDrawer navigate called:', screenName, params);
      closeDrawer(); // Close drawer when navigating
      
      try {
        // For web, all screens are in the same stack navigator
        if (screenName === 'Profile' || screenName === 'EditProfile' || screenName === 'Settings' || screenName === 'MainTabs') {
          console.log('Navigating to:', screenName);
          navigation.navigate(screenName, params);
        } else {
          // Fallback to original navigation
          console.log('Fallback navigation to:', screenName);
          navigation.navigate(screenName, params);
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // If navigation fails, try to go to MainTabs as fallback
        navigation.navigate('MainTabs');
      }
    },
  };

  // Mock drawer props for CustomDrawerContent
  const drawerProps = {
    navigation: enhancedNavigation,
    state: {
      index: 0,
      routes: [
        { name: 'MainTabs', key: 'MainTabs' },
        { name: 'Profile', key: 'Profile' },
        { name: 'EditProfile', key: 'EditProfile' },
        { name: 'Settings', key: 'Settings' },
      ],
    },
    descriptors: {},
  };

  console.log('WebDrawer render - isDrawerOpen:', isDrawerOpen);

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
      <View 
        style={[
          styles.drawer, 
          { 
            transform: [{ translateX: isDrawerOpen ? 0 : -280 }],
            ...(Platform.OS === 'web' && {
              transition: 'transform 0.3s ease-in-out',
            })
          }
        ]}
      >
        <CustomDrawerContent {...drawerProps} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Custom Header with Menu Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.menuButton, isDrawerOpen && { backgroundColor: colors.primaryLight }]} 
            onPress={toggleDrawer}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isDrawerOpen ? "close" : "menu"} 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'flex-start', marginLeft: 8 }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: colors.text 
            }}>
              {title}
            </Text>
          </View>
        </View>
        
        <View style={{ 
          flex: 1,
          ...(Platform.OS === 'web' && {
            overflow: 'hidden', // Prevent body scroll
          })
        }}>
          <div style={{
            height: '100%',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}>
            {children}
          </div>
        </View>
      </View>
    </View>
  );
}