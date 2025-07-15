import React, { useEffect, useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AppDispatch, RootState } from "../../store";
import {
  fetchTransaction,
  deleteTransaction,
  clearCurrentTransaction,
  clearNavigationState,
} from "../../store/slices/groupsSlice";
import { GroupsStackParamList, ExpensesStackParamList } from "../../navigation/AppNavigator";
import { useTheme } from "../../contexts/ThemeContext";
import { formatCurrency } from "../../utils/currency";
import Card from "../../components/Card";
import SecondaryButton from "../../components/SecondaryButton";
import AnimatedScreen from "../../components/AnimatedScreen";
import TransactionDetailsSkeleton from "../../components/skeletons/TransactionDetailsSkeleton";
import UserAvatar from "../../components/UserAvatar";
import { spacing, borderRadius, typography } from "../../constants/theme";
import { EXPENSE_CATEGORIES } from "../../constants/api";

type TransactionDetailsScreenNavigationProp = 
  | StackNavigationProp<GroupsStackParamList, "TransactionDetails">
  | StackNavigationProp<ExpensesStackParamList, "ExpenseDetails">;

type TransactionDetailsScreenRouteProp = 
  | RouteProp<GroupsStackParamList, "TransactionDetails">
  | RouteProp<ExpensesStackParamList, "ExpenseDetails">;

interface Props {
  navigation: TransactionDetailsScreenNavigationProp;
  route: TransactionDetailsScreenRouteProp;
}

