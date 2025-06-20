import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AppDispatch, RootState } from "../../store";
import {
  fetchTransaction,
  deleteTransaction,
  clearCurrentTransaction,
} from "../../store/slices/groupsSlice";
import { ExpensesStackParamList } from "../../navigation/AppNavigator";

type ExpenseDetailsScreenNavigationProp = StackNavigationProp<
  ExpensesStackParamList,
  "ExpenseDetails"
>;
type ExpenseDetailsScreenRouteProp = RouteProp<
  ExpensesStackParamList,
  "ExpenseDetails"
>;

interface Props {
  navigation: ExpenseDetailsScreenNavigationProp;
  route: ExpenseDetailsScreenRouteProp;
}

export default function ExpenseDetailsScreen({ navigation, route }: Props) {
  const { expenseId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { currentTransaction, isLoading } = useSelector(
    (state: RootState) => state.groups
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Only clear if we have a different transaction loaded
    if (
      currentTransaction &&
      currentTransaction._id !== expenseId &&
      (currentTransaction as any).id !== expenseId
    ) {
      dispatch(clearCurrentTransaction());
    }
    // Fetch the transaction
    dispatch(fetchTransaction(expenseId));
  }, [expenseId]);

  useEffect(() => {
    // Cleanup function to clear transaction when component unmounts
    return () => {
      dispatch(clearCurrentTransaction());
    };
  }, []);

  const handleDeleteExpense = () => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteTransaction(expenseId)).unwrap();
              navigation.goBack();
            } catch (error: any) {
              Alert.alert("Error", error);
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return `${currency} 0.00`;
    }
    return `${currency} ${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!currentTransaction) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Transaction not found</Text>
      </View>
    );
  }

  // Check if we have the right transaction (handle both _id and id fields)
  const transactionMatches =
    currentTransaction._id === expenseId ||
    (currentTransaction as any).id === expenseId;

  if (!transactionMatches) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading transaction...</Text>
      </View>
    );
  }

  // Use the transaction directly since it's already in the correct format
  const expense = currentTransaction;

  if (!expense) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Transaction not found</Text>
      </View>
    );
  }

  const getUserShare = () => {
    if (!expense || !user) return 0;

    // Try splits array first (cleaner representation)
    if ((expense as any).splits) {
      const userSplit = (expense as any).splits.find(
        (split: any) => split.user_id === user.id
      );
      if (userSplit) return userSplit.amount || 0;
    }

    // Fallback to participants array
    if (expense.participants) {
      const userParticipant = expense.participants.find(
        (participant) => participant.user_id === user.id
      );
      return Math.abs(userParticipant?.amount || 0);
    }

    return 0;
  };

  const getUserPaidAmount = () => {
    if (!expense || !user) return 0;

    // Try payers array first (cleaner representation)
    if ((expense as any).payers) {
      const userPayer = (expense as any).payers.find(
        (payer: any) => payer.user_id === user.id
      );
      if (userPayer) return userPayer.amount || 0;
    }

    // Fallback to participants array
    if (expense.participants) {
      const userParticipant = expense.participants.find(
        (participant) => participant.user_id === user.id
      );
      // If amount is positive, they paid; if negative, they owe
      const amount = userParticipant?.amount || 0;
      return amount > 0 ? amount : 0;
    }

    return 0;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {expense.description || "No description"}
        </Text>
        <Text style={styles.amount}>
          {formatCurrency(expense.amount || 0, expense.currency || "USD")}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category</Text>
          <Text style={styles.detailValue}>
            {expense.category || "Unknown"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Split Type</Text>
          <Text style={styles.detailValue}>
            {expense.split_type
              ? expense.split_type.charAt(0).toUpperCase() +
                expense.split_type.slice(1)
              : "Unknown"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>
            {expense.created_at
              ? new Date(expense.created_at).toLocaleDateString()
              : "Unknown"}
          </Text>
        </View>
      </View>

      {expense.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{expense.notes}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Share</Text>
        <View style={styles.shareContainer}>
          <Text style={styles.shareAmount}>
            {formatCurrency(getUserShare(), expense.currency || "USD")}
          </Text>
          <Text style={styles.shareLabel}>
            You {getUserPaidAmount() > 0 ? "paid" : "owe"}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Who Paid</Text>
        {(expense as any).payers && (expense as any).payers.length > 0 ? (
          (expense as any).payers.map((payer: any, index: number) => (
            <View key={index} style={styles.splitRow}>
              <Text style={styles.splitUser}>
                {payer.user_id === user?.id
                  ? "You"
                  : payer.user_name || `User ${payer.user_id.slice(-4)}`}
              </Text>
              <Text style={styles.splitAmount}>
                {formatCurrency(payer.amount || 0, expense.currency || "USD")}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noSplitsText}>
            No payer information available
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Split Breakdown</Text>
        {(expense as any).splits && (expense as any).splits.length > 0 ? (
          (expense as any).splits.map((split: any, index: number) => (
            <View key={index} style={styles.splitRow}>
              <Text style={styles.splitUser}>
                {split.user_id === user?.id
                  ? "You"
                  : split.user_name || `User ${split.user_id.slice(-4)}`}
              </Text>
              <Text style={styles.splitAmount}>
                {formatCurrency(split.amount || 0, expense.currency || "USD")}
              </Text>
            </View>
          ))
        ) : expense.participants && expense.participants.length > 0 ? (
          expense.participants.map((participant, index: number) => (
            <View key={index} style={styles.splitRow}>
              <Text style={styles.splitUser}>
                {participant.user_id === user?.id
                  ? "You"
                  : (participant as any).user_name ||
                    `User ${participant.user_id.slice(-4)}`}
              </Text>
              <Text style={styles.splitAmount}>
                {formatCurrency(
                  Math.abs(participant.amount || 0),
                  expense.currency || "USD"
                )}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noSplitsText}>
            No split information available
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={20} color="#007AFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteExpense}
        >
          <Ionicons name="trash" size={20} color="#F44336" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
  },
  header: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  amount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  notes: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  shareContainer: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  shareAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  shareLabel: {
    fontSize: 16,
    color: "#666",
  },
  splitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  splitUser: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  splitAmount: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  editButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F44336",
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  deleteButtonText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "600",
  },
  noSplitsText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
  },
});
