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
} from "../../store/slices/groupsSlice";
import { fetchGroupExpenses } from "../../store/slices/expensesSlice";
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
  const { currentGroup, groupBalances, simplifyData, isLoading } = useSelector(
    (state: RootState) => state.groups
  );
  const { groupExpenses } = useSelector((state: RootState) => state.expenses);
  const { user } = useSelector((state: RootState) => state.auth);
  const allExpensesState = useSelector((state: RootState) => state.expenses);

  const [activeTab, setActiveTab] = useState<
    "expenses" | "balances" | "settle"
  >("expenses");

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  useEffect(() => {
    console.log("GroupExpenses state:", {
      groupExpenses,
      type: typeof groupExpenses,
      isArray: Array.isArray(groupExpenses),
    });
  }, [groupExpenses]);

  useEffect(() => {
    console.log("All expenses state:", {
      allExpenses: allExpensesState,
    });
  }, [allExpensesState]);

  useEffect(() => {
    console.log("GroupBalances state:", {
      groupBalances,
      type: typeof groupBalances,
      isArray: Array.isArray(groupBalances),
      length: Array.isArray(groupBalances) ? groupBalances.length : "N/A",
      firstItem:
        Array.isArray(groupBalances) && groupBalances.length > 0
          ? groupBalances[0]
          : null,
    });
  }, [groupBalances]);

  useEffect(() => {
    console.log("SimplifyData state:", {
      simplifyData,
      type: typeof simplifyData,
      isArray: Array.isArray(simplifyData),
      length: Array.isArray(simplifyData) ? simplifyData.length : "N/A",
      firstItem:
        Array.isArray(simplifyData) && simplifyData.length > 0
          ? simplifyData[0]
          : null,
    });
  }, [simplifyData]);

  useEffect(() => {
    console.log("CurrentGroup state:", {
      currentGroup,
      members: currentGroup?.members,
      memberCount: currentGroup?.members?.length,
    });
  }, [currentGroup]);

  const loadGroupData = () => {
    dispatch(fetchGroup(groupId));
    dispatch(fetchGroupMembers(groupId));
    dispatch(fetchGroupBalances(groupId));
    dispatch(fetchGroupSimplify(groupId));
    dispatch(fetchGroupExpenses({ groupId }));
  };

  const handleAddExpense = () => {
    navigation.navigate("CreateExpense", { groupId });
  };

  const handleSettlements = () => {
    navigation.navigate("Settlements", { groupId });
  };

  const formatCurrency = (amount: number, currency: string) => {
    const safeAmount =
      typeof amount === "number" && !isNaN(amount) ? amount : 0;
    return `${currency} ${safeAmount.toFixed(2)}`;
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "#4CAF50"; // Green for positive
    if (balance < 0) return "#F44336"; // Red for negative
    return "#666"; // Gray for zero
  };

  const getBalanceText = (balance: number) => {
    if (balance > 0) return `You are owed ${Math.abs(balance)}`;
    if (balance < 0) return `You owe ${Math.abs(balance)}`;
    return "You are settled up";
  };

  const renderExpensesTab = () => (
    <View style={styles.tabContent}>
      {!groupExpenses ||
      !Array.isArray(groupExpenses) ||
      groupExpenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No expenses yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your first expense to get started
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {groupExpenses.map((expense) => (
            <View key={expense.id} style={styles.expenseItem}>
              <View style={styles.expenseHeader}>
                <Text style={styles.expenseDescription}>
                  {expense.description}
                </Text>
                <Text style={styles.expenseAmount}>
                  {formatCurrency(expense.amount, expense.currency)}
                </Text>
              </View>
              <View style={styles.expenseMeta}>
                <Text style={styles.expenseCategory}>{expense.category}</Text>
                <Text style={styles.expenseDate}>
                  {new Date(expense.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderBalancesTab = () => (
    <View style={styles.tabContent}>
      {!groupBalances ||
      !Array.isArray(groupBalances) ||
      groupBalances.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No balances</Text>
          <Text style={styles.emptySubtitle}>Add expenses to see balances</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {groupBalances.map((balance, index) => (
            <View key={balance.user_id || index} style={styles.balanceItem}>
              <Text style={styles.balanceUser}>
                {balance.user_name || `User ${index + 1}`}
              </Text>
              <Text
                style={[
                  styles.balanceAmount,
                  { color: getBalanceColor(balance.amount || 0) },
                ]}
              >
                {formatCurrency(balance.amount || 0, balance.currency || "INR")}
              </Text>
              <Text style={styles.balanceDescription}>
                {getBalanceText(balance.amount || 0)}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderSettleTab = () => {
    // Filter settlements to only show ones involving the current user
    const userSettlements = simplifyData.filter(
      (settlement) =>
        settlement.payer_id === user?.id || settlement.payee_id === user?.id
    );

    return (
      <View style={styles.tabContent}>
        {!simplifyData ||
        !Array.isArray(simplifyData) ||
        simplifyData.length === 0 ||
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

              console.log("Settlement debug:", {
                isUserPayer,
                isUserPayee,
                userId: user?.id,
                payerId: settlement.payer_id,
                payeeId: settlement.payee_id,
                otherUserName,
                settlement,
              });

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
                      <TouchableOpacity style={styles.settleButton}>
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
          <Text style={styles.groupName}>{currentGroup.name}</Text>
          <Text style={styles.memberCount}>
            {currentGroup.members?.length || 0} members
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "expenses" && styles.activeTab]}
          onPress={() => setActiveTab("expenses")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "expenses" && styles.activeTabText,
            ]}
          >
            Expenses
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
        {activeTab === "expenses" && renderExpensesTab()}
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
});
