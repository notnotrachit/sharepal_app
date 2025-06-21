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
import { useTheme } from "../../constants/ThemeProvider";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../constants/theme";

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
  const { colors, components } = useTheme();
  const { currentTransaction, isLoading, currentGroup } = useSelector(
    (state: RootState) => state.groups
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.lg,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      ...typography.body,
      color: colors.text,
      textAlign: "center",
    },
    header: {
      ...components.card,
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.h2,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    amount: {
      ...typography.h3,
      color: colors.primary,
      fontWeight: "700",
      marginBottom: spacing.sm,
    },
    typeBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
    },
    expenseTypeBadge: {
      backgroundColor: `${colors.primary}25`,
    },
    settlementTypeBadge: {
      backgroundColor: `${colors.secondary}25`,
    },
    typeText: {
      ...typography.caption,
      fontWeight: "600",
    },
    expenseTypeText: {
      color: colors.primary,
    },
    settlementTypeText: {
      color: colors.secondary,
    },
    section: {
      ...components.card,
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      ...typography.h4,
      color: colors.text,
      marginBottom: spacing.md,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    infoLabel: {
      ...typography.body,
      color: colors.textSecondary,
    },
    infoValue: {
      ...typography.body,
      color: colors.text,
      fontWeight: "500",
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    detailLabel: {
      ...typography.body,
      color: colors.textSecondary,
    },
    detailValue: {
      ...typography.body,
      color: colors.text,
      fontWeight: "500",
    },
    participantItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    participantName: {
      ...typography.body,
      color: colors.text,
      flex: 1,
    },
    participantAmount: {
      ...typography.body,
      fontWeight: "600",
    },
    actionButtonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: spacing.lg,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      minWidth: 120,
      justifyContent: "center",
    },
    editButton: {
      ...components.button.primary,
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },
    deleteButton: {
      ...components.button.primary,
      backgroundColor: colors.error,
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },
    actionButtonText: {
      color: colors.surface,
      ...typography.button,
      marginLeft: spacing.xs,
    },
    notes: {
      ...typography.body,
      color: colors.text,
      fontStyle: "italic",
    },
    shareContainer: {
      alignItems: "center",
      marginVertical: spacing.lg,
    },
    shareAmount: {
      ...typography.h3,
      color: colors.primary,
      fontWeight: "700",
    },
    shareLabel: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    splitRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    splitUser: {
      ...typography.body,
      color: colors.text,
    },
    splitAmount: {
      ...typography.body,
      color: colors.text,
      fontWeight: "600",
    },
    actions: {
      flexDirection: "row",
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      marginTop: spacing.lg,
    },
    editButtonText: {
      ...typography.button,
      color: colors.surface,
      fontWeight: "600",
    },
    deleteButtonText: {
      ...typography.button,
      color: colors.surface,
      fontWeight: "600",
    },
  });

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
        <Text style={styles.loadingText}>Loading...</Text>
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
        <Text style={styles.loadingText}>Loading transaction...</Text>
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
          <Ionicons name="pencil" size={20} color={colors.surface} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteTransaction}
        >
          <Ionicons name="trash" size={20} color={colors.surface} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
