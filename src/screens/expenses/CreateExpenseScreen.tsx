import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AppDispatch, RootState } from "../../store";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createExpenseTransaction,
  fetchGroupTransactions,
  clearFormState,
  clearNavigationState,
  invalidateGroupMembers,
  resetGroupState,
} from "../../store/slices/groupsSlice";
import { fetchGroups, fetchGroupMembers } from "../../store/slices/groupsSlice";
import { ExpensesStackParamList } from "../../navigation/AppNavigator";
import { EXPENSE_CATEGORIES, SPLIT_TYPES } from "../../constants/api";
import { Group, User } from "../../types/api";
import { useTheme } from "../../contexts/ThemeContext";
import { formatCurrency } from "../../utils/currency";
import UserAvatar from "../../components/UserAvatar";
import ModernInputField from "../../components/ModernInputField";
import TransactionTypeToggle from "../../components/TransactionTypeToggle";
import ExpenseSplitModal from "../../components/ExpenseSplitModal";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../constants/theme";

type CreateExpenseScreenNavigationProp = StackNavigationProp<
  ExpensesStackParamList,
  "CreateExpense"
>;
type CreateExpenseScreenRouteProp = RouteProp<
  ExpensesStackParamList,
  "CreateExpense"
>;

interface Props {
  navigation: CreateExpenseScreenNavigationProp;
  route: CreateExpenseScreenRouteProp;
}

interface Split {
  user_id: string;
  amount: number;
}

interface Payer {
  user_id: string;
  amount: number;
}

