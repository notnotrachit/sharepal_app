import React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

import { RootState } from "../store";
import { useTheme } from "../constants/ThemeProvider";
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
  const { colors } = useTheme();

  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function GroupsNavigator() {
  const { colors } = useTheme();

  return (
    <GroupsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        cardStyle: { backgroundColor: colors.background },
      }}
    >
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
  const { colors } = useTheme();

  return (
    <ExpensesStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        cardStyle: { backgroundColor: colors.background },
      }}
    >
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
  const { colors } = useTheme();

  return (
    <FriendsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <FriendsStack.Screen
        name="FriendsList"
        component={FriendsScreen}
        options={{ title: "Friends" }}
      />
    </FriendsStack.Navigator>
  );
}

function ProfileNavigator() {
  const { colors } = useTheme();

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </ProfileStack.Navigator>
  );
}

function MainNavigator() {
  const { colors } = useTheme();

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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
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
  const { colors, colorScheme } = useTheme();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  // Create custom theme based on current color scheme
  const navigationTheme = {
    ...(colorScheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
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
