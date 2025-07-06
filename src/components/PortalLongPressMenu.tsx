import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { hapticFeedback } from '../utils/haptics';
import { spacing, borderRadius, typography, shadows } from '../constants/theme';

interface MenuAction {
  title: string;
  icon: string;
  color?: string;
  onPress: () => void;
  destructive?: boolean;
}

interface PortalLongPressMenuProps {
  children: React.ReactNode;
  actions: MenuAction[];
  disabled?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Global overlay container - this will be rendered at the root level
let globalOverlayContainer: React.RefObject<any> | null = null;
let setGlobalOverlay: ((overlay: React.ReactNode) => void) | null = null;

export const GlobalOverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [overlay, setOverlay] = useState<React.ReactNode>(null);
  
  // Make the setter available globally
  React.useEffect(() => {
    setGlobalOverlay = setOverlay;
    return () => {
      setGlobalOverlay = null;
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {overlay}
    </View>
  );
};

const PortalLongPressMenu: React.FC<PortalLongPressMenuProps> = ({
  children,
  actions,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handleLongPress = () => {
    if (disabled || actions.length === 0 || !setGlobalOverlay) return;

    hapticFeedback.medium();
    console.log('PortalLongPressMenu: Long press detected, showing overlay...');
    
    setIsVisible(true);
    
    // Reset animations
    scaleAnim.setValue(0);
    opacityAnim.setValue(0);
    
    // Create the overlay content
    const overlayContent = (
      <View style={styles.globalOverlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          onPress={hideMenu}
          activeOpacity={1}
        />
        <Animated.View
          style={[
            styles.menu,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.debugText, { color: colors.text }]}>
            PORTAL MENU WORKING! 🎉
          </Text>
          {actions.map((action, index) => (
            <React.Fragment key={index}>
              {index > 0 && <View style={[styles.separator, { backgroundColor: colors.border }]} />}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleActionPress(action)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={action.icon as any}
                  size={20}
                  color={action.destructive ? colors.error : (action.color || colors.text)}
                  style={styles.menuIcon}
                />
                <Text
                  style={[
                    styles.menuText,
                    { 
                      color: action.destructive ? colors.error : (action.color || colors.text),
                    },
                  ]}
                >
                  {action.title}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </Animated.View>
      </View>
    );
    
    // Show the overlay at the global level
    setGlobalOverlay(overlayContent);
    
    // Animate in
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideMenu = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      if (setGlobalOverlay) {
        setGlobalOverlay(null);
      }
    });
  };

  const handleActionPress = (action: MenuAction) => {
    hapticFeedback.light();
    console.log('PortalLongPressMenu: Action pressed:', action.title);
    hideMenu();
    setTimeout(() => action.onPress(), 100);
  };

  const styles = StyleSheet.create({
    globalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99999,
      elevation: 99999,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    menu: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.sm,
      minWidth: 250,
      maxWidth: screenWidth - 40,
      borderWidth: 3,
      borderColor: '#00FF00', // Bright green border for debugging
      ...shadows.large,
    },
    debugText: {
      ...typography.h4,
      textAlign: 'center',
      marginBottom: spacing.md,
      fontWeight: 'bold',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      minHeight: 50,
    },
    menuIcon: {
      marginRight: spacing.md,
      width: 24,
      textAlign: 'center',
    },
    menuText: {
      ...typography.body,
      flex: 1,
    },
    separator: {
      height: 1,
      marginVertical: spacing.xs,
      marginHorizontal: spacing.md,
    },
  });

  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      delayLongPress={800}
      activeOpacity={0.9}
      disabled={disabled}
    >
      {children}
    </TouchableOpacity>
  );
};

export default PortalLongPressMenu;