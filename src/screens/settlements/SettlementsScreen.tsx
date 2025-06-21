import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AppDispatch, RootState } from "../../store";
import {
  fetchGroupTransactions,
  completeTransaction,
} from "../../store/slices/groupsSlice";
import { GroupsStackParamList } from "../../navigation/AppNavigator";
import { Transaction } from "../../types/api";
import { useTheme } from "../../constants/ThemeProvider";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../constants/theme";

type SettlementsScreenNavigationProp = StackNavigationProp<
  GroupsStackParamList,
  "Settlements"
>;
type SettlementsScreenRouteProp = RouteProp<
  GroupsStackParamList,
  "Settlements"
>;

interface Props {
  navigation: SettlementsScreenNavigationProp;
  route: SettlementsScreenRouteProp;
}

export default function SettlementsScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { colors, components } = useTheme();
  const { groupTransactions, isLoading } = useSelector(
    (state: RootState) => state.groups
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);

  // Filter transactions to only show settlement types
  const settlementTransactions = groupTransactions.filter(
    (transaction) => transaction.type === "settlement"
  );

  useEffect(() => {
    loadSettlements();
  }, [groupId]);

  const loadSettlements = () => {
    dispatch(
      fetchGroupTransactions({ groupId, params: { type: "settlement" } })
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadSettlements();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  const renderSettlementItem = ({ item }: { item: Transaction }) => (
    <View style={styles.settlementItem}>
      <View style={styles.settlementHeader}>
        <Text style={styles.amount}>
          {formatCurrency(item.amount, item.currency)}
        </Text>
      </View>

      <View style={styles.settlementDetails}>
        <Text style={styles.paymentInfo}>Payment between group members</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContainer: {
      paddingVertical: spacing.sm,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    emptyTitle: {
      ...typography.h3,
      color: colors.text,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    emptySubtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: "center",
    },
    settlementItem: {
      ...components.card,
      margin: spacing.lg,
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },
    settlementHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    settlementTitle: {
      ...typography.h4,
      color: colors.text,
    },
    amount: {
      ...typography.h4,
      color: colors.success,
      fontWeight: "700",
    },
    settlementAmount: {
      ...typography.h4,
      color: colors.success,
      fontWeight: "700",
    },
    settlementDetails: {
      marginTop: spacing.sm,
    },
    settlementInfo: {
      ...typography.body,
      color: colors.textSecondary,
    },
    paymentInfo: {
      ...typography.body,
      color: colors.textSecondary,
    },
    date: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    notes: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontStyle: "italic",
      marginTop: spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      {settlementTransactions.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="checkmark-circle-outline"
            size={64}
            color={colors.success}
          />
          <Text style={styles.emptyTitle}>No Settlements</Text>
          <Text style={styles.emptySubtitle}>
            All expenses are settled up or no settlements have been created yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={settlementTransactions}
          renderItem={renderSettlementItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
