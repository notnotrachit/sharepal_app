import React from "react";
import TransactionDetailsScreen from "../transactions/TransactionDetailsScreen";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { ExpensesStackParamList } from "../../navigation/AppNavigator";

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
  // Simply pass through to the unified TransactionDetailsScreen
  return <TransactionDetailsScreen navigation={navigation} route={route} />;
}
