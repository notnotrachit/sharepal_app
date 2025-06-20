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

  const handleCompleteSettlement = async (settlement: Transaction) => {
    Alert.alert(
      "Confirm Payment",
      `Mark payment of ${formatCurrency(
        settlement.amount,
        settlement.currency
      )} as completed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await dispatch(
                completeTransaction({
                  id: settlement._id,
                  data: {
                    notes: `Payment completed on ${new Date().toLocaleDateString()}`,
                  },
                })
              ).unwrap();

              loadSettlements();

              Alert.alert(
                "Settlement Completed",
                `Payment of ${formatCurrency(
                  settlement.amount,
                  settlement.currency
                )} has been marked as completed.`,
                [{ text: "OK" }]
              );
            } catch (error: any) {

              let errorMessage =
                "Failed to complete settlement. Please try again.";

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
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "cancelled":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const renderSettlementItem = ({ item }: { item: Transaction }) => (
    <View style={styles.settlementItem}>
      <View style={styles.settlementHeader}>
        <Text style={styles.amount}>
          {formatCurrency(item.amount, item.currency)}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getStatusColor(
                item.is_completed ? "completed" : "pending"
              ),
            },
          ]}
        >
          <Text style={styles.statusText}>
            {(item.is_completed ? "completed" : "pending").toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.settlementDetails}>
        <Text style={styles.paymentInfo}>Payment between group members</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      {item.notes && <Text style={styles.notes}>{item.notes}</Text>}

      {!item.is_completed && (
        <TouchableOpacity
          style={styles.markCompleteButton}
          onPress={() => handleCompleteSettlement(item)}
        >
          <Text style={styles.markCompleteText}>Mark as Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {settlementTransactions.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#4CAF50" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listContainer: {
    padding: 16,
  },
  settlementItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settlementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  amount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  settlementDetails: {
    marginBottom: 8,
  },
  paymentInfo: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  notes: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginTop: 8,
    marginBottom: 12,
  },
  markCompleteButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  markCompleteText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
  },
});
