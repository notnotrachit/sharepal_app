import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../constants/theme";

interface TransactionTypeToggleProps {
  selectedType: 'spend' | 'income';
  onTypeChange: (type: 'spend' | 'income') => void;
  containerStyle?: any;
}

export default function TransactionTypeToggle({
  selectedType,
  onTypeChange,
  containerStyle,
}: TransactionTypeToggleProps) {
  const { colors } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(selectedType === 'spend' ? 0 : 1)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: selectedType === 'spend' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [selectedType]);

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: borderRadius.full,
      padding: 4,
      ...shadows.small,
    },
    buttonContainer: {
      flex: 1,
      position: "relative",
    },
    button: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.full,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },
    activeButton: {
      backgroundColor: "#4CAF50",
    },
    buttonText: {
      ...typography.body,
      fontWeight: "600",
    },
    activeButtonText: {
      color: "#FFFFFF",
    },
    inactiveButtonText: {
      color: colors.textSecondary,
    },
    checkmark: {
      marginRight: spacing.xs,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[
          styles.button,
          selectedType === 'spend' && styles.activeButton,
        ]}
        onPress={() => onTypeChange('spend')}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {selectedType === 'spend' && (
            <Text style={[styles.buttonText, styles.activeButtonText, styles.checkmark]}>
              ✓
            </Text>
          )}
          <Text
            style={[
              styles.buttonText,
              selectedType === 'spend'
                ? styles.activeButtonText
                : styles.inactiveButtonText,
            ]}
          >
            Spend
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          selectedType === 'income' && styles.activeButton,
        ]}
        onPress={() => onTypeChange('income')}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {selectedType === 'income' && (
            <Text style={[styles.buttonText, styles.activeButtonText, styles.checkmark]}>
              ✓
            </Text>
          )}
          <Text
            style={[
              styles.buttonText,
              selectedType === 'income'
                ? styles.activeButtonText
                : styles.inactiveButtonText,
            ]}
          >
            Income
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
