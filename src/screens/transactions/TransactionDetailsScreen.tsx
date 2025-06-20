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
import { GroupsStackParamList } from "../../navigation/AppNavigator";

type TransactionDetailsScreenNavigationProp = StackNavigationProp<
  GroupsStackParamList,
  "TransactionDetails"
>;
type TransactionDetailsScreenRouteProp = RouteProp<
  GroupsStackParamList,
  "TransactionDetails"
>;

interface Props {
  navigation: TransactionDetailsScreenNavigationProp;
  route: TransactionDetailsScreenRouteProp;
}

export default function TransactionDetailsScreen({ navigation, route }: Props) {
  const { transactionId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { currentTransaction, isLoading, currentGroup } = useSelector(
    (state: RootState) => state.groups
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (
      currentTransaction &&
      currentTransaction._id !== transactionId &&
      (currentTransaction as any).id !== transactionId
    ) {
      dispatch(clearCurrentTransaction());
    }
    // Fetch the transaction
    dispatch(fetchTransaction(transactionId));
    console.log("Fetching transaction with ID:", transactionId);
  }, [transactionId]);

  useEffect(() => {
    // Cleanup function to clear transaction when component unmounts
    return () => {
      dispatch(clearCurrentTransaction());
    };
  }, []);

  const handleDeleteTransaction = () => {
    const transactionType =
      currentTransaction?.type === "expense" ? "expense" : "settlement";
    Alert.alert(
      `Delete ${
        transactionType.charAt(0).toUpperCase() + transactionType.slice(1)
      }`,
      `Are you sure you want to delete this ${transactionType}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteTransaction(transactionId)).unwrap();
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

  const getUserName = (userId: string) => {
    if (userId === user?.id) return "You";

    // First check transaction data for user names
    if (currentTransaction) {
      // Check participants array
      if (currentTransaction.participants) {
        const participant = currentTransaction.participants.find(
          (p: any) => p.user_id === userId
        );
        if (participant?.user_name) return participant.user_name;
      }

      // Check splits array if it exists
      if ((currentTransaction as any).splits) {
        const split = (currentTransaction as any).splits.find(
          (s: any) => s.user_id === userId
        );
        if (split?.user_name) return split.user_name;
      }

      // Check payers array if it exists
      if ((currentTransaction as any).payers) {
        const payer = (currentTransaction as any).payers.find(
          (p: any) => p.user_id === userId
        );
        if (payer?.user_name) return payer.user_name;
      }
    }

    // Fallback to group members
    if (currentGroup) {
      const member = currentGroup.members?.find((m) => m.id === userId);
      return member?.name || "Unknown User";
    }

    return "Unknown User";
  };

  const getUserShare = () => {
    if (!currentTransaction || !user) return 0;

    // For expenses, check splits array first (cleaner representation)
    if (currentTransaction.type === "expense") {
      // Try splits array first
      if ((currentTransaction as any).splits) {
        const userSplit = (currentTransaction as any).splits.find(
          (split: any) => split.user_id === user.id
        );
        if (userSplit) return userSplit.amount || 0;
      }

      // Fallback to participants array
      if (currentTransaction.participants) {
        const userParticipant = currentTransaction.participants.find(
          (participant: any) =>
            participant.user_id === user.id &&
            (participant.share_type === "split" ||
              participant.share_type === "both")
        );
        return Math.abs(userParticipant?.amount || 0);
      }
    }

    // For settlements, the amount is what the user pays/receives
    if (currentTransaction.type === "settlement") {
      if (currentTransaction.payer_id === user.id) {
        return currentTransaction.amount; // User pays this amount
      }
      if (currentTransaction.payee_id === user.id) {
        return -currentTransaction.amount; // User receives this amount
      }
    }

    return 0;
  };

  const getUserPaidAmount = () => {
    if (!currentTransaction || !user) return 0;

    // For expenses, check payers array first (cleaner representation)
    if (currentTransaction.type === "expense") {
      // Try payers array first
      if ((currentTransaction as any).payers) {
        const userPayer = (currentTransaction as any).payers.find(
          (payer: any) => payer.user_id === user.id
        );
        if (userPayer) return userPayer.amount || 0;
      }

      // Fallback to participants array
      if (currentTransaction.participants) {
        const userParticipant = currentTransaction.participants.find(
          (participant: any) =>
            participant.user_id === user.id &&
            (participant.share_type === "paid" ||
              participant.share_type === "both")
        );
        return userParticipant?.amount || 0;
      }
    }

    return 0;
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
    currentTransaction._id === transactionId ||
    (currentTransaction as any).id === transactionId;

  if (!transactionMatches) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading transaction...</Text>
      </View>
    );
  }

  const transaction = currentTransaction;

  if (!transaction) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Transaction not found</Text>
      </View>
    );
  }

  const isExpense = transaction.type === "expense";
  const isSettlement = transaction.type === "settlement";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {transaction.description || "No description"}
        </Text>
        <Text style={styles.amount}>
          {formatCurrency(
            transaction.amount || 0,
            transaction.currency || "USD"
          )}
        </Text>
        <View
          style={[
            styles.typeBadge,
            isExpense ? styles.expenseTypeBadge : styles.settlementTypeBadge,
          ]}
        >
          <Text
            style={[
              styles.typeText,
              isExpense ? styles.expenseTypeText : styles.settlementTypeText,
            ]}
          >
            {isExpense ? "EXPENSE" : "SETTLEMENT"}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        {isExpense && (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>
                {transaction.category || "General"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Split Type</Text>
              <Text style={styles.detailValue}>
                {transaction.split_type
                  ? transaction.split_type.charAt(0).toUpperCase() +
                    transaction.split_type.slice(1)
                  : "Equal"}
              </Text>
            </View>
          </>
        )}
        {isSettlement && (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>From</Text>
              <Text style={styles.detailValue}>
                {getUserName(transaction.payer_id || "")}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>To</Text>
              <Text style={styles.detailValue}>
                {getUserName(transaction.payee_id || "")}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Method</Text>
              <Text style={styles.detailValue}>
                {transaction.settlement_method || "Not specified"}
              </Text>
            </View>
          </>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>
            {transaction.created_at
              ? new Date(transaction.created_at).toLocaleDateString()
              : "Unknown"}
          </Text>
        </View>
      </View>

      {transaction.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{transaction.notes}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Your {isExpense ? "Share" : "Amount"}
        </Text>
        <View style={styles.shareContainer}>
          <Text style={styles.shareAmount}>
            {formatCurrency(
              Math.abs(getUserShare()),
              transaction.currency || "USD"
            )}
          </Text>
          <Text style={styles.shareLabel}>
            {isExpense
              ? `You ${getUserPaidAmount() > 0 ? "paid" : "owe"}`
              : getUserShare() > 0
              ? "You paid"
              : getUserShare() < 0
              ? "You received"
              : "Not involved"}
          </Text>
        </View>
      </View>

      {isExpense && (
        <>
          {/* Payers Section */}
          {(transaction as any).payers &&
            (transaction as any).payers.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Who Paid</Text>
                {(transaction as any).payers.map(
                  (payer: any, index: number) => (
                    <View key={index} style={styles.splitRow}>
                      <Text style={styles.splitUser}>
                        {getUserName(payer.user_id)}
                      </Text>
                      <Text style={styles.splitAmount}>
                        {formatCurrency(
                          payer.amount || 0,
                          transaction.currency || "USD"
                        )}
                      </Text>
                    </View>
                  )
                )}
              </View>
            )}

          {/* Splits Section */}
          {(transaction as any).splits &&
            (transaction as any).splits.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Split Breakdown</Text>
                {(transaction as any).splits.map(
                  (split: any, index: number) => (
                    <View key={index} style={styles.splitRow}>
                      <Text style={styles.splitUser}>
                        {getUserName(split.user_id)}
                      </Text>
                      <Text style={styles.splitAmount}>
                        {formatCurrency(
                          split.amount || 0,
                          transaction.currency || "USD"
                        )}
                      </Text>
                    </View>
                  )
                )}
              </View>
            )}
        </>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={20} color="#007AFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteTransaction}
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
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 8,
  },
  typeBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  expenseTypeBadge: {
    backgroundColor: "#e3f2fd",
  },
  settlementTypeBadge: {
    backgroundColor: "#f3e5f5",
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  expenseTypeText: {
    color: "#1976d2",
  },
  settlementTypeText: {
    color: "#7b1fa2",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  notes: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  shareContainer: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  shareAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  shareLabel: {
    fontSize: 14,
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  editButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F44336",
  },
  deleteButtonText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
