import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { hapticFeedback } from '../utils/haptics';
import { spacing, borderRadius, typography } from '../constants/theme';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface SwipeAction {
  text: string;
  icon: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onPress?: () => void;
}

const ACTION_WIDTH = 80;

const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  onPress,
}) => {
  const { colors } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  const handleActionPress = (action: SwipeAction) => {
    hapticFeedback.medium();
    action.onPress();
    swipeableRef.current?.close();
  };

  const renderActions = (
    actions: SwipeAction[],
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (actions.length === 0) return null;

    return (
      <View style={{ flexDirection: 'row', width: actions.length * ACTION_WIDTH }}>
        {actions.map((action, index) => {
          const trans = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [actions.length * ACTION_WIDTH - index * ACTION_WIDTH, 0],
          });
          return (
            <Animated.View key={index} style={{ transform: [{ translateX: trans }] }}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  // { backgroundColor: action.backgroundColor },
                ]}
                onPress={() => handleActionPress(action)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={action.icon as any}
                  size={22}
                  color={action.color}
                />
                <Text style={[styles.actionText, { color: action.color }]}>
                  {action.text}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  const styles = StyleSheet.create({
    actionButton: {
      width: ACTION_WIDTH,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
    },
    actionText: {
      ...typography.caption,
      marginTop: spacing.xs,
      textAlign: 'center',
      fontWeight: '600',
      fontSize: 11,
    },
    touchable: {
      flex: 1,
    }
  });

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={30}
      rightThreshold={40}
      renderLeftActions={(progress, dragX) => renderActions(leftActions, progress, dragX)}
      renderRightActions={(progress, dragX) => renderActions(rightActions, progress, dragX)}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={1} style={styles.touchable}>
        {children}
      </TouchableOpacity>
    </Swipeable>
  );
};

export default SwipeableRow;