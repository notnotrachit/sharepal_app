import React, { useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { AppDispatch, RootState } from "../../store";
import {
  fetchTransaction,
  deleteTransaction,
  clearCurrentTransaction,
} from "../../store/slices/groupsSlice";
import { ExpensesStackParamList } from "../../navigation/AppNavigator";
import { useTheme } from "../../contexts/ThemeContext";
import { formatCurrency } from "../../utils/currency";
import LoadingState from "../../components/LoadingState";
import Card from "../../components/Card";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../constants/theme";

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
  const { colors, components } = useTheme();
  const { currentTransaction, isLoading } = useSelector(
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
    header: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      alignItems: "center",
      ...shadows.medium,
    },
    title: {
      ...typography.h2,
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: "center",
    },
    amount: {
      ...typography.h1,
      color: colors.primary,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
    notes: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    shareContainer: {
      alignItems: "center",
      padding: spacing.lg,
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.md,
    },
    shareAmount: {
      ...typography.h2,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    shareLabel: {
      ...typography.body,
      color: colors.textSecondary,
    },
    splitRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
    actions: {
      flexDirection: "row",
      gap: spacing.md,
      marginTop: spacing.xl,
    },
    noSplitsText: {
      ...typography.body,
      color: colors.textSecondary,
      fontStyle: "italic",
      textAlign: "center",
      padding: spacing.lg,
    },
  });

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


  if (isLoading) {
    return <LoadingState message="Loading expense details..." />;
  }

  if (!currentTransaction) {
    return <LoadingState message="Transaction not found" />;
  }

  // Check if we have the right transaction (handle both _id and id fields)
  const transactionMatches =
    currentTransaction._id === expenseId ||
    (currentTransaction as any).id === expenseId;

  if (!transactionMatches) {
    return <LoadingState message="Loading transaction..." />;
  }

  // Use the transaction directly since it's already in the correct format
  const expense = currentTransaction;

  if (!expense) {
    return <LoadingState message="Transaction not found" />;
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

      <Card>
        <Card.Header title="Details" />
        <Card.Content>
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
        </Card.Content>
      </Card>

      {expense.notes && (
        <Card>
          <Card.Header title="Notes" />
          <Card.Content>
            <Text style={styles.notes}>{expense.notes}</Text>
          </Card.Content>
        </Card>
      )}

      <Card>
        <Card.Header title="Your Share" />
        <Card.Content>
          <View style={styles.shareContainer}>
            <Text style={styles.shareAmount}>
              {formatCurrency(getUserShare(), expense.currency || "USD")}
            </Text>
            <Text style={styles.shareLabel}>
              You {getUserPaidAmount() > 0 ? "paid" : "owe"}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header title="Who Paid" />
        <Card.Content>
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
        </Card.Content>
      </Card>

      <Card>
        <Card.Header title="Split Breakdown" />
        <Card.Content>
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
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <SecondaryButton
          title="Edit"
          icon="pencil"
          onPress={() => {
            // Navigate to edit screen
          }}
          style={{ flex: 1 }}
        />

        <SecondaryButton
          title="Delete"
          icon="trash"
          onPress={handleDeleteExpense}
          variant="error"
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}
