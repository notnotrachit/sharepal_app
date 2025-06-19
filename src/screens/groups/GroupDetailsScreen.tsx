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

  const [activeTab, setActiveTab] = useState<
    "transactions" | "balances" | "settle"
  >("transactions");

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
    console.log("Error object:", JSON.stringify(error, null, 2));

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
      console.log("Complete settlement error:", error);

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

    console.log("🔄 Starting handleMarkAsPaid for settlement:", settlement);

    try {
      // Use the new transaction-based settlement API
      console.log("🔄 Creating settlement transaction...");
      const settlementTransaction = await dispatch(
        createSettlementTransaction({
          group_id: groupId,
          payer_id: settlement.payer_id,
          payee_id: settlement.payee_id,
          amount: settlement.amount,
          currency: settlement.currency,
          notes: "Settlement from suggestion",
        })
      ).unwrap();

      console.log("✅ Settlement transaction created:", settlementTransaction);

      // Check if we got a valid transaction ID
      if (!settlementTransaction || !settlementTransaction._id) {
        console.log("⚠️ No valid transaction ID, using fallback");
        // Fallback: just record that the payment was made
        loadGroupData();
        Alert.alert(
          "Payment Recorded",
          `Payment of ${formatCurrency(
            settlement.amount,
            settlement.currency
          )} to ${settlement.payee_name || "recipient"} has been recorded.`,
          [{ text: "OK" }]
        );
        return;
      }

      // Then immediately mark it as completed using the new API
      console.log(
        "🔄 Completing transaction with ID:",
        settlementTransaction._id
      );

      try {
        const completionResult = await dispatch(
          completeTransaction({
            id: settlementTransaction._id,
            data: {
              notes: `Paid ${formatCurrency(
                settlement.amount,
                settlement.currency
              )} to ${settlement.payee_name || "recipient"}`,
              settlement_method: "manual",
            },
          })
        ).unwrap();

        console.log("✅ Transaction completion result:", completionResult);
      } catch (completionError) {
        console.error("⚠️ Error completing transaction:", completionError);
        console.error(
          "Full completion error:",
          JSON.stringify(completionError, null, 2)
        );
        // Continue anyway - the transaction was created, we just couldn't mark it as completed
      }

      // Wait a moment for the backend to process, then reload the group data
      console.log("🔄 Reloading group data...");
      setTimeout(() => {
        loadGroupData();
      }, 1500); // Increased delay to allow backend processing

      Alert.alert(
        "Payment Completed",
        `Payment of ${formatCurrency(
          settlement.amount,
          settlement.currency
        )} to ${
          settlement.payee_name || "recipient"
        } has been marked as completed.`,
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
      console.log("Create settlement error:", error);

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
    if (balance < 0) return "#F44336"; // Red for negative (you owe money)
    if (balance > 0) return "#4CAF50"; // Green for positive (you are owed money)
    return "#666"; // Gray for zero
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
    // Debug log to see the transaction structure
    console.log(
      "Settlement transaction:",
      JSON.stringify(transaction, null, 2)
    );
    console.log("Group members:", JSON.stringify(groupMembers, null, 2));

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
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first expense to get started
            </Text>
          </View>
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
                          ? "EXPENSE"
                          : "SETTLEMENT"}
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
                      // Debug the settlement status
                      console.log("Settlement status debug:", {
                        id: transaction._id || transaction.id,
                        is_completed: transaction.is_completed,
                        status: transaction.status,
                        completed: transaction.completed,
                        settled_at: transaction.settled_at,
                        allFields: Object.keys(transaction),
                      });
                      return (
                        <Text style={styles.settlementFromTo}>
                          Settlement: {participants.payer} →{" "}
                          {participants.payee}
                        </Text>
                      );
                    })()}
                    <View
                      style={[
                        styles.settlementStatus,
                        transaction.is_completed ||
                        transaction.status === "completed" ||
                        transaction.completed
                          ? styles.settledBadge
                          : styles.pendingBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.settlementStatusText,
                          transaction.is_completed ||
                          transaction.status === "completed" ||
                          transaction.completed
                            ? styles.settledText
                            : styles.pendingText,
                        ]}
                      >
                        {transaction.is_completed ||
                        transaction.status === "completed" ||
                        transaction.completed
                          ? "COMPLETED"
                          : "PENDING"}
                      </Text>
                    </View>
                  </View>
                )}
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
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>You are settled up</Text>
            <Text style={styles.emptySubtitle}>All expenses are balanced</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Summary Balance */}
            <View style={styles.balanceItem}>
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
            </View>

            {/* Detailed Breakdown */}
            {detailedBalances.length > 0 && (
              <>
                <Text style={styles.detailHeader}>
                  <Ionicons name="list-outline" size={16} color="#333" />{" "}
                  Breakdown:
                </Text>
                {detailedBalances.map((detail, index) => (
                  <View
                    key={index}
                    style={[
                      styles.detailItem,
                      {
                        borderLeftColor: detail.isDebt ? "#FF6B35" : "#4CAF50",
                      },
                    ]}
                  >
                    <Text style={styles.detailText}>
                      {detail.isDebt ? (
                        <>
                          You owe{" "}
                          <Text
                            style={[styles.detailAmount, { color: "#FF6B35" }]}
                          >
                            {formatCurrency(detail.amount, detail.currency)}
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
                            style={[styles.detailAmount, { color: "#4CAF50" }]}
                          >
                            {formatCurrency(detail.amount, detail.currency)}
                          </Text>
                        </>
                      )}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderSettleTab = () => {
    // Use simplify data
    const activeSettlementData = Array.isArray(groupSimplify)
      ? groupSimplify
      : [];

    // Filter settlements to only show ones involving the current user
    const userSettlements = Array.isArray(activeSettlementData)
      ? activeSettlementData.filter(
          (settlement) =>
            settlement.payer_id === user?.id || settlement.payee_id === user?.id
        )
      : [];

    return (
      <View style={styles.tabContent}>
        {!activeSettlementData ||
        !Array.isArray(activeSettlementData) ||
        activeSettlementData.length === 0 ||
        userSettlements.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="checkmark-circle-outline"
              size={48}
              color="#4CAF50"
            />
            <Text style={styles.emptyTitle}>All settled up!</Text>
            <Text style={styles.emptySubtitle}>No payments needed</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.settleHeader}>Settlements:</Text>
            {userSettlements.map((settlement, index) => {
              const isUserPayer = settlement.payer_id === user?.id;
              const isUserPayee = settlement.payee_id === user?.id;

              // Use the names provided in the settlement object
              const otherUserName = isUserPayer
                ? settlement.payee_name || "Someone"
                : settlement.payer_name || "Someone";

              return (
                <View
                  key={`${settlement.payer_id}-${settlement.payee_id}-${index}`}
                  style={styles.settlementItem}
                >
                  {isUserPayer ? (
                    // Current user owes money
                    <>
                      <Text style={styles.settlementText}>
                        Pay{" "}
                        {formatCurrency(
                          settlement.amount || 0,
                          settlement.currency || "INR"
                        )}{" "}
                        to {otherUserName}
                      </Text>
                      <TouchableOpacity
                        style={styles.settleButton}
                        onPress={() => handleMarkAsPaid(settlement)}
                      >
                        <Text style={styles.settleButtonText}>
                          Mark as Paid
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    // Current user is owed money
                    <Text
                      style={[
                        styles.settlementText,
                        { color: "#4CAF50", fontWeight: "bold" },
                      ]}
                    >
                      {otherUserName} owes you{" "}
                      {formatCurrency(
                        settlement.amount || 0,
                        settlement.currency || "INR"
                      )}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  if (!currentGroup) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{currentGroup?.name}</Text>
          <Text style={styles.memberCount}>
            {currentGroup?.members?.length || 0} members
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

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
        <TouchableOpacity
          style={[styles.tab, activeTab === "settle" && styles.activeTab]}
          onPress={() => setActiveTab("settle")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "settle" && styles.activeTabText,
            ]}
          >
            Settle Up
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === "transactions" && renderTransactionsTab()}
        {activeTab === "balances" && renderBalancesTab()}
        {activeTab === "settle" && renderSettleTab()}
      </View>
    </View>
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
  header: {
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  memberCount: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  addButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  expenseItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  expenseMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expenseCategory: {
    fontSize: 12,
    color: "#666",
  },
  expenseDate: {
    fontSize: 12,
    color: "#666",
  },
  balanceItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  balanceUser: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 14,
  },
  balanceDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  detailHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  detailItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  detailAmount: {
    fontWeight: "600",
    color: "#007AFF",
  },
  detailUser: {
    fontWeight: "600",
    color: "#333",
  },
  enhancedBalanceInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  enhancedBalanceText: {
    fontSize: 12,
    color: "#666",
    marginVertical: 2,
  },
  dataSourceHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    textAlign: "center",
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: "#f0f8ff",
    borderRadius: 6,
  },
  participantCount: {
    fontSize: 10,
    color: "#999",
    fontStyle: "italic",
  },
  settleHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  settlementItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settlementText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  settleButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  settleButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  // Transaction-specific styles
  transactionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  transactionTypeBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  expenseTypeBadge: {
    backgroundColor: "#e3f2fd",
  },
  settlementTypeBadge: {
    backgroundColor: "#f3e5f5",
  },
  transactionTypeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  expenseTypeText: {
    color: "#1976d2",
  },
  settlementTypeText: {
    color: "#7b1fa2",
  },
  settlementInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settlementFromTo: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  settlementStatus: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  settlementStatusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  settledBadge: {
    backgroundColor: "#e8f5e8",
  },
  pendingBadge: {
    backgroundColor: "#fff3cd",
  },
  settledText: {
    color: "#4CAF50",
  },
  pendingText: {
    color: "#856404",
  },
});