export default function CreateExpenseScreenImproved({
  navigation,
  route,
}: Props) {
  const { groupId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { colors, components } = useTheme();
  const { isLoading, groups, groupMembers } = useSelector(
    (state: RootState) => state.groups,
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [transactionType, setTransactionType] = useState<"spend" | "income">(
    "spend",
  );
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: EXPENSE_CATEGORIES[0].name,
    split_type: SPLIT_TYPES.EQUAL as "equal" | "exact" | "percentage",
    group_id: groupId || "",
    notes: "",
    tags: "",
    paidTo: "",
  });

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [splits, setSplits] = useState<Split[]>([]);
  const [payers, setPayers] = useState<Payer[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(
    new Date().toLocaleString(),
  );

  // New state for handling splits
  const [splitMembers, setSplitMembers] = useState<User[]>([]);

  const initializedGroupRef = useRef<string | null>(null);
  const fetchAttempts = useRef<{ [groupId: string]: number }>({});

  useEffect(() => {
    dispatch(fetchGroups());
    const interval = setInterval(() => {
      setCurrentDateTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      dispatch(clearNavigationState());
      dispatch(clearFormState());
      fetchAttempts.current = {};

      return () => {
        dispatch(clearFormState());
        dispatch(clearNavigationState());
      };
    }, [formData.group_id]),
  );

  useEffect(() => {
    if (formData.group_id) {
      const group = groups.find((g) => g.id === formData.group_id);

      if (group) {
        setSelectedGroup(group);

        if (initializedGroupRef.current !== formData.group_id) {
          if (group.members && group.members.length > 0) {
            const hasFullUserData = group.members.some(
              (member: any) =>
                member &&
                typeof member === "object" &&
                (member.id || member._id),
            );

            if (!hasFullUserData) {
              const lastFetchTime = fetchAttempts.current[group.id] || 0;
              const now = Date.now();
              const FETCH_COOLDOWN = 5000;

              if (now - lastFetchTime > FETCH_COOLDOWN) {
                fetchAttempts.current[group.id] = now;
                dispatch(fetchGroupMembers(group.id));
              }
            }

            initializeSplits(group);
            initializedGroupRef.current = formData.group_id;
          } else {
            if (user?._id) {
              const fallbackSplits = [{ user_id: user._id, amount: 0 }];
              const fallbackPayers = [{ user_id: user._id, amount: 0 }];
              setSplits(fallbackSplits);
              setPayers(fallbackPayers);
              initializedGroupRef.current = formData.group_id;
            }
          }
        }
      }
    }
  }, [formData.group_id, groups, user?._id]);

  useEffect(() => {
    if (formData.group_id && groupMembers && groupMembers.length > 0) {
      const currentGroup = groups.find((g) => g.id === formData.group_id);
      if (
        currentGroup &&
        currentGroup.members &&
        currentGroup.members.length > 0
      ) {
        const hasFullUserData = currentGroup.members.some(
          (member: any) =>
            member && typeof member === "object" && (member.id || member._id),
        );

        if (
          hasFullUserData &&
          initializedGroupRef.current !== formData.group_id
        ) {
          setSelectedGroup(currentGroup);
          initializeSplits(currentGroup);
          initializedGroupRef.current = formData.group_id;
        }
      }
    }
  }, [groupMembers]);

  useEffect(() => {
    if (
      formData.split_type === SPLIT_TYPES.EQUAL &&
      formData.amount &&
      splits.length > 0
    ) {
      calculateEqualSplit();
    }
  }, [formData.amount, formData.split_type, splits.length]);

  // Update split members when group changes
  useEffect(() => {
    if (selectedGroup && selectedGroup.members) {
      const members = selectedGroup.members.map((member: any) => {
        if (typeof member === "string") {
          // Try to find the full user object in groupMembers
          const found = groupMembers?.find((u: any) => u.id === member);
          if (found) {
            return {
              id: found.id,
              name: found.name || found.email || `User ${found.id.slice(-4)}`,
              email: found.email || "",
              role: found.role || "",
              mail_verified: found.mail_verified || false,
              fcm_token: found.fcm_token || "",
              profile_pic_url: found.profile_pic_url || "",
            };
          }
          // Fallback to just user ID
          return {
            id: member,
            name: `User ${member.slice(-4)}`,
            email: "",
            role: "",
            mail_verified: false,
            fcm_token: "",
            profile_pic_url: "",
          };
        }
        return {
          id: member.id || member._id,
          name:
            member.name ||
            member.email ||
            `User ${(member.id || member._id).slice(-4)}`,
          email: member.email || "",
          role: member.role || "",
          mail_verified: member.mail_verified || false,
          fcm_token: member.fcm_token || "",
          profile_pic_url: member.profile_pic_url || "",
        };
      });
      setSplitMembers(members);
    }
  }, [selectedGroup, groupMembers]);

  const initializeSplits = (group: Group) => {
    const initialSplits: Split[] = [];
    const initialPayers: Payer[] = [];
    const addedUserIds = new Set<string>();

    group.members.forEach((member: any) => {
      let userId: string;

      if (typeof member === "string") {
        userId = member;
      } else if (member && (member.id || member._id)) {
        userId = member.id || member._id;
      } else {
        return;
      }

      if (!addedUserIds.has(userId)) {
        initialSplits.push({
          user_id: userId,
          amount: 0,
        });
        addedUserIds.add(userId);
      }
    });

    if (user?._id) {
      initialPayers.push({
        user_id: user._id,
        amount: 0,
      });
    }

    setSplits(initialSplits);
    setPayers(initialPayers);
  };

  const calculateEqualSplit = () => {
    if (!formData.amount || splits.length === 0) {
      return;
    }

    const totalAmount = parseFloat(formData.amount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return;
    }

    const amountPerPerson = totalAmount / splits.length;

    const newSplits = splits.map((split) => ({
      ...split,
      amount: amountPerPerson,
    }));

    let newPayers: Payer[] = [];

    if (user?._id) {
      newPayers = [{ user_id: user._id, amount: totalAmount }];
    } else {
      if (splits.length > 0) {
        newPayers = [{ user_id: splits[0].user_id, amount: totalAmount }];
      }
    }

    setSplits(newSplits);
    setPayers(newPayers);
  };

  const getUserName = (userId: string): string => {
    if (userId === user?._id) {
      return "You";
    }
    const member = splitMembers.find((m) => m.id === userId);
    if (member) {
      if (member.name && member.name.trim().length > 0) return member.name;
      if (member.email && member.email.trim().length > 0) return member.email;
    }
    return `User ${userId.slice(-4)}`;
  };

  const handleCreateExpense = async () => {
    console.log("formData:", formData);
    console.log("selectedGroup:", selectedGroup);

    if (
      !formData.description.trim() ||
      !formData.amount.trim() ||
      !selectedGroup
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      const expenseData = {
        description: formData.description,
        amount: amount,
        category: formData.category,
        split_type: formData.split_type,
        group_id: formData.group_id,
        notes: formData.notes,
        splits: splits,
        payers: payers,
        currency: selectedGroup?.currency || "INR",
      };

      await dispatch(createExpenseTransaction(expenseData)).unwrap();

      Alert.alert("Success", "Expense created successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create expense");
    }
  };

  const handleSaveAndAddAnother = async () => {
    await handleCreateExpense();
    // Reset form for new expense
    setFormData({
      description: "",
      amount: "",
      category: EXPENSE_CATEGORIES[0].name,
      split_type: SPLIT_TYPES.EQUAL as "equal" | "exact" | "percentage",
      group_id: groupId || "",
      notes: "",
      tags: "",
      paidTo: "",
    });
    if (selectedGroup) {
      initializeSplits(selectedGroup);
    }
  };

  const renderSplitPreview = () => {
    if (!selectedGroup || splits.length === 0) return null;

    return (
      <TouchableOpacity
        style={styles.splitPreviewContainer}
        onPress={() => setShowSplitModal(true)}
      >
        <View style={styles.splitHeader}>
          <View style={styles.splitIconContainer}>
            <Ionicons name="people" size={20} color={colors.primary} />
          </View>
          <Text style={styles.splitHeaderText}>Split with</Text>
          <Text style={styles.splitTypeText}>
            {formData.split_type.charAt(0).toUpperCase() +
              formData.split_type.slice(1)}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </View>

        <View style={styles.splitMembersContainer}>
          {splits.slice(0, 3).map((split, index) => (
            <View key={split.user_id} style={styles.splitMemberItem}>
              {(() => {
                const memberObj = splitMembers.find(
                  (m) => m.id === split.user_id,
                );
                return (
                  <UserAvatar
                    user={memberObj}
                    size={32}
                    name={getUserName(split.user_id)}
                  />
                );
              })()}
              <View style={{ flexDirection: "column", flex: 1 }}>
                <Text style={styles.splitMemberName}>
                  {getUserName(split.user_id)}
                </Text>
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "bold",
                    fontSize: 14,
                    marginLeft: spacing.sm,
                  }}
                >
                  {formatCurrency(
                    split.amount,
                    selectedGroup?.currency || "INR",
                  )}
                </Text>
              </View>
              <View style={styles.checkmarkContainer}>
                <Ionicons name="checkmark" size={16} color="#4CAF50" />
              </View>
            </View>
          ))}
          {splits.length > 3 && (
            <Text style={styles.moreMembersText}>
              +{splits.length - 3} more
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      ...typography.h3,
      color: colors.text,
      fontWeight: "600",
    },
    closeButton: {
      padding: spacing.sm,
    },
    content: {
      flex: 1,
      padding: spacing.md,
    },
    transactionTypeContainer: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: borderRadius.full,
      padding: 4,
      marginBottom: spacing.xl,
    },
    transactionTypeButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.full,
      alignItems: "center",
    },
    activeTransactionType: {
      backgroundColor: "#4CAF50",
    },
    transactionTypeText: {
      ...typography.body,
      fontWeight: "600",
    },
    activeTransactionTypeText: {
      color: "#FFFFFF",
    },
    inactiveTransactionTypeText: {
      color: colors.textSecondary,
    },
    amountContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      alignItems: "center",
    },
    amountLabel: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    amountInputContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    currencySymbol: {
      ...typography.h1,
      color: colors.text,
      fontWeight: "300",
      marginRight: spacing.xs,
    },
    amountInput: {
      ...typography.h1,
      color: colors.text,
      fontWeight: "300",
      flex: 1,
      textAlign: "center",
      minWidth: 100,
    },
    fieldContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
    },
    fieldRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    fieldRowLast: {
      borderBottomWidth: 0,
    },
    fieldLabel: {
      ...typography.body,
      color: colors.textSecondary,
      width: 100,
    },
    fieldValue: {
      ...typography.body,
      color: colors.text,
      flex: 1,
    },
    fieldInput: {
      ...typography.body,
      color: colors.text,
      flex: 1,
      padding: 0,
    },
    paymentMethodContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    paymentMethodLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    paymentMethodIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.cardSecondary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    paymentMethodText: {
      ...typography.h4,
      color: colors.text,
      fontWeight: "600",
    },
    expenseToggle: {
      backgroundColor: "#4CAF50",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    expenseToggleText: {
      ...typography.caption,
      color: "#FFFFFF",
      fontWeight: "600",
    },
    splitPreviewContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    splitHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    splitIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.cardSecondary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    splitHeaderText: {
      ...typography.body,
      color: colors.text,
      flex: 1,
    },
    splitTypeText: {
      ...typography.body,
      color: colors.textSecondary,
      marginRight: spacing.sm,
    },
    splitMembersContainer: {
      gap: spacing.md,
    },
    splitMemberItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    splitMemberName: {
      ...typography.body,
      color: colors.text,
      marginLeft: spacing.sm,
      flex: 1,
    },
    checkmarkContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#E8F5E8",
      alignItems: "center",
      justifyContent: "center",
    },
    moreMembersText: {
      ...typography.body,
      color: colors.textSecondary,
      marginLeft: 44,
    },
    actionButtonsContainer: {
      flexDirection: "row",
      gap: spacing.md,
      marginTop: spacing.xl,
    },
    saveAndAddButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: "#4CAF50",
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: "center",
    },
    saveAndAddText: {
      ...typography.body,
      color: "#4CAF50",
      fontWeight: "600",
    },
    saveButton: {
      flex: 1,
      backgroundColor: "#4CAF50",
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: "center",
    },
    saveButtonText: {
      ...typography.body,
      color: "#FFFFFF",
      fontWeight: "600",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: "80%",
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      ...typography.h3,
      color: colors.text,
      fontWeight: "600",
    },
    modalCloseButton: {
      padding: spacing.sm,
    },
    categoryGrid: {
      padding: spacing.lg,
    },
    categoryItem: {
      flex: 1,
      aspectRatio: 1,
      margin: spacing.xs,
      borderRadius: borderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cardSecondary,
    },
    selectedCategoryItem: {
      backgroundColor: colors.primary,
    },
    categoryIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.xs,
    },
    categoryText: {
      ...typography.caption,
      color: colors.text,
      textAlign: "center",
    },
    selectedCategoryText: {
      color: "#FFFFFF",
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      {/* Floating close (X) icon in top-right */}
      <TouchableOpacity
        style={{
          position: "absolute",
          top: spacing.lg,
          right: spacing.lg,
          zIndex: 10,
          backgroundColor: colors.surface,
          borderRadius: 20,
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 4,
        }}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Ionicons name="close" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Amount Input */}
          <View style={[styles.amountContainer, { marginBottom: spacing.md }]}>
            <Text style={styles.amountLabel}>Amount spent</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={formData.amount}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, amount: value }))
                }
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity>
                <Ionicons
                  name="calculator"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Form Fields */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{
                ...typography.h4,
                color: colors.text,
                fontWeight: "bold",
                marginBottom: spacing.xs,
              }}
            >
              Description
            </Text>
            <TextInput
              style={{
                ...typography.body,
                color: colors.text,
                backgroundColor: colors.cardSecondary,
                borderRadius: borderRadius.md,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                fontSize: 16,
              }}
              value={formData.description}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, description: value }))
              }
              placeholder="Enter expense description"
              placeholderTextColor={colors.textSecondary}
              maxLength={80}
            />
          </View>
          {/* Split Preview */}
          {renderSplitPreview()}
          {/* Category Section with horizontal scrollable selector */}
          <View style={[styles.fieldContainer, { marginBottom: spacing.md }]}>
            <Text
              style={{
                ...typography.h4,
                color: colors.text,
                fontWeight: "bold",
                paddingTop: spacing.sm,
                paddingBottom: spacing.xs,
                marginBottom: spacing.xs,
                marginLeft: spacing.lg,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: spacing.md,
              }}
              style={{ marginBottom: spacing.sm }}
            >
              {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = formData.category === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.name}
                    style={{
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.cardSecondary,
                      borderRadius: borderRadius.lg,
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.sm,
                      marginRight: spacing.sm,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? colors.primary : colors.border,
                      shadowColor: "#000",
                      shadowOpacity: isSelected ? 0.1 : 0,
                      shadowRadius: isSelected ? 2 : 0,
                      minWidth: 70,
                    }}
                    activeOpacity={0.85}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, category: cat.name }))
                    }
                  >
                    <LinearGradient
                      colors={cat.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Ionicons name={cat.icon as any} size={20} color="#fff" />
                    </LinearGradient>
                    <Text
                      style={{
                        color: isSelected ? "#fff" : colors.text,
                        fontWeight: "500",
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </ScrollView>
        <View
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <TouchableOpacity
            style={{
              width: "100%",
              backgroundColor: colors.primary,
              borderRadius: borderRadius.md,
              paddingVertical: spacing.md,
              alignItems: "center",
              shadowColor: colors.primary,
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 1,
            }}
            onPress={handleCreateExpense}
            activeOpacity={0.85}
          >
            <Text
              style={{
                ...typography.h4,
                color: "#fff",
                fontWeight: "bold",
                letterSpacing: 0.5,
              }}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Modal */}
      {/* Modals */}
      {/* Category modal removed, replaced by horizontal scroll selector */}

      {/* Split Modal */}
      <ExpenseSplitModal
        visible={showSplitModal}
        onClose={() => setShowSplitModal(false)}
        amount={parseFloat(formData.amount) || 0}
        currency={selectedGroup?.currency || "INR"}
        splits={splits}
        members={splitMembers}
        splitType={formData.split_type}
        onSplitsChange={setSplits}
        onSplitTypeChange={(type) =>
          setFormData((prev) => ({
            ...prev,
            split_type: type as "equal" | "exact" | "percentage",
          }))
        }
        expenseTitle={formData.description || "New Expense"}
      />
    </KeyboardAvoidingView>
  );
}
