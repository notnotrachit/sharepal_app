import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import {
  PanGestureHandler,
  State,
  ScrollView,
} from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
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
  clearNavigationState,
  clearCurrentTransaction,
} from "../../store/slices/groupsSlice";
import { GroupsStackParamList } from "../../navigation/AppNavigator";
import { useTheme } from "../../contexts/ThemeContext";
import { formatCurrency } from "../../utils/currency";
import LoadingState from "../../components/LoadingState";
import Card from "../../components/Card";
import SecondaryButton from "../../components/SecondaryButton";
import AnimatedFAB from "../../components/AnimatedFAB";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import UserAvatar from "../../components/UserAvatar";
import TransactionListSkeleton from "../../components/skeletons/TransactionListSkeleton";
import GroupDetailsSkeleton from "../../components/skeletons/GroupDetailsSkeleton";
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

  const {
    groups,
    currentGroup,
    groupBalances,
    groupSimplify,
    groupMembers,
    isLoading,
    groupTransactions,
    groupAnalytics,
  } = useSelector((state: RootState) => state.groups);
  console.log("Group Details Screen - groupTransactions:", groupTransactions);
  console.log("Group Details Screen - groupBalances:", groupBalances);
  console.log("Group Details Screen - groupSimplify:", groupSimplify);
  console.log("Group Details Screen - groupMembers:", groupMembers);

  
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<"transactions" | "balances">(
    "transactions"
  );

  // Animation and gesture handling for swipe
  const screenWidth = Dimensions.get("window").width;
  const translateX = React.useRef(new Animated.Value(0)).current;
  const currentIndex = React.useRef(0);

  // Update translateX when activeTab changes
  React.useEffect(() => {
    const toValue = activeTab === "transactions" ? 0 : -screenWidth;
    currentIndex.current = activeTab === "transactions" ? 0 : 1;

    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [activeTab, screenWidth]);

  const onGestureEvent = (event: any) => {
    const { translationX } = event.nativeEvent;
    const currentTabIndex = currentIndex.current;

    // Calculate the base position for current tab
    const basePosition = currentTabIndex === 0 ? 0 : -screenWidth;

    // Calculate the new position with translation
    let newPosition = basePosition + translationX;

    // Clamp the position to prevent over-scrolling
    // Position range: 0 (transactions tab) to -screenWidth (balances tab)
    newPosition = Math.max(Math.min(newPosition, 0), -screenWidth);

    translateX.setValue(newPosition);
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      const threshold = screenWidth * 0.3; // 30% of screen width
      const velocity = velocityX;

      let shouldSwipe = false;
      let newIndex = currentIndex.current;

      // Determine if we should swipe based on distance or velocity
      if (Math.abs(translationX) > threshold || Math.abs(velocity) > 500) {
        if (translationX < 0 && velocity < 0) {
          // Swiping left (to "balances" tab)
          newIndex = 1;
          // Only allow swipe if not already at the last tab
          if (currentIndex.current < 1) {
            shouldSwipe = true;
          }
        } else if (translationX > 0 && velocity > 0) {
          // Swiping right (to "transactions" tab)
          newIndex = 0;
          // Only allow swipe if not already at the first tab
          if (currentIndex.current > 0) {
            shouldSwipe = true;
          }
        }
      }

      if (shouldSwipe && newIndex !== currentIndex.current) {
        // Update the active tab
        setActiveTab(newIndex === 0 ? "transactions" : "balances");
      } else {
        // Snap back to current position
        const toValue = currentIndex.current === 0 ? 0 : -screenWidth;
        Animated.spring(translateX, {
          toValue,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    groupInfo: {
      flex: 1,
    },
    groupName: {
      ...typography.h2,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    memberCount: {
      ...typography.body,
      color: colors.textSecondary,
    },
    membersPreview: {
      alignItems: 'flex-end',
    },
    memberAvatars: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    memberAvatarContainer: {
      marginLeft: -spacing.sm,
      borderWidth: 2,
      borderColor: colors.surface,
      borderRadius: 20,
    },
    moreMembers: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: -spacing.sm,
      borderWidth: 2,
      borderColor: colors.surface,
    },
    moreMembersText: {
      ...typography.caption,
      color: colors.surface,
      fontWeight: '600',
      fontSize: 10,
    },
    loadingMembers: {
      ...typography.caption,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    settingsButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: `${colors.primary}15`,
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
    swipeContainer: {
      flex: 1,
      flexDirection: "row",
      width: screenWidth * 2, // Double width to fit both tabs
    },
    tabPage: {
      width: screenWidth,
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
      gap: spacing.sm,
    },
    detailTextContainer: {
      flex: 1,
      marginLeft: spacing.sm,
    },
  });

  // Clear transaction state when screen is focused to avoid stale data
  useFocusEffect(
    useCallback(() => {
      // Clear any stale transaction or navigation state
      dispatch(clearCurrentTransaction());
      dispatch(clearNavigationState());

      return () => {
        // Cleanup when leaving the screen
        dispatch(clearCurrentTransaction());
      };
    }, [])
  );

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = () => {
    // Set current group context
    dispatch(setCurrentGroup(null)); // Clear first to avoid stale data

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
    // Clear any stale state before navigating to create expense
    dispatch(clearCurrentTransaction());
    dispatch(clearNavigationState());

    // Ensure group members are properly loaded before navigation
    // This helps prevent the alternating issue where sometimes members are just IDs
    const currentGroup = groups.find((g: any) => g.id === groupId);
    if (currentGroup && currentGroup.members) {
      const hasFullUserData = currentGroup.members.some(
        (member: any) =>
          member && typeof member === "object" && (member.id || member._id)
      );

      if (!hasFullUserData) {
        dispatch(fetchGroupMembers(groupId));
      }
    }

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

  const getUserObject = (userId: string) => {
    return groupMembers?.find((m: any) => m.id === userId || m.user_id === userId);
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
      <View style={styles.tabPage}>
        <View style={styles.tabContent}>
          {isLoading && displayTransactions.length === 0 ? (
            <TransactionListSkeleton count={6} />
          ) : !displayTransactions ||
            !Array.isArray(displayTransactions) ||
            displayTransactions.length === 0 ? (
            <EmptyState
              iconName="receipt-outline"
              title="No transactions yet"
              subtitle="Add your first expense to get started"
            />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
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
                        {formatCurrency(
                          transaction.amount,
                          transaction.currency
                        )}
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
      const otherUserId = isUserPayer ? settlement.payee_id : settlement.payer_id;
      const otherUserName = isUserPayer
        ? settlement.payee_name || getUserName(otherUserId)
        : settlement.payer_name || getUserName(otherUserId);
      const otherUserObject = getUserObject(otherUserId);

      return {
        otherUser: otherUserName,
        otherUserId: otherUserId,
        otherUserObject: otherUserObject,
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
      <View style={styles.tabPage}>
        <View style={styles.tabContent}>
          {isLoading && (!groupBalances || groupBalances.length === 0) ? (
            <TransactionListSkeleton count={4} />
          ) : !currentUserBalance ||
            getBalanceAmount(currentUserBalance) === 0 ? (
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
                    <Ionicons
                      name="list-outline"
                      size={16}
                      color={colors.text}
                    />{" "}
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
                          <UserAvatar 
                            user={detail.otherUserObject} 
                            size="small" 
                            fallbackIcon="person"
                          />
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
      </View>
    );
  };

  const renderTabContent = () => {
    return (
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-30, 30]}
        shouldCancelWhenOutside={true}
      >
        <Animated.View
          style={[
            styles.swipeContainer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {renderTransactionsTab()}
          {renderBalancesTab()}
        </Animated.View>
      </PanGestureHandler>
    );
  };

  if (!currentGroup) {
    return <GroupDetailsSkeleton />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{currentGroup?.name || 'Loading...'}</Text>
          <Text style={styles.memberCount}>
            {currentGroup?.members?.length || 0} members
          </Text>
        </View>
        {/* Group Settings Button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate("GroupSettings", { groupId })}
        >
          <Ionicons name="settings-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        {/* Members Preview */}
        <View style={styles.membersPreview}>
          {groupMembers && groupMembers.length > 0 ? (
            <View style={styles.memberAvatars}>
              {groupMembers.slice(0, 4).map((member: any, index: number) => (
                <View key={member.id || member._id || index} style={[styles.memberAvatarContainer, { zIndex: 4 - index }]}>
                  <UserAvatar 
                    user={member} 
                    size="small" 
                    fallbackIcon="person"
                  />
                </View>
              ))}
              {groupMembers.length > 4 && (
                <View style={styles.moreMembers}>
                  <Text style={styles.moreMembersText}>+{groupMembers.length - 4}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.loadingMembers}>Loading members...</Text>
          )}
        </View>
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
      </View>

      {/* Tab Content */}
      <View style={styles.content}>{renderTabContent()}</View>

      {/* Floating Action Button */}
      <AnimatedFAB iconName="add" onPress={handleAddExpense} />
    </View>
  );
}
