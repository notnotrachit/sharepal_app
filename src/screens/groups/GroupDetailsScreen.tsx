import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AppDispatch, RootState } from "../../store";
import {
  fetchGroup,
  fetchGroupBalances,
  fetchGroupSimplify,
  fetchGroupMembers,
  fetchGroupTransactions,
  createSettlementTransaction,
  completeTransaction,
  fetchGroupAnalytics,
  createExpenseTransaction,
  setCurrentGroup,
  clearGroupData,
} from "../../store/slices/groupsSlice";
import { GroupsStackParamList } from "../../navigation/AppNavigator";
import { useTheme } from "../../constants/ThemeProvider";
import LoadingState from "../../components/LoadingState";
import Card from "../../components/Card";
import SecondaryButton from "../../components/SecondaryButton";
import AnimatedFAB from "../../components/AnimatedFAB";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../constants/theme";

type GroupDetailsScreenNavigationProp = StackNavigationProp<
  GroupsStackParamList,
  "GroupDetails"
>;
type GroupDetailsScreenRouteProp = RouteProp<
  GroupsStackParamList,
  "GroupDetails"
>;

interface Props {
  navigation: GroupDetailsScreenNavigationProp;
  route: GroupDetailsScreenRouteProp;
}

export default function GroupDetailsScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { colors, components } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      margin: spacing.lg,
      marginBottom: spacing.sm,
    },
    groupInfo: {
      flex: 1,
    },
    groupName: {
      ...typography.h2,
      color: colors.text,
    },
    memberCount: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    tabs: {
      flexDirection: "row",
      ...components.card,
      margin: spacing.lg,
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
      padding: spacing.xs,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      alignItems: "center",
      borderRadius: borderRadius.lg,
      marginHorizontal: 2,
      backgroundColor: colors.surface,
    },
    activeTab: {
      backgroundColor: colors.primary,
      ...shadows.small,
    },
    tabText: {
      ...typography.body,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    activeTabText: {
      color: colors.surface,
      fontWeight: "600",
    },
    content: {
      flex: 1,
    },
    tabContent: {
      flex: 1,
      padding: spacing.lg,
    },
    expenseItem: {
      ...components.card,
      marginBottom: spacing.md,
    },
    expenseHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    expenseDescription: {
      ...typography.h4,
      color: colors.text,
      flex: 1,
    },
    expenseAmount: {
      ...typography.h4,
      fontWeight: "700",
      color: colors.primary,
    },
    expenseDetails: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    expenseInfo: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    expenseCategory: {
      ...typography.caption,
      color: colors.primary,
      backgroundColor: `${colors.primary}15`,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      fontWeight: "500",
    },
    expenseDate: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    expenseMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: spacing.sm,
    },
    expenseContent: {
      flex: 1,
    },
    transactionActions: {
      flexDirection: "row",
      gap: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.sm,
    },
    transactionEditButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    transactionDeleteButton: {
      backgroundColor: colors.error,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    balanceItem: {
      marginBottom: spacing.md,
    },
    balanceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    balanceName: {
      ...typography.h4,
      color: colors.text,
    },
    balanceUser: {
      ...typography.h4,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    balanceAmount: {
      ...typography.h4,
      fontWeight: "700",
    },
    balanceStatus: {
      ...typography.caption,
      marginTop: spacing.xs,
    },
    balanceDescription: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    actionButton: {
      ...components.button,
      marginTop: spacing.lg,
    },
    actionButtonText: {
      ...typography.button,
      color: colors.surface,
    },
    settleButton: {
      ...components.button,
      backgroundColor: colors.success,
      marginTop: spacing.sm,
    },
    settleButtonText: {
      color: colors.surface,
      ...typography.body,
      fontWeight: "600",
    },
    detailHeader: {
      ...typography.h4,
      color: colors.text,
      marginTop: spacing.lg,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.xs,
    },
    detailItem: {
      ...components.card,
      marginBottom: spacing.sm,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    detailText: {
      ...typography.body,
      color: colors.text,
      lineHeight: 20,
    },
    detailAmount: {
      fontWeight: "600",
      color: colors.primary,
    },
    detailUser: {
      fontWeight: "600",
      color: colors.text,
    },
    enhancedBalanceInfo: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    enhancedBalanceText: {
      ...typography.caption,
      color: colors.textSecondary,
      marginVertical: 2,
    },
    dataSourceHeader: {
      ...typography.body,
      fontWeight: "600",
      color: colors.primary,
      textAlign: "center",
      marginBottom: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: `${colors.primary}15`,
      borderRadius: borderRadius.md,
    },
    participantCount: {
      ...typography.caption,
      color: colors.textSecondary,
      fontStyle: "italic",
    },
    settleHeader: {
      ...typography.h4,
      color: colors.text,
      marginBottom: spacing.lg,
    },
    settlementItem: {
      ...components.card,
      marginBottom: spacing.md,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    settlementText: {
      ...typography.h4,
      color: colors.text,
      flex: 1,
    },
    transactionTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flex: 1,
    },
    transactionTypeBadge: {
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      marginLeft: spacing.sm,
    },
    expenseTypeBadge: {
      backgroundColor: `${colors.primary}25`,
    },
    settlementTypeBadge: {
      backgroundColor: `${colors.secondary}25`,
    },
    transactionTypeText: {
      ...typography.caption,
      fontWeight: "600",
    },
    expenseTypeText: {
      color: colors.primary,
    },
    settlementTypeText: {
      color: colors.secondary,
    },
    settlementInfo: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    settlementFromTo: {
      ...typography.caption,
      color: colors.textSecondary,
      fontFamily: "monospace",
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    },
    detailTextContainer: {
      flex: 1,
      marginRight: spacing.sm,
    },
  });

  const {
    currentGroup,
    groupBalances,
    groupSimplify,
    groupMembers,
    isLoading,
    groupTransactions,
    groupAnalytics,
  } = useSelector((state: RootState) => state.groups);
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<"transactions" | "balances">(
    "transactions"
  );

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = () => {
    dispatch(fetchGroup(groupId));
    dispatch(fetchGroupMembers(groupId));
    dispatch(fetchGroupBalances(groupId));
    dispatch(fetchGroupSimplify(groupId));
    dispatch(
      fetchGroupTransactions({
        groupId,
        params: { limit: 50 },
      })
    );
    dispatch(fetchGroupAnalytics(groupId));
  };

  const handleAddExpense = () => {
    navigation.navigate("CreateExpense", { groupId });
  };

  const handleSettlements = () => {
    navigation.navigate("Settlements", { groupId });
  };

  // Utility function to extract error message from various error formats
  const extractErrorMessage = (error: any, defaultMessage: string): string => {
    if (typeof error === "string") {
      return error;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.error) {
      return error.error;
    }

    if (error?.data?.message) {
      return error.data.message;
    }

    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    return defaultMessage;
  };

  const handleCompleteSettlement = async (
    settlementId: string,
    amount: number,
    currency: string,
    payeeName: string
  ) => {
    try {
      await dispatch(
        completeTransaction({
          id: settlementId,
          data: {
            notes: `Paid ${formatCurrency(amount, currency)} to ${payeeName}`,
          },
        })
      ).unwrap();

      // Reload the group data to get updated balances and settlements
      loadGroupData();

      Alert.alert(
        "Settlement Completed",
        `Payment of ${formatCurrency(
          amount,
          currency
        )} to ${payeeName} has been marked as completed.`,
        [{ text: "OK" }]
      );
    } catch (error: any) {
      let errorMessage = "Failed to complete settlement. Please try again.";

      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }

      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    }
  };

  const handleMarkAsPaid = async (settlement: any) => {
    if (!user?.id) return;

    try {
      // Use the new transaction-based settlement API
      const settlementTransaction = await dispatch(
        createSettlementTransaction({
          group_id: groupId,
          payer_id: settlement.payer_id,
          payee_id: settlement.payee_id,
          amount: settlement.amount,
          currency: settlement.currency,
          notes: "Settlement payment made",
          settlement_method: "manual", // This will make it created as completed
        })
      ).unwrap();

      // Reload the group data to get updated balances and settlements
      setTimeout(() => {
        loadGroupData();
      }, 1000);

      Alert.alert(
        "Payment Completed",
        `Payment of ${formatCurrency(
          settlement.amount,
          settlement.currency
        )} to ${
          settlement.payee_name || "recipient"
        } has been recorded and marked as completed.`,
        [{ text: "OK" }]
      );
    } catch (error: any) {
      console.error("❌ Error in handleMarkAsPaid:", error);
      let errorMessage = "Failed to complete payment. Please try again.";

      // Try to extract meaningful error message
      if (typeof error === "string") {
        errorMessage = error;
      } else if (error?.message && typeof error.message === "string") {
        errorMessage = error.message;
      } else if (
        error?.data?.message &&
        typeof error.data.message === "string"
      ) {
        errorMessage = error.data.message;
      } else if (
        error?.response?.data?.message &&
        typeof error.response.data.message === "string"
      ) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    }
  };

  const handleCreateCustomSettlement = async (
    payeeId: string,
    amount: number,
    currency: string
  ) => {
    if (!user?.id) return;

    try {
      await dispatch(
        createSettlementTransaction({
          group_id: groupId,
          payer_id: user.id,
          payee_id: payeeId,
          amount,
          currency,
          notes: "Custom settlement",
        })
      ).unwrap();

      // Reload the group data
      loadGroupData();

      Alert.alert(
        "Settlement Created",
        `Settlement for ${formatCurrency(amount, currency)} has been created.`,
        [{ text: "OK" }]
      );
    } catch (error: any) {
      let errorMessage = "Failed to create settlement. Please try again.";

      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }

      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const safeAmount =
      typeof amount === "number" && !isNaN(amount) ? amount : 0;
    return `${currency} ${safeAmount.toFixed(2)}`;
  };

  const getBalanceColor = (balance: number) => {
    if (balance < 0) return colors.error; // Red for negative (you owe money)
    if (balance > 0) return colors.success; // Green for positive (you are owed money)
    return colors.textSecondary; // Gray for zero
  };

  const getBalanceText = (balance: number) => {
    if (balance < 0) return `You owe ${Math.abs(balance)}`;
    if (balance > 0) return `You are owed ${Math.abs(balance)}`;
    return "You are settled up";
  };

  const getUserName = (userId: string) => {
    if (!userId) return "Unknown User";
    if (userId === user?.id) return "You";
    const member = groupMembers?.find(
      (m: any) => m.id === userId || m.user_id === userId
    );
    return (
      member?.name ||
      (member as any)?.user_name ||
      member?.email?.split("@")[0] ||
      `User ${userId.slice(-4)}`
    );
  };

  const getSettlementParticipants = (transaction: any) => {
    // For settlements, we can get payer/payee info from multiple places
    if (transaction.payer_id && transaction.payee_id) {
      return {
        payer: getUserName(transaction.payer_id),
        payee: getUserName(transaction.payee_id),
      };
    }

    // Fallback to participants array
    if (transaction.participants && transaction.participants.length >= 2) {
      const payer = transaction.participants.find((p: any) => p.amount > 0);
      const payee = transaction.participants.find((p: any) => p.amount < 0);

      return {
        payer: payer ? getUserName(payer.user_id) : "Unknown",
        payee: payee ? getUserName(payee.user_id) : "Unknown",
      };
    }

    return {
      payer: "Unknown",
      payee: "Unknown",
    };
  };

  const handleTransactionPress = (transactionId: string) => {
    navigation.navigate("TransactionDetails", { transactionId });
  };

  const renderTransactionsTab = () => {
    // Use transaction data for all transaction types (expenses and settlements)
    const allTransactions = Array.isArray(groupTransactions)
      ? groupTransactions
      : [];

    const displayTransactions = allTransactions;

    return (
      <View style={styles.tabContent}>
        {!displayTransactions ||
        !Array.isArray(displayTransactions) ||
        displayTransactions.length === 0 ? (
          <EmptyState
            iconName="receipt-outline"
            title="No transactions yet"
            subtitle="Add your first expense to get started"
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header to show data source */}
            <Text style={styles.dataSourceHeader}>
              📊 Enhanced Transaction Data
            </Text>

            {displayTransactions.map((transaction: any) => (
              <View
                key={transaction.id || transaction._id}
                style={styles.expenseItem}
              >
                <TouchableOpacity
                  style={styles.expenseContent}
                  onPress={() =>
                    handleTransactionPress(transaction.id || transaction._id)
                  }
                >
                  <View style={styles.expenseHeader}>
                    <View style={styles.transactionTitleRow}>
                      <Text style={styles.expenseDescription}>
                        {transaction.description}
                      </Text>
                      <View
                        style={[
                          styles.transactionTypeBadge,
                          transaction.type === "expense"
                            ? styles.expenseTypeBadge
                            : styles.settlementTypeBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.transactionTypeText,
                            transaction.type === "expense"
                              ? styles.expenseTypeText
                              : styles.settlementTypeText,
                          ]}
                        >
                          {transaction.type === "expense"
                            ? "Expense"
                            : "Settlement"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.expenseAmount}>
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </Text>
                  </View>
                  <View style={styles.expenseMeta}>
                    <Text style={styles.expenseCategory}>
                      {transaction.category ||
                        (transaction.type === "settlement"
                          ? "Settlement"
                          : "General")}
                    </Text>
                    <Text style={styles.expenseDate}>
                      {new Date(
                        transaction.created_at || transaction.date
                      ).toLocaleDateString()}
                    </Text>
                    {transaction.participants && (
                      <Text style={styles.participantCount}>
                        {transaction.participants.length} participants
                      </Text>
                    )}
                  </View>
                  {transaction.type === "settlement" && (
                    <View style={styles.settlementInfo}>
                      {(() => {
                        const participants =
                          getSettlementParticipants(transaction);
                        return (
                          <Text style={styles.settlementFromTo}>
                            Settlement: {participants.payer} →{" "}
                            {participants.payee}
                          </Text>
                        );
                      })()}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderBalancesTab = () => {
    // Use enhanced balance data
    const currentUserBalance = Array.isArray(groupBalances)
      ? groupBalances.find((balance: any) => balance.user_id === user?.id)
      : null;

    // Use simplify data
    const settlementData = Array.isArray(groupSimplify) ? groupSimplify : [];

    // Get detailed breakdown from settlements
    const userSettlements = Array.isArray(settlementData)
      ? settlementData.filter(
          (settlement) =>
            settlement.payer_id === user?.id || settlement.payee_id === user?.id
        )
      : [];

    // Create detailed balance breakdown
    const detailedBalances = userSettlements.map((settlement) => {
      const isUserPayer = settlement.payer_id === user?.id;
      const otherUserName = isUserPayer
        ? settlement.payee_name || "Someone"
        : settlement.payer_name || "Someone";

      return {
        otherUser: otherUserName,
        amount: settlement.amount || 0,
        currency: settlement.currency || "INR",
        isDebt: isUserPayer, // true if user owes money, false if user is owed money
      };
    });

    // Helper function to get balance amount from either type
    const getBalanceAmount = (balance: any) => {
      return balance?.balance !== undefined
        ? balance.balance
        : balance?.amount || 0;
    };

    return (
      <View style={styles.tabContent}>
        {!currentUserBalance || getBalanceAmount(currentUserBalance) === 0 ? (
          <EmptyState
            iconName="wallet-outline"
            title="You are settled up"
            subtitle="All expenses are balanced"
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Summary Balance */}
            <Card>
              <Card.Content>
                <Text style={styles.balanceUser}>Overall Balance</Text>
                <Text
                  style={[
                    styles.balanceAmount,
                    {
                      color: getBalanceColor(
                        getBalanceAmount(currentUserBalance)
                      ),
                    },
                  ]}
                >
                  {formatCurrency(
                    getBalanceAmount(currentUserBalance),
                    currentUserBalance.currency || "INR"
                  )}
                </Text>
                <Text style={styles.balanceDescription}>
                  {getBalanceText(getBalanceAmount(currentUserBalance))}
                </Text>

                {/* Show enhanced balance details */}
                {currentUserBalance && (
                  <View style={styles.enhancedBalanceInfo}>
                    <Text style={styles.enhancedBalanceText}>
                      Total Paid:{" "}
                      {formatCurrency(
                        currentUserBalance.total_paid,
                        currentUserBalance.currency
                      )}
                    </Text>
                    <Text style={styles.enhancedBalanceText}>
                      Total Owed:{" "}
                      {formatCurrency(
                        currentUserBalance.total_owed,
                        currentUserBalance.currency
                      )}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>

            {/* Detailed Breakdown with Settlement Actions */}
            {detailedBalances.length > 0 && (
              <>
                <Text style={styles.detailHeader}>
                  <Ionicons name="list-outline" size={16} color={colors.text} />{" "}
                  Breakdown & Settlements:
                </Text>
                {detailedBalances.map((detail, index) => {
                  // Find corresponding settlement for pay button
                  const correspondingSettlement = settlementData.find(
                    (settlement) =>
                      (settlement.payer_id === user?.id && detail.isDebt) ||
                      (settlement.payee_id === user?.id && !detail.isDebt)
                  );

                  return (
                    <View
                      key={index}
                      style={[
                        styles.detailItem,
                        {
                          borderLeftColor: detail.isDebt
                            ? colors.error
                            : colors.success,
                        },
                      ]}
                    >
                      <View style={styles.detailRow}>
                        <View style={styles.detailTextContainer}>
                          <Text style={styles.detailText}>
                            {detail.isDebt ? (
                              <>
                                You owe{" "}
                                <Text
                                  style={[
                                    styles.detailAmount,
                                    { color: colors.error },
                                  ]}
                                >
                                  {formatCurrency(
                                    detail.amount,
                                    detail.currency
                                  )}
                                </Text>{" "}
                                to{" "}
                                <Text style={styles.detailUser}>
                                  {detail.otherUser}
                                </Text>
                              </>
                            ) : (
                              <>
                                <Text style={styles.detailUser}>
                                  {detail.otherUser}
                                </Text>{" "}
                                owes you{" "}
                                <Text
                                  style={[
                                    styles.detailAmount,
                                    { color: colors.success },
                                  ]}
                                >
                                  {formatCurrency(
                                    detail.amount,
                                    detail.currency
                                  )}
                                </Text>
                              </>
                            )}
                          </Text>
                        </View>

                        {/* Settlement Action Button */}
                        {detail.isDebt && correspondingSettlement && (
                          <SecondaryButton
                            title="Pay"
                            icon="card-outline"
                            variant="success"
                            size="small"
                            onPress={() =>
                              handleMarkAsPaid(correspondingSettlement)
                            }
                          />
                        )}
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>
        )}
      </View>
    );
  };

  if (!currentGroup) {
    return <LoadingSpinner message="Loading group details..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{currentGroup?.name}</Text>
          {console.log("Group Details:", currentGroup)}
          <Text style={styles.memberCount}>
            {currentGroup?.members?.length || 0} members
          </Text>
        </View>
      </View> */}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "transactions" && styles.activeTab]}
          onPress={() => setActiveTab("transactions")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "transactions" && styles.activeTabText,
            ]}
          >
            Transactions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "balances" && styles.activeTab]}
          onPress={() => setActiveTab("balances")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "balances" && styles.activeTabText,
            ]}
          >
            Balances
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === "transactions" && renderTransactionsTab()}
        {activeTab === "balances" && renderBalancesTab()}
      </View>

      {/* Floating Action Button */}
      <AnimatedFAB iconName="add" onPress={handleAddExpense} />
    </View>
  );
}
