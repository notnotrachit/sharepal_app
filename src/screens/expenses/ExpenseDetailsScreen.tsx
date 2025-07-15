import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
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
import Card from "../../components/Card";
import SecondaryButton from "../../components/SecondaryButton";
import { spacing, borderRadius, typography } from "../../constants/theme";
import AnimatedScreen from "../../components/AnimatedScreen";
import TransactionDetailsSkeleton from "../../components/skeletons/TransactionDetailsSkeleton";
import UserAvatar from "../../components/UserAvatar";
import { Ionicons } from "@expo/vector-icons";

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
  const { colors } = useTheme();
  const { currentTransaction, isLoading, error } = useSelector(
    (state: RootState) => state.groups,
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchTransaction(expenseId));
    return () => {
      dispatch(clearCurrentTransaction());
    };
  }, [dispatch, expenseId]);

  const expense = useMemo(() => {
    if (
      currentTransaction?._id === expenseId ||
      (currentTransaction as any)?.id === expenseId
    ) {
      return currentTransaction;
    }
    return null;
  }, [currentTransaction, expenseId]);

  const participants = useMemo(() => {
    if (!expense) return [];

    const combined = new Map();

    function addUser(u: any) {
      if (!combined.has(u.user_id)) {
        combined.set(u.user_id, {
          id: u.user_id,
          name: u.user_name,
          avatar: u.profile_pic_url,
          paid: 0,
          share: 0,
        });
      }
    }

    (expense as any).payers?.forEach(addUser);
    (expense as any).splits?.forEach(addUser);

    (expense as any).payers?.forEach((p: any) => {
      combined.get(p.user_id).paid = p.amount;
    });

    (expense as any).splits?.forEach((s: any) => {
      combined.get(s.user_id).share = s.amount;
    });

    return Array.from(combined.values());
  }, [expense]);

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
            } catch (e: any) {
              Alert.alert("Error", e.message || "Failed to delete expense.");
            }
          },
        },
      ],
    );
  };

  const styles = StyleSheet.create({
    contentContainer: { padding: spacing.lg, paddingBottom: spacing.xl },
    header: { marginBottom: spacing.lg, alignItems: "center" },
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
    date: { ...typography.body, color: colors.textSecondary },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.md,
    },
    detailLabel: { ...typography.body, color: colors.textSecondary },
    detailValue: { ...typography.body, color: colors.text, fontWeight: "500" },
    notes: { ...typography.body, color: colors.text, lineHeight: 22 },
    actions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xl },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.lg,
    },
    errorText: { ...typography.h3, color: colors.error, textAlign: "center" },
    participantCard: { marginTop: spacing.lg },
    participantRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
    },
    participantInfo: { marginLeft: spacing.md, flex: 1 },
    participantName: {
      ...typography.body,
      color: colors.text,
      fontWeight: "500",
    },
    participantDetail: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    balanceContainer: { alignItems: "flex-end" },
    balanceAmount: {
      ...typography.body,
      fontWeight: "600",
    },
    balanceLabel: { ...typography.caption, color: colors.textSecondary },
  });

  if (isLoading && !expense) return <TransactionDetailsSkeleton />;
  if (error && !expense) {
    return (
      <AnimatedScreen style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </AnimatedScreen>
    );
  }
  if (!expense) {
    return (
      <AnimatedScreen style={styles.errorContainer}>
        <Text style={styles.errorText}>Transaction not found.</Text>
      </AnimatedScreen>
    );
  }

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
            Paid: {formatCurrency(p.paid, expense.currency)}
          </Text>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceAmount, { color: colors.text }]}>
            {formatCurrency(p.share, expense.currency)}
          </Text>
          {/* <Text style={styles.balanceLabel}>Share</Text> */}
        </View>
      </View>
    );
  };

  return (
    <AnimatedScreen>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.description}>{expense.description}</Text>
          <Text style={styles.amount}>
            {formatCurrency(expense.amount, expense.currency)}
          </Text>
          <Text style={styles.date}>
            {new Date(expense.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        <Card>
          <Card.Header title="Details" />
          <Card.Content>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{expense.category}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Split Type</Text>
              <Text style={styles.detailValue}>{expense.split_type}</Text>
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

        <Card style={styles.participantCard}>
          <Card.Header title="Participants" />
          <Card.Content>{participants.map(renderParticipant)}</Card.Content>
        </Card>

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
            onPress={handleDeleteExpense}
            variant="error"
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}