export default function TransactionDetailsScreen({ navigation, route }: Props) {
  // Handle both transactionId and expenseId params
  const transactionId = (route.params as any).transactionId || (route.params as any).expenseId;
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const { currentTransaction, isLoading, error, currentGroup, groupMembers } = useSelector(
    (state: RootState) => state.groups
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [cachedTransaction, setCachedTransaction] = useState<any>(null);

  const transaction = useMemo(() => {
    if (
      currentTransaction?._id === transactionId ||
      (currentTransaction as any)?.id === transactionId
    ) {
      setCachedTransaction(currentTransaction);
      return currentTransaction;
    }
    
    if (
      cachedTransaction?._id === transactionId ||
      (cachedTransaction as any)?.id === transactionId
    ) {
      return cachedTransaction;
    }
    
    return null;
  }, [currentTransaction, cachedTransaction, transactionId]);

  // Helper function to get user name
  const getUserName = useCallback((userId: string) => {
    if (!userId) return "Unknown User";
    if (userId === user?.id) return "You";

    // First check transaction data for user names
    if (transaction) {
      // Check participants array
      if (transaction.participants) {
        const participant = transaction.participants.find(
          (p: any) => p.user_id === userId
        );
        if (participant?.user_name) return participant.user_name;
      }

      // Check splits array if it exists
      if ((transaction as any).splits) {
        const split = (transaction as any).splits.find(
          (s: any) => s.user_id === userId
        );
        if (split?.user_name) return split.user_name;
      }

      // Check payers array if it exists
      if ((transaction as any).payers) {
        const payer = (transaction as any).payers.find(
          (p: any) => p.user_id === userId
        );
        if (payer?.user_name) return payer.user_name;
      }
    }

    // Fallback to group members
    if (groupMembers) {
      const member = groupMembers.find((m: any) => m.id === userId || m.user_id === userId);
      return member?.name || member?.user_name || member?.email?.split("@")[0] || "Unknown User";
    }

    return "Unknown User";
  }, [user?.id, transaction, groupMembers]);

  // Memoized participants processing for expenses
  const participants = useMemo(() => {
    if (!transaction || transaction.type !== "expense") return [];

    const combined = new Map();

    function addUser(u: any) {
      if (!combined.has(u.user_id)) {
        combined.set(u.user_id, {
          id: u.user_id,
          name: u.user_name || getUserName(u.user_id),
          avatar: u.profile_pic_url,
          paid: 0,
          share: 0,
        });
      }
    }

    (transaction as any).payers?.forEach(addUser);
    (transaction as any).splits?.forEach(addUser);

    (transaction as any).payers?.forEach((p: any) => {
      combined.get(p.user_id).paid = p.amount;
    });

    (transaction as any).splits?.forEach((s: any) => {
      combined.get(s.user_id).share = s.amount;
    });

    return Array.from(combined.values());
  }, [transaction, getUserName]);

  const styles = StyleSheet.create({
    contentContainer: { 
      padding: spacing.lg, 
      paddingBottom: spacing.xl 
    },
    header: { 
      marginBottom: spacing.lg, 
      alignItems: "center" 
    },
    description: {
      ...typography.h2,
      color: colors.text,
      textAlign: "center",
      marginBottom: spacing.sm,
    },
    amount: {
      ...typography.h1,
      color: colors.primary,
      marginBottom: spacing.sm,
    },
    date: { 
      ...typography.body, 
      color: colors.textSecondary 
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.md,
    },
    detailLabel: { 
      ...typography.body, 
      color: colors.textSecondary 
    },
    detailValue: { 
      ...typography.body, 
      color: colors.text, 
      fontWeight: "500" 
    },
    notes: { 
      ...typography.body, 
      color: colors.text, 
      lineHeight: 22 
    },
    actions: { 
      flexDirection: "row", 
      gap: spacing.md, 
      marginTop: spacing.xl 
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.lg,
    },
    errorText: { 
      ...typography.h3, 
      color: colors.error, 
      textAlign: "center" 
    },
    participantCard: { 
      marginTop: spacing.lg 
    },
    participantRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
    },
    participantInfo: { 
      marginLeft: spacing.md, 
      flex: 1 
    },
    participantName: {
      ...typography.body,
      color: colors.text,
      fontWeight: "500",
    },
    participantDetail: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    balanceContainer: { 
      alignItems: "flex-end" 
    },
    balanceAmount: {
      ...typography.body,
      fontWeight: "600",
    },
    balanceLabel: { 
      ...typography.caption, 
      color: colors.textSecondary 
    },
    settlementRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.md,
    },
    settlementLabel: {
      ...typography.body,
      color: colors.textSecondary,
    },
    settlementValue: {
      ...typography.body,
      color: colors.text,
      fontWeight: "500",
    },
    categoryContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    categoryIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  // Focus effect - only handle navigation state
  useFocusEffect(
    useCallback(() => {
      // Clear any stale navigation state when screen is focused
      dispatch(clearNavigationState());

      // Don't clear transaction on blur - preserve it for tab navigation
      return () => {
        dispatch(clearNavigationState());
      };
    }, [])
  );

  useEffect(() => {
    // Clear current transaction if it's different from the one we need
    if (
      currentTransaction &&
      currentTransaction._id !== transactionId &&
      (currentTransaction as any).id !== transactionId
    ) {
      dispatch(clearCurrentTransaction());
    }
    // Always fetch the transaction to ensure we have the data
    dispatch(fetchTransaction(transactionId));
  }, [transactionId]);



  // Note: Removed cleanup effect to preserve transaction data during tab navigation
  // Transaction will be cleared when navigating to a different transaction or when needed

  const handleDeleteTransaction = () => {
    const transactionType =
      transaction?.type === "expense" ? "expense" : "settlement";
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
              Alert.alert("Error", error.message || "Failed to delete transaction");
            }
          },
        },
      ]
    );
  };



  // Helper function to get category icon and color
  const getCategoryInfo = (categoryName: string) => {
    const category = EXPENSE_CATEGORIES.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    return category || EXPENSE_CATEGORIES.find((cat) => cat.name === "Other");
  };

  // Helper function to render participants for expenses
  const renderParticipant = (p: any) => {
    const isYou = p.id === user?.id;
    const name = isYou ? "You" : p.name;

    return (
      <View style={styles.participantRow} key={p.id}>
        <UserAvatar
          userId={p.id}
          user={{ profile_pic_url: p.avatar }}
          size={40}
        />
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>{name}</Text>
          <Text style={styles.participantDetail}>
            Paid: {formatCurrency(p.paid, transaction?.currency || "USD")}
          </Text>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceAmount, { color: colors.text }]}>
            {formatCurrency(p.share, transaction?.currency || "USD")}
          </Text>
        </View>
      </View>
    );
  };

  // Helper function to render settlement participants
  const renderSettlementParticipants = () => {
    if (!transaction || transaction.type !== "settlement") return null;

    return (
      <Card>
        <Card.Header title="Settlement Details" />
        <Card.Content>
          <View style={styles.settlementRow}>
            <Text style={styles.settlementLabel}>From</Text>
            <Text style={styles.settlementValue}>
              {getUserName(transaction.payer_id || "")}
            </Text>
          </View>
          <View style={styles.settlementRow}>
            <Text style={styles.settlementLabel}>To</Text>
            <Text style={styles.settlementValue}>
              {getUserName(transaction.payee_id || "")}
            </Text>
          </View>
          <View style={styles.settlementRow}>
            <Text style={styles.settlementLabel}>Method</Text>
            <Text style={styles.settlementValue}>
              {transaction.settlement_method || "Not specified"}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (isLoading && !transaction) return <TransactionDetailsSkeleton />;
  if (error && !transaction) {
    return (
      <AnimatedScreen style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </AnimatedScreen>
    );
  }
  if (!transaction) {
    return (
      <AnimatedScreen style={styles.errorContainer}>
        <Text style={styles.errorText}>Transaction not found.</Text>
      </AnimatedScreen>
    );
  }

  const isExpense = transaction.type === "expense";
  const isSettlement = transaction.type === "settlement";

  return (
    <AnimatedScreen>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.description}>
            {transaction.description || "No description"}
          </Text>
          <Text style={styles.amount}>
            {formatCurrency(transaction.amount, transaction.currency)}
          </Text>
          <Text style={styles.date}>
            {new Date(transaction.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        <Card>
          <Card.Header title="Details" />
          <Card.Content>
            {isExpense && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <View style={styles.categoryContainer}>
                    {(() => {
                      const categoryInfo = getCategoryInfo(transaction.category || "General");
                      return (
                        <>
                          <View style={[styles.categoryIcon, { backgroundColor: categoryInfo?.color }]}>
                            <Ionicons 
                              name={categoryInfo?.icon as any} 
                              size={14} 
                              color="white" 
                            />
                          </View>
                          <Text style={styles.detailValue}>
                            {transaction.category || "General"}
                          </Text>
                        </>
                      );
                    })()}
                  </View>
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
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>Settlement</Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {transaction.notes && (
          <Card>
            <Card.Header title="Notes" />
            <Card.Content>
              <Text style={styles.notes}>{transaction.notes}</Text>
            </Card.Content>
          </Card>
        )}

        {isExpense && participants.length > 0 && (
          <Card style={styles.participantCard}>
            <Card.Header title="Participants" />
            <Card.Content>{participants.map(renderParticipant)}</Card.Content>
          </Card>
        )}

        {isSettlement && renderSettlementParticipants()}

        <View style={styles.actions}>
          <SecondaryButton
            title="Edit"
            icon="pencil"
            onPress={() => {}}
            style={{ flex: 1 }}
          />
          <SecondaryButton
            title="Delete"
            icon="trash"
            onPress={handleDeleteTransaction}
            variant="error"
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}
