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
  createExpense,
  fetchGroupExpenses,
  fetchExpenses,
} from "../../store/slices/expensesSlice";
import { fetchGroups, fetchGroupMembers } from "../../store/slices/groupsSlice";
import { ExpensesStackParamList } from "../../navigation/AppNavigator";
import { EXPENSE_CATEGORIES, SPLIT_TYPES } from "../../constants/api";
import { Group, User } from "../../types/api";

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

export default function CreateExpenseScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.expenses);
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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSplitTypeModal, setShowSplitTypeModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  useEffect(() => {
    dispatch(fetchGroups({}));
  }, []);

  useEffect(() => {
    if (formData.group_id) {
      const group = groups.find((g) => g.id === formData.group_id);
      if (group) {
        console.log("Group selected:", group.name, "members:", group.members);
        setSelectedGroup(group);

        // Fetch complete group members if not already loaded
        if (!group.members || group.members.length === 0) {
          console.log("Fetching group members for group:", formData.group_id);
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
        console.log("Group members updated:", updatedGroup.members);
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
    console.log(
      "Initializing splits for group:",
      group.name,
      "with members:",
      group.members
    );

    const initialSplits: Split[] = [];
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
      console.log("Group members not loaded properly, using current user only");
      if (user?.id && !addedUserIds.has(user.id)) {
        initialSplits.push({
          user_id: user.id,
          amount: 0,
        });
        addedUserIds.add(user.id);
      }
    }

    console.log("Initialized splits:", initialSplits);
    setSplits(initialSplits);
  };

  const calculateEqualSplit = () => {
    if (!formData.amount || splits.length === 0) {
      console.log(
        "Cannot calculate equal split - amount:",
        formData.amount,
        "splits length:",
        splits.length
      );
      return;
    }

    const totalAmount = parseFloat(formData.amount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      console.log("Invalid amount for equal split:", formData.amount);
      return;
    }

    const amountPerPerson = totalAmount / splits.length;

    console.log(
      "Calculating equal split - total:",
      totalAmount,
      "per person:",
      amountPerPerson,
      "people:",
      splits.length
    );

    const newSplits = splits.map((split) => ({
      ...split,
      amount: amountPerPerson,
    }));

    console.log("New splits after equal calculation:", newSplits);
    setSplits(newSplits);
  };

  const updateSplitAmount = (userId: string, amount: number) => {
    setSplits((prev) =>
      prev.map((split) =>
        split.user_id === userId ? { ...split, amount } : split
      )
    );
  };

  const validateSplits = () => {
    const totalAmount = parseFloat(formData.amount);
    const splitTotal = splits.reduce((sum, split) => sum + split.amount, 0);

    console.log("Validating splits:");
    console.log("- Total amount:", totalAmount);
    console.log("- Split total:", splitTotal);
    console.log("- Split type:", formData.split_type);
    console.log("- Splits array:", splits);

    if (formData.split_type === SPLIT_TYPES.EXACT) {
      const isValid = Math.abs(totalAmount - splitTotal) < 0.01;
      console.log("- EXACT validation result:", isValid);
      return isValid;
    }

    if (formData.split_type === SPLIT_TYPES.PERCENTAGE) {
      const isValid = Math.abs(splitTotal - 100) < 0.01;
      console.log("- PERCENTAGE validation result:", isValid);
      return isValid;
    }

    console.log("- EQUAL validation: always true");
    return true;
  };

  const handleCreateExpense = async () => {
    console.log("=== Starting expense creation ===");
    console.log("Form data:", formData);
    console.log("Splits:", splits);
    console.log("Selected group:", selectedGroup);

    if (!formData.description.trim()) {
      console.log("Validation failed: No description");
      Alert.alert("Error", "Please enter a description");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      console.log("Validation failed: Invalid amount");
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!formData.group_id) {
      console.log("Validation failed: No group selected");
      Alert.alert("Error", "Please select a group");
      return;
    }

    if (!validateSplits()) {
      console.log("Validation failed: Invalid splits");
      Alert.alert(
        "Error",
        "Split amounts do not match the total expense amount"
      );
      return;
    }

    console.log("All validations passed, creating expense...");

    try {
      const newExpense = await dispatch(
        createExpense({
          group_id: formData.group_id,
          description: formData.description.trim(),
          amount: parseFloat(formData.amount),
          currency: selectedGroup?.currency || "USD",
          category: formData.category,
          split_type: formData.split_type as any,
          splits: splits,
          notes: formData.notes.trim() || undefined,
        })
      ).unwrap();

      console.log("Expense created successfully:", newExpense);

      // Refresh both group expenses and main expenses list
      dispatch(fetchGroupExpenses({ groupId: formData.group_id }));
      dispatch(fetchExpenses({}));

      navigation.goBack();
    } catch (error: any) {
      console.log("Failed to create expense:", error);
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
        <Ionicons name="checkmark" size={20} color="#007AFF" />
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
        }
      }}
    >
      <Text style={styles.modalItemText}>
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
      {formData.split_type === item && (
        <Ionicons name="checkmark" size={20} color="#007AFF" />
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
        <Ionicons name="checkmark" size={20} color="#007AFF" />
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.input}
            placeholder="What was this expense for?"
            value={formData.description}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, description: value }))
            }
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount *</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={formData.amount}
            onChangeText={(value) => {
              setFormData((prev) => ({ ...prev, amount: value }));
              if (formData.split_type === SPLIT_TYPES.EQUAL) {
                setTimeout(calculateEqualSplit, 100);
              }
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
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.selectorText}>{formData.category}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
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
            <Ionicons name="chevron-down" size={20} color="#666" />
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
                {formData.split_type !== SPLIT_TYPES.EQUAL ? (
                  <TextInput
                    style={styles.splitInput}
                    value={split.amount.toString()}
                    onChangeText={(value) =>
                      updateSplitAmount(split.user_id, parseFloat(value) || 0)
                    }
                    keyboardType="decimal-pad"
                    placeholder="0"
                  />
                ) : (
                  <Text style={styles.splitAmount}>
                    {selectedGroup?.currency} {split.amount.toFixed(2)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any additional notes"
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
              <Ionicons name="close" size={24} color="#333" />
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
              <Ionicons name="close" size={24} color="#333" />
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
              <Ionicons name="close" size={24} color="#333" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 16,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  selector: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectorText: {
    fontSize: 16,
    color: "#333",
  },
  splitItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  splitUser: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  splitInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    width: 80,
    textAlign: "right",
  },
  splitAmount: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
});
