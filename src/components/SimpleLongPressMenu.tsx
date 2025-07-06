import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { hapticFeedback } from '../utils/haptics';
import { spacing, borderRadius, typography } from '../constants/theme';

interface MenuAction {
  title: string;
  icon: string;
  onPress: () => void;
  destructive?: boolean;
}

interface SimpleLongPressMenuProps {
  children: React.ReactNode;
  actions: MenuAction[];
}

const SimpleLongPressMenu: React.FC<SimpleLongPressMenuProps> = ({
  children,
  actions,
}) => {
  const { colors } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const handleLongPress = () => {
    console.log('SimpleLongPressMenu: Long press detected');
    hapticFeedback.medium();
    setShowMenu(true);
  };

  const handleActionPress = (action: MenuAction) => {
    console.log('SimpleLongPressMenu: Action pressed:', action.title);
    setShowMenu(false);
    action.onPress();
  };

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
    },
    menuOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 1000,
      elevation: 1000,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menu: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      minWidth: 200,
      borderWidth: 3,
      borderColor: '#FF0000', // Red border for debugging
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    menuIcon: {
      marginRight: spacing.md,
    },
    menuText: {
      ...typography.body,
      color: colors.text,
    },
    destructiveText: {
      color: colors.error,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onLongPress={handleLongPress}
        delayLongPress={800}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>

      {showMenu && (
        <View style={styles.menuOverlay}>
          <View style={styles.menu}>
            <Text style={{ ...typography.h4, color: colors.text, marginBottom: spacing.md }}>
              DEBUG MENU VISIBLE!
            </Text>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleActionPress(action)}
              >
                <Ionicons
                  name={action.icon as any}
                  size={20}
                  color={action.destructive ? colors.error : colors.text}
                  style={styles.menuIcon}
                />
                <Text
                  style={[
                    styles.menuText,
                    action.destructive && styles.destructiveText,
                  ]}
                >
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm }]}
              onPress={() => setShowMenu(false)}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: colors.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default SimpleLongPressMenu;