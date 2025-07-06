import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
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

interface LongPressMenuProps {
  children: React.ReactNode;
  actions: MenuAction[];
  disabled?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const LongPressMenu: React.FC<LongPressMenuProps> = ({
  children,
  actions,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  const handleLongPress = () => {
    if (disabled || actions.length === 0) return;

    hapticFeedback.medium();
    
    // Simple center positioning for now
    const menuWidth = 200;
    const menuHeight = actions.length * 50 + 20;
    
    const x = (screenWidth - menuWidth) / 2;
    const y = (screenHeight - menuHeight) / 2;
    
    setMenuPosition({ x, y });
    setIsVisible(true);
    
    // Reset and animate
    scaleAnim.setValue(0);
    opacityAnim.setValue(0);
    
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
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    });
  };

  const handleActionPress = (action: MenuAction) => {
    hapticFeedback.light();
    hideMenu();
    setTimeout(() => action.onPress(), 100);
  };

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: -1000,
      left: -1000,
      right: -1000,
      bottom: -1000,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 9999,
      elevation: 9999,
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlayTouchable: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    menu: {
      position: 'absolute',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.sm,
      minWidth: 200,
      borderWidth: 2,
      borderColor: colors.primary,
      zIndex: 10000,
      elevation: 10000,
      ...shadows.large,
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
    destructiveText: {
      color: colors.error,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.xs,
      marginHorizontal: spacing.md,
    },
  });

  return (
    <View style={{ position: 'relative' }}>
      <TouchableOpacity
        onLongPress={handleLongPress}
        delayLongPress={800}
        activeOpacity={0.9}
        disabled={disabled}
      >
        {children}
      </TouchableOpacity>

      {isVisible && (
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={hideMenu}>
            <View style={styles.overlayTouchable} />
          </TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.menu,
              {
                left: menuPosition.x,
                top: menuPosition.y,
                opacity: opacityAnim,
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={{ ...typography.h4, color: colors.text, marginBottom: spacing.sm }}>
              FIXED MENU TEST
            </Text>
            {actions.map((action, index) => (
              <React.Fragment key={index}>
                {index > 0 && <View style={styles.separator} />}
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
                      { color: action.destructive ? colors.error : (action.color || colors.text) },
                    ]}
                  >
                    {action.title}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </Animated.View>
        </View>
      )}
    </View>
  );
};

export default LongPressMenu;