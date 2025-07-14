import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { formatCurrency } from "../utils/currency";
import UserAvatar from "./UserAvatar";
import { SPLIT_TYPES } from "../constants/api";
import { spacing, borderRadius, typography, shadows } from "../constants/theme";

interface Split {
  user_id: string;
  amount: number;
}

import { User } from "../types/api";

interface Props {
  visible: boolean;
  onClose: () => void;
  amount: number;
  currency: string;
  splits: Split[];
  members: User[];
  splitType: string;
  onSplitsChange: (splits: Split[]) => void;
  onSplitTypeChange: (type: string) => void;
  expenseTitle: string;
}

export default function ExpenseSplitModal({
  visible,
  onClose,
  amount,
  currency,
  splits,
  members,
  splitType,
  onSplitsChange,
  onSplitTypeChange,
  expenseTitle,
}: Props) {
  const { colors } = useTheme();
  const [localSplits, setLocalSplits] = useState<Split[]>(splits);
  const [showSplitOptions, setShowSplitOptions] = useState(false);

  // Initialize localSplits with all members if empty
  useEffect(() => {
    if (visible) {
      if (
        (!localSplits || localSplits.length === 0) &&
        members &&
        members.length > 0
      ) {
        setLocalSplits(
          members.map((m) => ({
            user_id: m.id,
            amount: 0,
          })),
        );
      } else {
        setLocalSplits(splits);
      }
    }
  }, [visible, splits, members]);

  const splitOptions = [
    { id: SPLIT_TYPES.EQUAL, label: "Equally" },
    { id: SPLIT_TYPES.EXACT, label: "By amount" },
    { id: SPLIT_TYPES.PERCENTAGE, label: "By percentage" },
  ];

  const getUserName = (userId: string): string => {
    const member = members.find((m) => m.id === userId);
    if (member) {
      if (member.name && member.name.trim().length > 0) {
        return member.name;
      }
      if (member.email && member.email.trim().length > 0) {
        return member.email;
      }
    }
    return `User ${userId.slice(-4)}`;
  };

  const calculateEqualSplit = () => {
    if (!amount || localSplits.length === 0) return;

    const amountPerPerson = amount / localSplits.length;
    const newSplits = localSplits.map((split) => ({
      ...split,
      amount: amountPerPerson,
    }));

    setLocalSplits(newSplits);
  };

  const updateSplitAmount = (userId: string, newAmount: number) => {
    const newSplits = localSplits.map((split) =>
      split.user_id === userId ? { ...split, amount: newAmount } : split,
    );
    setLocalSplits(newSplits);
  };

  const toggleUserInSplit = (userId: string) => {
    const isIncluded = localSplits.some((split) => split.user_id === userId);

    if (isIncluded) {
      const newSplits = localSplits.filter((split) => split.user_id !== userId);
      setLocalSplits(newSplits);
    } else {
      const newSplits = [...localSplits, { user_id: userId, amount: 0 }];
      setLocalSplits(newSplits);
    }
  };

  const handleSplitTypeChange = (type: string) => {
    onSplitTypeChange(type);
    setShowSplitOptions(false);

    if (type === SPLIT_TYPES.EQUAL) {
      calculateEqualSplit();
    } else if (type === SPLIT_TYPES.PERCENTAGE) {
      // Initialize all splits to 0%
      setLocalSplits(
        members.map((m) => ({
          user_id: m.id,
          amount: 0,
        })),
      );
    } else if (type === SPLIT_TYPES.EXACT) {
      // Initialize all splits to 0 amount
      setLocalSplits(
        members.map((m) => ({
          user_id: m.id,
          amount: 0,
        })),
      );
    }
  };

  const handleSave = () => {
    onSplitsChange(localSplits);
    onClose();
  };

  const getTotalSplit = () => {
    return localSplits.reduce((sum, split) => sum + split.amount, 0);
  };

  // Simple render for debugging
  const renderMember = ({ item }) => (
    <View style={{ padding: 16 }}>
      <Text style={{ color: "white", fontSize: 18 }}>{item.name}</Text>
      <Text style={{ color: "gray", fontSize: 14 }}>{item.id}</Text>
    </View>
  );

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: "90%",
      minHeight: 350,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: spacing.sm,
    },
    headerTitle: {
      ...typography.h3,
      color: colors.text,
      fontWeight: "600",
    },
    saveButton: {
      backgroundColor: "#4CAF50",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    saveButtonText: {
      ...typography.body,
      color: "#FFFFFF",
      fontWeight: "600",
    },
    content: {
      flex: 1,
    },
    expenseInfo: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: "center",
    },
    expenseTitle: {
      ...typography.h3,
      color: colors.text,
      fontWeight: "600",
      marginBottom: spacing.sm,
    },
    amountSplit: {
      ...typography.h2,
      color: colors.text,
      fontWeight: "300",
    },
    splitOptionsContainer: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    splitOptionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      // paddingVertical: ,
    },
    splitOptionText: {
      ...typography.body,
      color: colors.text,
    },
    splitOptionLabel: {
      ...typography.body,
      color: colors.textSecondary,
      flex: 1,
      marginLeft: spacing.sm,
    },
    splitOptionActive: {
      color: colors.primary,
      fontWeight: "600",
    },
    membersContainer: {
      flex: 1,
      padding: spacing.lg,
    },
    membersHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    splitIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#9C27B0",
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    membersTitle: {
      ...typography.h4,
      color: colors.text,
      fontWeight: "600",
      flex: 1,
    },
    membersList: {
      flex: 1,
    },
    memberItem: {
      marginBottom: spacing.lg,
    },
    memberInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    memberName: {
      ...typography.body,
      color: colors.text,
      flex: 1,
      marginLeft: spacing.md,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxSelected: {
      backgroundColor: "#4CAF50",
      borderColor: "#4CAF50",
    },
    splitInputContainer: {
      marginTop: spacing.sm,
      marginLeft: 52,
    },
    percentageContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    splitInput: {
      ...typography.body,
      color: colors.text,
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minWidth: 80,
      textAlign: "center",
    },
    percentageSymbol: {
      ...typography.body,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
      marginRight: spacing.md,
    },
    calculatedAmount: {
      ...typography.body,
      color: colors.primary,
      fontWeight: "600",
    },
    totalContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.lg,
      backgroundColor: colors.cardSecondary,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    totalLabel: {
      ...typography.body,
      color: colors.text,
      fontWeight: "600",
    },
    totalAmount: {
      ...typography.body,
      color: colors.primary,
      fontWeight: "600",
    },
    splitOptionsModal: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      padding: spacing.lg,
      ...shadows.large,
    },
    splitOptionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
    },
    splitOptionCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#4CAF50",
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit expense</Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Expense Info */}
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseTitle}>{expenseTitle}</Text>
            <Text style={styles.amountSplit}>
              {formatCurrency(amount, currency)}
            </Text>
          </View>

          {/* Split Options */}
          <View style={styles.splitOptionsContainer}>
            <TouchableOpacity
              style={styles.splitOptionButton}
              onPress={() => setShowSplitOptions(true)}
            >
              <View style={styles.splitIcon}>
                <Ionicons name="people" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.splitOptionLabel}>Split with</Text>
              <Text style={[styles.splitOptionText, styles.splitOptionActive]}>
                {splitOptions.find((opt) => opt.id === splitType)?.label ||
                  "Equally"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Members List */}
          <View style={{ padding: 0 }}>
            {/* Modern split UI for members */}
            {members && members.length > 0 ? (
              members.map((member) => {
                const memberId = member.id;
                const isIncluded = localSplits.some(
                  (split) => split.user_id === memberId,
                );
                const split = localSplits.find(
                  (split) => split.user_id === memberId,
                );

                return (
                  <View
                    key={memberId}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      marginBottom: 4,
                      backgroundColor: colors.surface,
                      borderRadius: 10,
                    }}
                  >
                    {(() => {
                      const memberObj = members.find((m) => m.id === memberId);
                      return (
                        <UserAvatar
                          user={memberObj}
                          size={32}
                          name={memberObj?.name}
                        />
                      );
                    })()}
                    <Text
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: colors.text,
                        fontSize: 16,
                      }}
                    >
                      {member.name}
                    </Text>
                    {isIncluded && splitType === SPLIT_TYPES.EQUAL && (
                      <Text
                        style={{
                          color: colors.primary,
                          fontWeight: "bold",
                          fontSize: 15,
                          marginRight: 8,
                        }}
                      >
                        {formatCurrency(split?.amount || 0, currency)}
                      </Text>
                    )}
                    {isIncluded && splitType !== SPLIT_TYPES.EQUAL && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 8,
                        }}
                      >
                        <TextInput
                          style={{
                            width: 60,
                            backgroundColor: colors.cardSecondary,
                            color: colors.text,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: colors.border,
                            paddingHorizontal: 8,
                            fontSize: 15,
                          }}
                          value={split?.amount.toString() || "0"}
                          onChangeText={(value) =>
                            updateSplitAmount(memberId, parseFloat(value) || 0)
                          }
                          keyboardType="decimal-pad"
                          placeholder="0"
                          placeholderTextColor={colors.textSecondary}
                        />
                        {splitType === SPLIT_TYPES.PERCENTAGE && (
                          <Text
                            style={{
                              marginLeft: 4,
                              color: colors.textSecondary,
                            }}
                          >
                            %
                          </Text>
                        )}
                        <Text
                          style={{
                            marginLeft: 8,
                            color: colors.primary,
                            fontWeight: "bold",
                            fontSize: 15,
                          }}
                        >
                          {splitType === SPLIT_TYPES.PERCENTAGE
                            ? formatCurrency(
                                ((split?.amount || 0) / 100) * amount,
                                currency,
                              )
                            : formatCurrency(split?.amount || 0, currency)}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={{
                        marginLeft: 8,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: isIncluded
                          ? colors.primary
                          : colors.cardSecondary,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                      onPress={() => toggleUserInSplit(memberId)}
                    >
                      {isIncluded ? (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      ) : (
                        <Ionicons
                          name="ellipse-outline"
                          size={16}
                          color={colors.textSecondary}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <Text style={{ color: "white", padding: 16 }}>
                No members found
              </Text>
            )}
          </View>

          {/* Total */}
          {splitType !== SPLIT_TYPES.EQUAL && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 14,
                paddingHorizontal: 12,
                backgroundColor: colors.surface,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                marginTop: 8,
                borderRadius: 10,
              }}
            >
              <Text
                style={{ fontWeight: "bold", color: colors.text, fontSize: 16 }}
              >
                Total:
              </Text>
              <Text
                style={{
                  fontWeight: "bold",
                  color: colors.primary,
                  fontSize: 16,
                }}
              >
                {splitType === SPLIT_TYPES.PERCENTAGE
                  ? `${getTotalSplit().toFixed(1)}%`
                  : formatCurrency(getTotalSplit(), currency)}
              </Text>
            </View>
          )}

          {/* Split Options Modal */}
          {showSplitOptions && (
            <View style={styles.splitOptionsModal}>
              {splitOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.splitOptionItem}
                  onPress={() => handleSplitTypeChange(option.id)}
                >
                  {splitType === option.id && (
                    <View style={styles.splitOptionCheck}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.splitOptionText,
                      splitType === option.id && styles.splitOptionActive,
                      { marginLeft: splitType === option.id ? 0 : 40 },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
