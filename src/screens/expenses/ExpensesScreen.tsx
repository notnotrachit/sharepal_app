import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { AppDispatch, RootState } from "../../store";
import { fetchUserTransactions } from "../../store/slices/groupsSlice";
import { ExpensesStackParamList } from "../../navigation/AppNavigator";
import { Transaction } from "../../types/api";

type ExpensesScreenNavigationProp = StackNavigationProp<
  ExpensesStackParamList,
  "ExpensesList"
>;

interface Props {
  navigation: ExpensesScreenNavigationProp;
}

export default function ExpensesScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { userTransactions, isLoading } = useSelector(
    (state: RootState) => state.groups
  );

  // Filter transactions to only include expense types
  const expenses = userTransactions.filter(
    (transaction) => transaction.type === "expense"
  );

  useEffect(() => {
    console.log("ExpensesScreen: Component mounted");
    console.log("ExpensesScreen: Current user transactions state:", {
      userTransactions,
      expenses,
      count: expenses?.length || 0,
      isArray: Array.isArray(expenses),
      isLoading,
    });
  }, []);

  useEffect(() => {
    console.log("ExpensesScreen: User transactions state changed:", {
      userTransactions,
      expenses,
      count: expenses?.length || 0,
      isArray: Array.isArray(expenses),
      isLoading,
    });
  }, [userTransactions, expenses, isLoading]);

  useEffect(() => {
    console.log("ExpensesScreen: Loading user transactions...");
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    console.log("ExpensesScreen: Dispatching fetchUserTransactions...");
    dispatch(fetchUserTransactions({ params: { type: "expense" } }));
  };

  const handleExpensePress = (expense: Transaction) => {
    navigation.navigate("ExpenseDetails", { expenseId: expense._id });
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return `${currency || "USD"} 0.00`;
    }
    return `${currency || "USD"} ${amount.toFixed(2)}`;
  };

  const renderExpenseItem = ({ item }: { item: Transaction }) => {
    // Force extract values to variables
    console.log("Rendering expense item:", item);
    const description = item?.description || "No description";
    const amount = item?.amount || 0;
    const currency = item?.currency || "USD";
    const category = item?.category || "Unknown";
    const createdAt = item?.created_at;
    const splitType = item?.split_type || "Unknown";
    const isSettled = item?.is_completed || false;

    return (
      <TouchableOpacity
        style={styles.expenseItem}
        onPress={() => handleExpensePress(item)}
      >
        <View style={styles.expenseContent}>
          <View style={styles.expenseHeader}>
            <Text style={styles.expenseDescription}>{description}</Text>
            <Text style={styles.expenseAmount}>
              {formatCurrency(amount, currency)}
            </Text>
          </View>
          <View style={styles.expenseMeta}>
            <View style={styles.categoryContainer}>
              <Ionicons name="pricetag-outline" size={14} color="#666" />
              <Text style={styles.category}>{category}</Text>
            </View>
            <Text style={styles.date}>
              {createdAt
                ? new Date(createdAt).toLocaleDateString()
                : "Invalid date"}
            </Text>
          </View>
          <View style={styles.splitInfo}>
            <Text style={styles.splitType}>Split: {splitType}</Text>
            <Text
              style={[
                styles.settledStatus,
                isSettled ? styles.settled : styles.pending,
              ]}
            >
              {isSettled ? "Settled" : "Pending"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Expenses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateExpense", {})}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {expenses.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Expenses Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start by adding your first expense to track your spending
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => navigation.navigate("CreateExpense", {})}
          >
            <Text style={styles.createFirstButtonText}>
              Add Your First Expense
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          key={`expenses-${expenses.length}-${Date.now()}`}
          data={expenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadExpenses} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  expenseItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseContent: {
    padding: 16,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  expenseDescription: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  expenseMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  category: {
    fontSize: 12,
    color: "#666",
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  splitInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  splitType: {
    fontSize: 12,
    color: "#888",
    textTransform: "capitalize",
  },
  settledStatus: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  settled: {
    backgroundColor: "#e8f5e8",
    color: "#4CAF50",
  },
  pending: {
    backgroundColor: "#fff3cd",
    color: "#856404",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createFirstButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
