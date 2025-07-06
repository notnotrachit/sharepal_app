import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { AppDispatch, RootState } from "../../store";
import { fetchGroupTransactions } from "../../store/slices/groupsSlice";
import { GroupsStackParamList } from "../../navigation/AppNavigator";
import { Transaction } from "../../types/api";
import { useTheme } from "../../contexts/ThemeContext";
import { formatCurrency } from "../../utils/currency";
import EmptyState from "../../components/EmptyState";
import Card from "../../components/Card";
import { spacing, typography } from "../../constants/theme";

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


  const renderSettlementItem = ({ item }: { item: Transaction }) => (
    <Card>
      <Card.Content>
        <Text style={styles.amount}>
          {formatCurrency(item.amount, item.currency)}
        </Text>
        <Text style={styles.paymentInfo}>Payment between group members</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
      </Card.Content>
    </Card>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContainer: {
      paddingVertical: spacing.sm,
    },
    amount: {
      ...typography.h4,
      color: colors.success,
      fontWeight: "700",
      marginBottom: spacing.sm,
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
        <EmptyState
          iconName="checkmark-circle-outline"
          title="No Settlements"
          subtitle="All expenses are settled up or no settlements have been created yet"
        />
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
