import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AppDispatch, RootState } from "../../store";
import {
  createExpenseTransaction,
  fetchGroupTransactions,
} from "../../store/slices/groupsSlice";
import { fetchGroups, fetchGroupMembers } from "../../store/slices/groupsSlice";
import { ExpensesStackParamList } from "../../navigation/AppNavigator";
import { EXPENSE_CATEGORIES, SPLIT_TYPES } from "../../constants/api";
import { Group, User } from "../../types/api";
import { useTheme } from "../../constants/ThemeProvider";
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
  const { isLoading } = useSelector((state: RootState) => state.groups);
  const { groups } = useSelector((state: RootState) => state.groups);
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: EXPENSE_CATEGORIES[0],
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

  useEffect(() => {
    dispatch(fetchGroups());
  }, []);

  useEffect(() => {
    if (formData.group_id) {
      const group = groups.find((g) => g.id === formData.group_id);
      if (group) {
        setSelectedGroup(group);

        // Fetch complete group members if not already loaded
        if (!group.members || group.members.length === 0) {
          dispatch(fetchGroupMembers(formData.group_id));
        } else {
          initializeSplits(group);
        }
      }
    }
  }, [formData.group_id]);

  // Separate effect to handle when groups data changes (after fetchGroupMembers)
  useEffect(() => {
    if (formData.group_id && selectedGroup) {
      const updatedGroup = groups.find((g) => g.id === formData.group_id);
      if (
        updatedGroup &&
        updatedGroup.members &&
        updatedGroup.members.length > 0 &&
        (!selectedGroup.members || selectedGroup.members.length === 0)
      ) {
        setSelectedGroup(updatedGroup);
        initializeSplits(updatedGroup);
      }
    }
  }, [groups]);

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
    if (group.members && Array.isArray(group.members)) {
      group.members.forEach((member) => {
        if (!addedUserIds.has(member.id)) {
          initialSplits.push({
            user_id: member.id,
            amount: 0,
          });
          addedUserIds.add(member.id);
        }
      });
    } else {
      // Fallback: add just current user if members are not properly loaded
      if (user?.id && !addedUserIds.has(user.id)) {
        initialSplits.push({
          user_id: user.id,
          amount: 0,
        });
        addedUserIds.add(user.id);
      }
    }

    // Initialize payers - by default, current user pays the full amount
    if (user?.id) {
      initialPayers.push({
        user_id: user.id,
        amount: 0, // Will be set when amount is entered
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

    // Update payers - set current user as the sole payer for the full amount
    const newPayers = payers.map((payer) => ({
      ...payer,
      amount: payer.user_id === user?.id ? totalAmount : 0,
    }));

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
    const payerTotal = payers.reduce((sum, payer) => sum + payer.amount, 0);

    // Validate that payer total equals the expense amount
    if (Math.abs(totalAmount - payerTotal) > 0.01) {
      return false;
    }

    // Validate splits based on split type
    if (formData.split_type === SPLIT_TYPES.EXACT) {
      const splitTotal = splits.reduce((sum, split) => sum + split.amount, 0);
      const isValid = Math.abs(totalAmount - splitTotal) < 0.01;
      return isValid;
    }

    if (formData.split_type === SPLIT_TYPES.PERCENTAGE) {
      // For percentage validation, we need to check the original percentages
      // But first, let's calculate the actual split amounts for submission
      const percentageTotal = splits.reduce((sum, split) => {
        // During percentage input, split.amount stores the percentage
        return sum + split.amount;
      }, 0);
      const isValid = Math.abs(percentageTotal - 100) < 0.01;
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

      const newExpense = await dispatch(
        createExpenseTransaction({
          group_id: formData.group_id,
          description: formData.description.trim(),
          amount: parseFloat(formData.amount),
          currency: selectedGroup?.currency || "USD",
          category: formData.category,
          split_type: formData.split_type as any,
          payers: payers,
          splits: finalSplits,
          notes: formData.notes.trim() || undefined,
        })
      ).unwrap();

      // Refresh group transactions
      dispatch(fetchGroupTransactions({ groupId: formData.group_id }));

      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error);
    }
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setFormData((prev) => ({ ...prev, category: item }));
        setShowCategoryModal(false);
      }}
    >
      <Text style={styles.modalItemText}>{item}</Text>
      {formData.category === item && (
        <Ionicons name="checkmark" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  const renderSplitTypeItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
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
    >
      <Text style={styles.modalItemText}>
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
      {formData.split_type === item && (
        <Ionicons name="checkmark" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setFormData((prev) => ({ ...prev, group_id: item.id }));
        setShowGroupModal(false);
      }}
    >
      <Text style={styles.modalItemText}>{item.name}</Text>
      {formData.group_id === item.id && (
        <Ionicons name="checkmark" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  const getUserName = (userId: string) => {
    if (userId === user?.id) return "You";
    if (selectedGroup) {
      const member = selectedGroup.members?.find((m) => m.id === userId);
      return member?.name || "Unknown User";
    }
    return "Unknown User";
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
    inputGroup: {
      gap: spacing.sm,
    },
    label: {
      ...typography.h4,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    input: {
      ...components.input,
    },
    textArea: {
      ...components.input,
      height: 80,
      textAlignVertical: "top",
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
    createButton: {
      ...components.button.primary,
      backgroundColor: colors.primary,
      marginTop: spacing.lg,
      ...shadows.medium,
      elevation: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    createButtonText: {
      ...typography.button,
      color: "#ffffff",
      fontWeight: "600",
      textAlign: "center",
    },
    disabledButton: {
      backgroundColor: colors.textSecondary,
    },
    buttonDisabled: {
      backgroundColor: colors.textSecondary,
    },
    disabledButtonText: {
      color: colors.textTertiary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      margin: spacing.lg,
      maxHeight: "80%",
      width: "90%",
    },
    modalContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      margin: spacing.lg,
      maxHeight: "80%",
      width: "90%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    modalTitle: {
      ...typography.h3,
      color: colors.text,
    },
    modalItem: {
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalItemText: {
      ...typography.body,
      color: colors.text,
    },
    closeButton: {
      alignSelf: "flex-end",
      padding: spacing.sm,
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="What was this expense for?"
            placeholderTextColor={colors.textSecondary}
            value={formData.description}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, description: value }))
            }
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount *</Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            value={formData.amount}
            onChangeText={(value) => {
              setFormData((prev) => ({ ...prev, amount: value }));
            }}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Group *</Text>
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.selectorText}>{formData.category}</Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Split Type</Text>
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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Split Details</Text>
            {splits.map((split, index) => (
              <View key={`${split.user_id}-${index}`} style={styles.splitItem}>
                <Text style={styles.splitUser}>
                  {getUserName(split.user_id)}
                </Text>
                {formData.split_type === SPLIT_TYPES.EQUAL ? (
                  <Text style={styles.splitAmount}>
                    {selectedGroup?.currency} {split.amount.toFixed(2)}
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
                        {selectedGroup?.currency}{" "}
                        {(
                          (split.amount / 100) *
                          parseFloat(formData.amount)
                        ).toFixed(2)}
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text }]}
            placeholder="Add any additional notes"
            placeholderTextColor={colors.textSecondary}
            value={formData.notes}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, notes: value }))
            }
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.buttonDisabled]}
          onPress={handleCreateExpense}
          disabled={isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? "Creating..." : "Create Expense"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={EXPENSE_CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
          />
        </View>
      </Modal>

      <Modal
        visible={showSplitTypeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Split Type</Text>
            <TouchableOpacity onPress={() => setShowSplitTypeModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={Object.values(SPLIT_TYPES)}
            renderItem={renderSplitTypeItem}
            keyExtractor={(item) => item}
          />
        </View>
      </Modal>

      <Modal
        visible={showGroupModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Group</Text>
            <TouchableOpacity onPress={() => setShowGroupModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={groups}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}
