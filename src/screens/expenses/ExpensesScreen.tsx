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
import { useTheme } from "../../constants/ThemeProvider";
import AnimatedScreen from "../../components/AnimatedScreen";
import AnimatedFAB from "../../components/AnimatedFAB";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import ListContainer from "../../components/ListContainer";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../constants/theme";

type ExpensesScreenNavigationProp = StackNavigationProp<
  ExpensesStackParamList,
  "ExpensesList"
>;

interface Props {
  navigation: ExpensesScreenNavigationProp;
}

export default function ExpensesScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { colors, components } = useTheme();
  const { userTransactions, isLoading } = useSelector(
    (state: RootState) => state.groups
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.md,
    },
    title: {
      ...typography.h2,
      color: colors.text,
    },
    fab: {
      ...components.fab,
    },
    expenseCard: {
      ...components.card,
      marginBottom: spacing.md,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    categoryIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    expenseAmount: {
      alignItems: "flex-end",
    },
    amountText: {
      ...typography.h4,
      color: colors.primary,
    },
    cardContent: {
      marginTop: spacing.sm,
    },
    expenseDescription: {
      ...typography.h4,
      color: colors.text,
      marginBottom: 4,
    },
    categoryText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      textTransform: "capitalize",
      marginBottom: spacing.sm,
    },
    expenseMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    splitInfo: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    splitText: {
      ...typography.caption,
      color: colors.textMuted,
      marginLeft: spacing.xs,
      textTransform: "capitalize",
    },
    dateText: {
      ...typography.caption,
      color: colors.textMuted,
    },
  });

  // Filter transactions to only include expense types
  const expenses = userTransactions.filter(
    (transaction) => transaction.type === "expense"
  );

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    dispatch(fetchUserTransactions({ params: { type: "expense" } }));
  };

  const handleExpensePress = (expense: Transaction) => {
    // Handle both _id and id fields since different endpoints might return different field names
    const transactionId = (expense as any)._id || (expense as any).id;
    if (!transactionId) {
      console.error("Transaction ID is missing:", expense);
      return;
    }
    navigation.navigate("ExpenseDetails", { expenseId: transactionId });
  };

  const getCategoryIcon = (category: string) => {
    const categoryMap: { [key: string]: { icon: string; color: string } } = {
      food: { icon: "restaurant", color: "#FF6B6B" },
      transport: { icon: "car", color: "#4ECDC4" },
      entertainment: { icon: "game-controller", color: "#45B7D1" },
      shopping: { icon: "bag", color: "#FFA07A" },
      groceries: { icon: "basket", color: "#98D8C8" },
      utilities: { icon: "home", color: "#F7DC6F" },
      health: { icon: "medical", color: "#BB8FCE" },
      travel: { icon: "airplane", color: "#85C1E9" },
      education: { icon: "school", color: "#82E0AA" },
      other: { icon: "ellipsis-horizontal", color: "#D5DBDB" },
    };

    const lowerCategory = category.toLowerCase();
    return categoryMap[lowerCategory] || categoryMap.other;
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return `${currency || "USD"} 0.00`;
    }
    return `${currency || "USD"} ${amount.toFixed(2)}`;
  };

  const renderExpenseItem = ({ item }: { item: Transaction }) => {
    // Force extract values to variables
    const description = item?.description || "No description";
    const amount = item?.amount || 0;
    const currency = item?.currency || "USD";
    const category = item?.category || "other";
    const createdAt = item?.created_at;
    const splitType = item?.split_type || "equal";

    const { icon, color } = getCategoryIcon(category);

    return (
      <TouchableOpacity
        style={styles.expenseCard}
        onPress={() => handleExpensePress(item)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: color }]}>
            <Ionicons name={icon as any} size={24} color="#fff" />
          </View>
          <View style={styles.expenseAmount}>
            <Text style={styles.amountText}>
              {formatCurrency(amount, currency)}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.expenseDescription}>{description}</Text>
          <Text style={styles.categoryText}>{category}</Text>

          <View style={styles.expenseMeta}>
            <View style={styles.splitInfo}>
              <Ionicons name="people" size={14} color={colors.textMuted} />
              <Text style={styles.splitText}>Split {splitType}</Text>
            </View>
            <Text style={styles.dateText}>
              {createdAt
                ? new Date(createdAt).toLocaleDateString()
                : "Invalid date"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <AnimatedScreen animationType="slideUp" duration={400}>
      <View style={styles.container}>
        {isLoading && expenses.length === 0 ? (
          <LoadingState message="Loading expenses..." />
        ) : expenses.length === 0 ? (
          <EmptyState
            iconName="receipt-outline"
            title="No Expenses Yet"
            subtitle="Start by adding your first expense to track your spending"
            buttonText="Add Your First Expense"
            onButtonPress={() => navigation.navigate("CreateExpense", {})}
          />
        ) : (
          <ListContainer
            data={expenses}
            renderItem={renderExpenseItem}
            keyExtractor={(item) =>
              (item as any)._id ||
              (item as any).id ||
              `expense-${Math.random()}`
            }
            refreshing={isLoading}
            onRefresh={loadExpenses}
          />
        )}

        {/* Floating Action Button */}
        <AnimatedFAB
          style={styles.fab}
          iconName="add"
          iconSize={28}
          iconColor={colors.surface}
          onPress={() => navigation.navigate("CreateExpense", {})}
        />
      </View>
    </AnimatedScreen>
  );
}
