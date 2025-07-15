import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AppDispatch, RootState } from "../../store";
import {
  fetchUserTransactions,
  clearCurrentTransaction,
  clearNavigationState,
} from "../../store/slices/groupsSlice";
import { ExpensesStackParamList } from "../../navigation/AppNavigator";
import { Transaction } from "../../types/api";
import { useTheme } from "../../contexts/ThemeContext";
import { formatCurrency } from "../../utils/currency";
import AnimatedScreen from "../../components/AnimatedScreen";
import AnimatedFAB from "../../components/AnimatedFAB";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import TransactionListSkeleton from "../../components/skeletons/TransactionListSkeleton";
import PullToRefresh from "../../components/PullToRefresh";
import EmptyStateIllustration from "../../components/EmptyStateIllustration";
import SwipeableRow from "../../components/SwipeableRow";
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

  // Filter transactions to only include expense types
  const expenses = userTransactions.filter(
    (transaction) => transaction.type === "expense"
  );

  // Calculate summary statistics
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const thisMonthExpenses = expenses.filter(expense => {
    if (!expense.created_at) return false;
    const expenseDate = new Date(expense.created_at);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear();
  }).length;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
      backgroundColor: colors.surface,
      borderBottomLeftRadius: borderRadius.xl,
      borderBottomRightRadius: borderRadius.xl,
      ...shadows.medium,
    },
    headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    title: {
      ...typography.h1,
      color: colors.text,
      fontWeight: '700',
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    summaryCards: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: spacing.md,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: `${colors.primary}10`,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginHorizontal: spacing.xs,
      alignItems: "center",
    },
    summaryNumber: {
      ...typography.h3,
      color: colors.primary,
      fontWeight: '700',
    },
    summaryLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    listContainer: {
      flex: 1,
      paddingTop: spacing.lg,
    },
    fab: {
      ...components.fab,
      backgroundColor: colors.primary,
      ...shadows.large,
    },
    expenseCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      overflow: 'hidden',
      ...shadows.medium,
    },
    cardGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
    },
    cardContent: {
      padding: spacing.lg,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    categoryIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.md,
      ...shadows.small,
    },
    expenseInfo: {
      flex: 1,
    },
    expenseDescription: {
      ...typography.h3,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    categoryText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      textTransform: "capitalize",
    },
    amountContainer: {
      alignItems: "flex-end",
    },
    amountText: {
      ...typography.h2,
      color: colors.text,
      fontWeight: '700',
    },
    currencyText: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    expenseMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    splitInfo: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${colors.primary}10`,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.lg,
    },
    splitIcon: {
      marginRight: spacing.xs,
    },
    splitText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
      textTransform: "capitalize",
    },
    dateText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '500',
    },
  });


  // Clear navigation state when returning to expenses list, preserve transaction data
  useFocusEffect(
    useCallback(() => {
      // Only clear navigation state, not transaction data
      // This allows transaction details to persist when switching tabs
      dispatch(clearNavigationState());

      return () => {
        dispatch(clearNavigationState());
      };
    }, [])
  );

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    dispatch(fetchUserTransactions({ params: { type: "expense" } }));
  };

  const handleExpensePress = (expense: Transaction) => {
    // Clear any stale state before navigating
    dispatch(clearCurrentTransaction());
    dispatch(clearNavigationState());

    // Handle both _id and id fields since different endpoints might return different field names
    const transactionId = (expense as any)._id || (expense as any).id;
    if (!transactionId) {
      return;
    }
    navigation.navigate("ExpenseDetails", { expenseId: transactionId });
  };

  const getCategoryIcon = (category: string) => {
    const categoryMap: { [key: string]: { icon: string; gradient: string[] } } = {
      'food & dining': { icon: "restaurant", gradient: ['#FF6B6B', '#FF8E8E'] },
      'transportation': { icon: "car", gradient: ['#4ECDC4', '#6EDDD6'] },
      'shopping': { icon: "bag", gradient: ['#45B7D1', '#67C3DB'] },
      'entertainment': { icon: "game-controller", gradient: ['#FFA07A', '#FFB399'] },
      'bills & utilities': { icon: "receipt", gradient: ['#98D8C8', '#B0E0D3'] },
      'home': { icon: "home", gradient: ['#F7DC6F', '#F9E79F'] },
      'health & fitness': { icon: "fitness", gradient: ['#BB8FCE', '#C8A2C8'] },
      'travel': { icon: "airplane", gradient: ['#85C1E9', '#A3D5F1'] },
      'education': { icon: "school", gradient: ['#FF9F43', '#FFA726'] },
      'personal care': { icon: "person", gradient: ['#6C5CE7', '#A29BFE'] },
      'gifts & donations': { icon: "gift", gradient: ['#FD79A8', '#FDCB6E'] },
      'other': { icon: "ellipsis-horizontal", gradient: ['#74B9FF', '#0984E3'] },
    };

    const lowerCategory = category.toLowerCase();
    return categoryMap[lowerCategory] || categoryMap.other;
  };


  const renderExpenseItem = ({ item }: { item: Transaction }) => {
    // Force extract values to variables
    const description = item?.description || "No description";
    const amount = item?.amount || 0;
    const currency = item?.currency || "USD";
    const category = item?.category || "other";
    const createdAt = item?.created_at;
    const splitType = item?.split_type || "equal";

    const { icon, gradient } = getCategoryIcon(category);

    return (
      <TouchableOpacity
        style={styles.expenseCard}
        onPress={() => handleExpensePress(item)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardGradient}
        />
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryIcon}
            >
              <Ionicons name={icon as any} size={28} color="#fff" />
            </LinearGradient>
            
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseDescription}>{description}</Text>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
            
            <View style={styles.amountContainer}>
              <Text style={styles.amountText}>
                {formatCurrency(amount, currency)}
              </Text>
              <Text style={styles.currencyText}>{currency}</Text>
            </View>
          </View>

          <View style={styles.expenseMeta}>
            <View style={styles.splitInfo}>
              <Ionicons 
                name="people" 
                size={14} 
                color={colors.primary} 
                style={styles.splitIcon}
              />
              <Text style={styles.splitText}>Split {splitType}</Text>
            </View>
            <Text style={styles.dateText}>
              {createdAt
                ? new Date(createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
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
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>My Expenses</Text>
              <Text style={styles.subtitle}>
                {expenses.length === 0 
                  ? "Start tracking your expenses" 
                  : `${totalExpenses} total expense${totalExpenses !== 1 ? 's' : ''}`
                }
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                dispatch(clearCurrentTransaction());
                dispatch(clearNavigationState());
                navigation.navigate("CreateExpense", {});
              }}
              style={{
                backgroundColor: colors.primary,
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                ...shadows.small,
              }}
            >
              <Ionicons name="add" size={24} color={colors.surface} />
            </TouchableOpacity>
          </View>
          
          {expenses.length > 0 && (
            <View style={styles.summaryCards}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{totalExpenses}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{thisMonthExpenses}</Text>
                <Text style={styles.summaryLabel}>This Month</Text>
              </View>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.listContainer}>
          {isLoading && expenses.length === 0 ? (
            <TransactionListSkeleton count={8} />
          ) : expenses.length === 0 ? (
            <EmptyState
              iconName="receipt-outline"
              title="No Expenses Yet"
              subtitle="Start by adding your first expense to track your spending with friends and family"
              buttonText="Add Your First Expense"
              onButtonPress={() => {
                dispatch(clearCurrentTransaction());
                dispatch(clearNavigationState());
                navigation.navigate("CreateExpense", {});
              }}
            />
          ) : (
            <FlatList
              data={expenses}
              renderItem={renderExpenseItem}
              keyExtractor={(item) =>
                (item as any)._id ||
                (item as any).id ||
                `expense-${Math.random()}`
              }
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={loadExpenses}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: spacing.xxl * 2,
              }}
            />
          )}
        </View>

        {/* Enhanced Floating Action Button */}
        {expenses.length > 0 && (
          <AnimatedFAB
            style={styles.fab}
            iconName="add"
            iconSize={28}
            iconColor={colors.surface}
            onPress={() => {
              dispatch(clearCurrentTransaction());
              dispatch(clearNavigationState());
              navigation.navigate("CreateExpense", {});
            }}
          />
        )}
      </View>
    </AnimatedScreen>
  );
}
