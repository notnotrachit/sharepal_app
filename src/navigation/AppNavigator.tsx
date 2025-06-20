import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

import { RootState } from "../store";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import GroupsScreen from "../screens/groups/GroupsScreen";
import GroupDetailsScreen from "../screens/groups/GroupDetailsScreen";
import CreateGroupScreen from "../screens/groups/CreateGroupScreen";
import ExpensesScreen from "../screens/expenses/ExpensesScreen";
import CreateExpenseScreen from "../screens/expenses/CreateExpenseScreen";
import ExpenseDetailsScreen from "../screens/expenses/ExpenseDetailsScreen";
import TransactionDetailsScreen from "../screens/transactions/TransactionDetailsScreen";
import FriendsScreen from "../screens/friends/FriendsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import SettlementsScreen from "../screens/settlements/SettlementsScreen";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Groups: undefined;
  Expenses: undefined;
  Friends: undefined;
  Profile: undefined;
};

export type GroupsStackParamList = {
  GroupsList: undefined;
  GroupDetails: { groupId: string };
  CreateGroup: undefined;
  CreateExpense: { groupId?: string };
  Settlements: { groupId: string };
  TransactionDetails: { transactionId: string };
};

export type ExpensesStackParamList = {
  ExpensesList: undefined;
  CreateExpense: { groupId?: string };
  ExpenseDetails: { expenseId: string };
};

export type FriendsStackParamList = {
  FriendsList: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const GroupsStack = createStackNavigator<GroupsStackParamList>();
const ExpensesStack = createStackNavigator<ExpensesStackParamList>();
const FriendsStack = createStackNavigator<FriendsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function GroupsNavigator() {
  return (
    <GroupsStack.Navigator>
      <GroupsStack.Screen
        name="GroupsList"
        component={GroupsScreen}
        options={{ title: "Groups" }}
      />
      <GroupsStack.Screen
        name="GroupDetails"
        component={GroupDetailsScreen}
        options={{ title: "Group Details" }}
      />
      <GroupsStack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{ title: "Create Group" }}
      />
      <GroupsStack.Screen
        name="CreateExpense"
        component={CreateExpenseScreen}
        options={{ title: "Add Expense" }}
      />
      <GroupsStack.Screen
        name="Settlements"
        component={SettlementsScreen}
        options={{ title: "Settlements" }}
      />
      <GroupsStack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{ title: "Transaction Details" }}
      />
    </GroupsStack.Navigator>
  );
}

function ExpensesNavigator() {
  return (
    <ExpensesStack.Navigator>
      <ExpensesStack.Screen
        name="ExpensesList"
        component={ExpensesScreen}
        options={{ title: "Expenses" }}
      />
      <ExpensesStack.Screen
        name="CreateExpense"
        component={CreateExpenseScreen}
        options={{ title: "Add Expense" }}
      />
      <ExpensesStack.Screen
        name="ExpenseDetails"
        component={ExpenseDetailsScreen}
        options={{ title: "Expense Details" }}
      />
    </ExpensesStack.Navigator>
  );
}

function FriendsNavigator() {
  return (
    <FriendsStack.Navigator>
      <FriendsStack.Screen
        name="FriendsList"
        component={FriendsScreen}
        options={{ title: "Friends" }}
      />
    </FriendsStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </ProfileStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Groups") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Expenses") {
            iconName = focused ? "receipt" : "receipt-outline";
          } else if (route.name === "Friends") {
            iconName = focused ? "person-add" : "person-add-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <MainTab.Screen name="Groups" component={GroupsNavigator} />
      <MainTab.Screen name="Expenses" component={ExpensesNavigator} />
      <MainTab.Screen name="Friends" component={FriendsNavigator} />
      <MainTab.Screen name="Profile" component={ProfileNavigator} />
    </MainTab.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
