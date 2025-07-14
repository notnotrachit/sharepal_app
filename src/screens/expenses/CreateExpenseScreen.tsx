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
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AppDispatch, RootState } from "../../store";
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
import CreateExpenseSkeleton from "../../components/skeletons/CreateExpenseSkeleton";
import InputGroup from "../../components/InputGroup";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
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

export default function CreateExpenseScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { colors, components } = useTheme();
  const { isLoading, groups, groupMembers } = useSelector(
    (state: RootState) => state.groups
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: EXPENSE_CATEGORIES[0].name,
    split_type: SPLIT_TYPES.EQUAL as string,
    group_id: groupId || "",
    notes: "",
  });

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [splits, setSplits] = useState<Split[]>([]);
  const [payers, setPayers] = useState<Payer[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSplitTypeModal, setShowSplitTypeModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Ref to track if we've already initialized splits for the current group
  const initializedGroupRef = useRef<string | null>(null);
  const fetchAttempts = useRef<{ [groupId: string]: number }>({});

  useEffect(() => {
    dispatch(fetchGroups());
  }, []); // Focus effect to handle state cleanup when screen is focused
  useFocusEffect(
    useCallback(() => {

      // Clear any navigation state and form errors when screen is focused
      dispatch(clearNavigationState());
      dispatch(clearFormState());

      // Clear fetch attempts to allow fresh fetching on focus
      fetchAttempts.current = {};

      // Cleanup function when leaving the screen
      return () => {
        dispatch(clearFormState());
        dispatch(clearNavigationState());
      };
    }, [formData.group_id])
  );

  // Main effect to handle group initialization and member fetching
  useEffect(() => {
    if (formData.group_id) {
      const group = groups.find((g) => g.id === formData.group_id);

      if (group) {
        setSelectedGroup(group);

        // Check if we need to initialize splits
        if (initializedGroupRef.current !== formData.group_id) {

          // Try to initialize with current group data
          if (group.members && group.members.length > 0) {
            // Check if we have full user objects or just IDs
            const hasFullUserData = group.members.some(
              (member: any) =>
                member &&
                typeof member === "object" &&
                (member.id || member._id)
            );

            if (!hasFullUserData) {
              // We only have user IDs, try to fetch full member data (with cooldown)
              const lastFetchTime = fetchAttempts.current[group.id] || 0;
              const now = Date.now();
              const FETCH_COOLDOWN = 5000; // 5 seconds cooldown

              if (now - lastFetchTime > FETCH_COOLDOWN) {
                fetchAttempts.current[group.id] = now;
                dispatch(fetchGroupMembers(group.id));
              }
            }

            // Initialize splits with whatever data we have
            initializeSplits(group);
            initializedGroupRef.current = formData.group_id;
          } else {
            // Group has no members or empty members array

            // Initialize with just current user
            if (user?.id) {
              const fallbackSplits = [{ user_id: user.id, amount: 0 }];
              const fallbackPayers = [{ user_id: user.id, amount: 0 }];
              setSplits(fallbackSplits);
              setPayers(fallbackPayers);
              initializedGroupRef.current = formData.group_id;
            }
          }
        }
      }
    }
  }, [formData.group_id, groups, user?.id]);

  // Effect to handle when group members are updated after fetchGroupMembers
  useEffect(() => {
    if (formData.group_id && groupMembers && groupMembers.length > 0) {
      const currentGroup = groups.find((g) => g.id === formData.group_id);
      if (
        currentGroup &&
        currentGroup.members &&
        currentGroup.members.length > 0
      ) {
        // Check if this group update has full user objects now
        const hasFullUserData = currentGroup.members.some(
          (member: any) =>
            member && typeof member === "object" && (member.id || member._id)
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

  const initializeSplits = (group: Group) => {

    const initialSplits: Split[] = [];
    const initialPayers: Payer[] = [];
    const addedUserIds = new Set<string>();

    // Add all group members to splits, avoiding duplicates
    group.members.forEach((member: any) => {
      let userId: string;

      // Handle both string (user ID) and object (full user data) formats
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

    // Initialize payers - by default, current user pays the full amount
    if (user?.id) {
      initialPayers.push({
        user_id: user.id,
        amount: 0, // Will be set when amount is entered
      });
    }

    // Validate the splits against the group members


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
    
    if (user?.id) {
      newPayers = [{ user_id: user.id, amount: totalAmount }];
    } else {
      if (splits.length > 0) {
        newPayers = [{ user_id: splits[0].user_id, amount: totalAmount }];
      }
    }

    setSplits(newSplits);
    setPayers(newPayers);
  };

  const updateSplitAmount = (userId: string, amount: number) => {
    setSplits((prev) =>
      prev.map((split) =>
        split.user_id === userId ? { ...split, amount } : split
      )
    );
  };

  const updateSplitPercentage = (userId: string, percentage: number) => {
    setSplits((prev) =>
      prev.map((split) =>
        split.user_id === userId ? { ...split, amount: percentage } : split
      )
    );
  };

  const calculatePercentageSplit = () => {
    if (!formData.amount || splits.length === 0) {
      return;
    }

    const totalAmount = parseFloat(formData.amount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return;
    }

    // Convert percentages to actual amounts
    const newSplits = splits.map((split) => ({
      ...split,
      amount: (split.amount / 100) * totalAmount,
    }));

    setSplits(newSplits);
  };

  const updatePayerAmount = (userId: string, amount: number) => {
    setPayers((prev) =>
      prev.map((payer) =>
        payer.user_id === userId ? { ...payer, amount } : payer
      )
    );
  };

  const validatePayersAndSplits = () => {
    const totalAmount = parseFloat(formData.amount);
    let currentPayers = [...payers];
    
    if (formData.split_type === SPLIT_TYPES.EQUAL) {
      if (currentPayers.length === 0 && splits.length > 0) {
        // Create a payer using the first split user
        currentPayers = [{ user_id: splits[0].user_id, amount: totalAmount }];
      } else if (currentPayers.length > 0) {
        // Update existing payer amounts to match total (fix stale state)
        currentPayers = currentPayers.map(payer => ({
          ...payer,
          amount: totalAmount // For equal split, one person pays the full amount
        }));
      }
    }
    const payerTotal = currentPayers.reduce((sum, payer) => sum + payer.amount, 0);

    // Validate that payer total equals the expense amount
    const payerDifference = Math.abs(totalAmount - payerTotal);
    if (payerDifference > 0.01) {
      return false;
    }
    console.log('[PASS] Payer validation passed');
    
    // Update the actual payers state if we created an emergency payer
    if (currentPayers !== payers && currentPayers.length > 0) {
      setPayers(currentPayers);
    }

    // Validate splits based on split type
    if (formData.split_type === SPLIT_TYPES.EXACT) {
      const splitTotal = splits.reduce((sum, split) => sum + split.amount, 0);
      const splitDifference = Math.abs(totalAmount - splitTotal);
      const isValid = splitDifference < 0.01;
      return isValid;
    }

    if (formData.split_type === SPLIT_TYPES.EQUAL) {
      const splitTotal = splits.reduce((sum, split) => sum + split.amount, 0);
      const splitDifference = Math.abs(totalAmount - splitTotal);
      // Use a more lenient tolerance for equal splits due to floating point precision
      const tolerance = 0.02; // 2 cents tolerance
      const isValid = splitDifference < tolerance;
      return isValid;
    }

    if (formData.split_type === SPLIT_TYPES.PERCENTAGE) {
      // For percentage validation, we need to check the original percentages
      const percentageTotal = splits.reduce((sum, split) => {
        // During percentage input, split.amount stores the percentage
        return sum + split.amount;
      }, 0);
      const percentageDifference = Math.abs(percentageTotal - 100);
      const isValid = percentageDifference < 0.01;
      return isValid;
    }

    return true;
  };

  const handleCreateExpense = async () => {
    if (!formData.description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!formData.group_id) {
      Alert.alert("Error", "Please select a group");
      return;
    }

    if (!validatePayersAndSplits()) {
      let errorMessage = "Split amounts do not match the total expense amount";
      if (formData.split_type === SPLIT_TYPES.PERCENTAGE) {
        errorMessage = "Split percentages do not add up to 100%";
      }
      Alert.alert("Error", errorMessage);
      return;
    }

    try {
      // Prepare splits for submission
      let finalSplits = splits;

      // For percentage splits, convert percentages to actual amounts
      if (formData.split_type === SPLIT_TYPES.PERCENTAGE) {
        const totalAmount = parseFloat(formData.amount);
        finalSplits = splits.map((split) => ({
          ...split,
          amount: (split.amount / 100) * totalAmount,
        }));
      }

      const expenseData = {
        group_id: formData.group_id,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        currency: selectedGroup?.currency || "USD",
        category: formData.category,
        split_type: formData.split_type as any,
        payers: payers,
        splits: finalSplits,
        notes: formData.notes.trim() || undefined,
      };
      

      const newExpense = await dispatch(
        createExpenseTransaction(expenseData)
      ).unwrap();

      // Refresh group transactions
      dispatch(fetchGroupTransactions({ groupId: formData.group_id }));

      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message || error.toString() || "Unknown error occurred");
    }
  };

  const renderCategoryItem = ({ item }: { item: any }) => {
    const isSelected = formData.category === item.name;
    return (
      <TouchableOpacity
        style={[
          styles.categoryGridItem,
          isSelected && styles.selectedCategoryItem,
        ]}
        onPress={() => {
          setFormData((prev) => ({ ...prev, category: item.name }));
          setShowCategoryModal(false);
        }}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.categoryIconContainer,
            isSelected && styles.selectedCategoryIcon,
          ]}
        >
          <Ionicons name={item.icon as any} size={24} color="#fff" />
        </LinearGradient>
        <Text
          style={[
            styles.categoryName,
            isSelected && { color: colors.primary, fontWeight: "600" },
          ]}
        >
          {item.name}
        </Text>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSplitTypeItem = ({ item }: { item: string }) => {
    const isSelected = formData.split_type === item;
    return (
      <TouchableOpacity
        style={[
          styles.modalItem,
          isSelected && { backgroundColor: colors.cardSecondary },
        ]}
        onPress={() => {
          setFormData((prev) => ({ ...prev, split_type: item }));
          setShowSplitTypeModal(false);
          if (item === SPLIT_TYPES.EQUAL) {
            calculateEqualSplit();
          } else if (item === SPLIT_TYPES.PERCENTAGE) {
            // Initialize percentage splits with equal percentages
            const equalPercentage = 100 / splits.length;
            const newSplits = splits.map((split) => ({
              ...split,
              amount: equalPercentage,
            }));
            setSplits(newSplits);
          } else if (item === SPLIT_TYPES.EXACT) {
            // Reset to zero amounts for exact input
            const newSplits = splits.map((split) => ({
              ...split,
              amount: 0,
            }));
            setSplits(newSplits);
          }
        }}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.modalItemText,
            isSelected && { color: colors.primary, fontWeight: "600" },
          ]}
        >
          {item.charAt(0).toUpperCase() + item.slice(1)}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderGroupItem = ({ item }: { item: Group }) => {
    const isSelected = formData.group_id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.modalItem,
          isSelected && { backgroundColor: colors.cardSecondary },
        ]}
        onPress={() => {
          setFormData((prev) => ({ ...prev, group_id: item.id }));
          setShowGroupModal(false);
        }}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.modalItemText,
              isSelected && { color: colors.primary, fontWeight: "600" },
            ]}
          >
            {item.name}
          </Text>
          {item.description && (
            <Text
              style={[
                styles.modalItemText,
                {
                  color: colors.textSecondary,
                  fontSize: 14,
                  marginTop: 2,
                },
              ]}
            >
              {item.description}
            </Text>
          )}
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const getUserName = (userId: string) => {
    if (userId === user?.id) return "You";

    // First, try to find the user in the selected group's members
    if (selectedGroup) {
      const member = selectedGroup.members?.find((m: any) => {
        // Handle both string (user ID) and object (full user data) formats
        if (typeof m === "string") {
          return m === userId;
        }
        return (m.id || m._id) === userId;
      });

      // If we found a member and it's a full user object, return the name
      if (member && typeof member === "object") {
        return (
          (member as any)?.name ||
          (member as any)?.email ||
          `User ${userId.slice(-4)}`
        );
      }
    }

    // If we didn't find a full user object in the group, try the global groupMembers state
    // This contains the full user objects fetched by fetchGroupMembers
    if (groupMembers && groupMembers.length > 0) {
      const member = groupMembers.find((m: any) => (m.id || m._id) === userId);

      if (member) {
        return member.name || member.email || `User ${userId.slice(-4)}`;
      }
    }

    // Final fallback
    return `User ${userId.slice(-4)}`;
  };

  useEffect(() => {
    // Update payer amount when total amount changes (for single payer scenario)
    if (formData.amount && payers.length > 0) {
      const totalAmount = parseFloat(formData.amount);
      if (!isNaN(totalAmount) && totalAmount > 0) {
        // Update the current user's payer amount to match the total
        const newPayers = payers.map((payer) => ({
          ...payer,
          amount: payer.user_id === user?.id ? totalAmount : payer.amount,
        }));
        setPayers(newPayers);
      }
    }
  }, [formData.amount, user?.id]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.lg,
    },
    form: {
      gap: spacing.lg,
    },
    selector: {
      ...components.input,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    selectorText: {
      ...typography.body,
      color: colors.text,
    },
    splitItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    splitUser: {
      ...typography.body,
      color: colors.text,
      flex: 1,
    },
    splitAmount: {
      ...typography.body,
      color: colors.primary,
      fontWeight: "600",
    },
    splitInput: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: borderRadius.sm,
      padding: spacing.sm,
      width: 80,
      textAlign: "center",
      color: colors.text,
    },
    percentageInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    percentageInput: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.sm,
    },
    percentageSymbol: {
      ...typography.body,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
    calculatedAmount: {
      ...typography.body,
      color: colors.primary,
      fontWeight: "600",
      marginLeft: spacing.sm,
    },
    percentageTotal: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.md,
    },
    percentageTotalText: {
      ...typography.body,
      color: colors.primary,
      fontWeight: "600",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.lg,
    },
    modalContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      width: "90%",
      maxWidth: 400,
      maxHeight: "80%",
      ...shadows.medium,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
    },
    modalTitle: {
      ...typography.h3,
      color: colors.text,
      flex: 1,
      fontWeight: "600",
    },
    modalCloseButton: {
      padding: spacing.sm,
      marginLeft: spacing.md,
      borderRadius: borderRadius.full,
      backgroundColor: colors.cardSecondary,
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    },
    modalList: {
      maxHeight: 400,
    },
    modalItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.lg,
      backgroundColor: colors.surface,
      minHeight: 56,
    },
    modalItemText: {
      ...typography.body,
      color: colors.text,
      flex: 1,
      fontSize: 16,
    },
    categorySelector: {
      ...components.input,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    selectedCategoryDisplay: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    selectedCategoryIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.md,
      ...shadows.small,
    },
    categoryGrid: {
      maxHeight: 400,
    },
    categoryGridContent: {
      padding: spacing.md,
    },
    categoryRow: {
      justifyContent: "space-between",
      paddingHorizontal: spacing.sm,
    },
    categoryGridItem: {
      flex: 1,
      aspectRatio: 1,
      margin: spacing.xs,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "transparent",
      ...shadows.small,
      maxWidth: "30%",
    },
    selectedCategoryItem: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}10`,
    },
    categoryIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.sm,
      ...shadows.small,
    },
    categoryName: {
      ...typography.caption,
      color: colors.text,
      textAlign: "center",
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "500",
    },
    selectedBadge: {
      position: "absolute",
      top: spacing.xs,
      right: spacing.xs,
      backgroundColor: colors.surface,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
      ...shadows.small,
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <InputGroup
          label="Description"
          value={formData.description}
          onChangeText={(value) =>
            setFormData((prev) => ({ ...prev, description: value }))
          }
          placeholder="What was this expense for?"
          required
        />

        <InputGroup
          label="Amount"
          value={formData.amount}
          onChangeText={(value) => {
            setFormData((prev) => ({ ...prev, amount: value }));
          }}
          placeholder="0.00"
          keyboardType="decimal-pad"
          required
        />

        <View style={{ marginBottom: spacing.md }}>
          <Text
            style={{
              ...typography.h4,
              color: colors.text,
              marginBottom: spacing.xs,
            }}
          >
            Group *
          </Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowGroupModal(true)}
          >
            <Text style={styles.selectorText}>
              {selectedGroup ? selectedGroup.name : "Select a group"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <Text
            style={{
              ...typography.h4,
              color: colors.text,
              marginBottom: spacing.xs,
            }}
          >
            Category
          </Text>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryModal(true)}
          >
            {(() => {
              const selectedCategory = EXPENSE_CATEGORIES.find(cat => cat.name === formData.category);
              return selectedCategory ? (
                <View style={styles.selectedCategoryDisplay}>
                  <LinearGradient
                    colors={selectedCategory.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.selectedCategoryIcon}
                  >
                    <Ionicons name={selectedCategory.icon as any} size={20} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.selectorText}>{selectedCategory.name}</Text>
                </View>
              ) : (
                <Text style={styles.selectorText}>Select Category</Text>
              );
            })()}
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <Text
            style={{
              ...typography.h4,
              color: colors.text,
              marginBottom: spacing.xs,
            }}
          >
            Split Type
          </Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowSplitTypeModal(true)}
          >
            <Text style={styles.selectorText}>
              {formData.split_type.charAt(0).toUpperCase() +
                formData.split_type.slice(1)}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {splits.length > 0 && (
          <View style={{ marginBottom: spacing.md }}>
            <Text
              style={{
                ...typography.h4,
                color: colors.text,
                marginBottom: spacing.xs,
              }}
            >
              Split Details
            </Text>
            {splits.map((split, index) => (
              <View key={`${split.user_id}-${index}`} style={styles.splitItem}>
                <Text style={styles.splitUser}>
                  {getUserName(split.user_id)}
                </Text>
                {formData.split_type === SPLIT_TYPES.EQUAL ? (
                  <Text style={styles.splitAmount}>
                    {formatCurrency(split.amount, selectedGroup?.currency || 'INR')}
                  </Text>
                ) : formData.split_type === SPLIT_TYPES.PERCENTAGE ? (
                  <View style={styles.percentageInputContainer}>
                    <View style={styles.percentageInput}>
                      <TextInput
                        style={[styles.splitInput, { color: colors.text }]}
                        value={split.amount.toString()}
                        placeholderTextColor={colors.textSecondary}
                        onChangeText={(value) =>
                          updateSplitPercentage(
                            split.user_id,
                            parseFloat(value) || 0
                          )
                        }
                        keyboardType="decimal-pad"
                        placeholder="0"
                      />
                      <Text style={styles.percentageSymbol}>%</Text>
                    </View>
                    {formData.amount && parseFloat(formData.amount) > 0 && (
                      <Text style={styles.calculatedAmount}>
                        {formatCurrency(
                          (split.amount / 100) * parseFloat(formData.amount),
                          selectedGroup?.currency || 'INR'
                        )}
                      </Text>
                    )}
                  </View>
                ) : (
                  <TextInput
                    style={[styles.splitInput, { color: colors.text }]}
                    value={split.amount.toString()}
                    placeholderTextColor={colors.textSecondary}
                    onChangeText={(value) =>
                      updateSplitAmount(split.user_id, parseFloat(value) || 0)
                    }
                    keyboardType="decimal-pad"
                    placeholder="0"
                  />
                )}
              </View>
            ))}
            {formData.split_type === SPLIT_TYPES.PERCENTAGE && (
              <View style={styles.percentageTotal}>
                <Text style={styles.percentageTotalText}>
                  Total:{" "}
                  {splits
                    .reduce((sum, split) => sum + split.amount, 0)
                    .toFixed(1)}
                  %
                </Text>
              </View>
            )}
          </View>
        )}

        <InputGroup
          label="Notes"
          value={formData.notes}
          onChangeText={(value) =>
            setFormData((prev) => ({ ...prev, notes: value }))
          }
          placeholder="Add any additional notes"
          multiline
          numberOfLines={3}
        />

        <PrimaryButton
          title={isLoading ? "Creating..." : "Create Expense"}
          onPress={handleCreateExpense}
          loading={isLoading}
          disabled={!formData.description || !formData.amount || !selectedGroup}
        />
      </View>

      {/* Modals */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCategoryModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={EXPENSE_CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.name}
              style={styles.categoryGrid}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.categoryGridContent}
              columnWrapperStyle={styles.categoryRow}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showSplitTypeModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowSplitTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSplitTypeModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Split Type</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSplitTypeModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={Object.values(SPLIT_TYPES)}
              renderItem={renderSplitTypeItem}
              keyExtractor={(item) => item}
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => (
                <View
                  style={{
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: colors.border,
                  }}
                />
              )}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showGroupModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowGroupModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGroupModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Group</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowGroupModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={groups}
              renderItem={renderGroupItem}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => (
                <View
                  style={{
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: colors.border,
                  }}
                />
              )}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}
