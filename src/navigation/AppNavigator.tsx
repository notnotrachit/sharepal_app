import React from "react";
import { View, Platform, TouchableOpacity } from "react-native";
import { Text } from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import { RootState } from "../store";
import { getFocusedRouteNameFromRoute, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import CustomDrawerContent from "../components/CustomDrawerContent";
import WebLayout from "../components/WebLayout";
import WebDrawer from "../components/WebDrawer";
import AnimatedTabIcon from "../components/AnimatedTabIcon";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import GroupsScreen from "../screens/groups/GroupsScreen";
import GroupDetailsScreen from "../screens/groups/GroupDetailsScreen";
import GroupSettingsScreen from "../screens/groups/GroupSettingsScreen";
import CreateGroupScreen from "../screens/groups/CreateGroupScreen";
import ExpensesScreen from "../screens/expenses/ExpensesScreen";
import CreateExpenseScreen from "../screens/expenses/CreateExpenseScreen";
import ExpenseDetailsScreen from "../screens/expenses/ExpenseDetailsScreen";
import TransactionDetailsScreen from "../screens/transactions/TransactionDetailsScreen";
import FriendsScreen from "../screens/friends/FriendsScreen";
import AddFriendScreen from "../screens/friends/AddFriendScreen";
import SettlementsScreen from "../screens/settlements/SettlementsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";

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
};

export type MainDrawerParamList = {
  MainTabs: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
};

export type GroupsStackParamList = {
  GroupsList: undefined;
  GroupDetails: { groupId: string };
  GroupSettings: { groupId: string };
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
  AddFriend: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainDrawer = createDrawerNavigator<MainDrawerParamList>();
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
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
      }}
    >
      <GroupsStack.Screen
        name="GroupsList"
        component={GroupsScreen}
        options={{
          title: "Groups",
          ...TransitionPresets.FadeFromBottomAndroid,
        }}
      />
      <GroupsStack.Screen
        name="GroupDetails"
        component={GroupDetailsScreen}
        options={{
          title: "Group Details",
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <GroupsStack.Screen
        name="GroupSettings"
        component={GroupSettingsScreen}
        options={{
          title: "Group Settings",
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <GroupsStack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          title: "Create Group",
          ...TransitionPresets.ModalSlideFromBottomIOS,
        }}
      />
      <GroupsStack.Screen
        name="CreateExpense"
        component={CreateExpenseScreen}
        options={{
          title: "Add Expense",
          presentation: "modal",
          headerShown: false,
          ...TransitionPresets.ModalSlideFromBottomIOS,
        }}
      />
      <GroupsStack.Screen
        name="Settlements"
        component={SettlementsScreen}
        options={{
          title: "Settlements",
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <GroupsStack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{
          title: "Transaction Details",
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
    </GroupsStack.Navigator>
  );
}

function ExpensesNavigator() {
  const { colors } = useTheme();

  return (
    <ExpensesStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
      }}
    >
      <ExpensesStack.Screen
        name="ExpensesList"
        component={ExpensesScreen}
        options={{
          title: "Expenses",
          ...TransitionPresets.FadeFromBottomAndroid,
        }}
      />
      <ExpensesStack.Screen
        name="CreateExpense"
        component={CreateExpenseScreen}
        options={{
          title: "Add Expense",
          presentation: "modal",
          headerShown: false,
          ...TransitionPresets.ModalSlideFromBottomIOS,
        }}
      />
      <ExpensesStack.Screen
        name="ExpenseDetails"
        component={ExpenseDetailsScreen}
        options={{
          title: "Expense Details",
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
    </ExpensesStack.Navigator>
  );
}

function FriendsNavigator() {
  const { colors } = useTheme();

  return (
    <FriendsStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
      }}
    >
      <FriendsStack.Screen
        name="FriendsList"
        component={FriendsScreen}
        options={{
          title: "Friends",
          ...TransitionPresets.FadeFromBottomAndroid,
        }}
      />
      <FriendsStack.Screen
        name="AddFriend"
        component={AddFriendScreen}
        options={{
          title: "Add Friend",
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: "600",
          },
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
    </FriendsStack.Navigator>
  );
}

function ProfileNavigator() {
  const { colors } = useTheme();

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: true,
        cardStyle: { backgroundColor: colors.background },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: "Edit Profile",
          presentation: "modal",
          ...TransitionPresets.ModalSlideFromBottomIOS,
        }}
      />
    </ProfileStack.Navigator>
  );
}

function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <MainTab.Screen
        name="Groups"
        component={GroupsNavigator}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name="people-outline"
              size={size}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <MainTab.Screen
        name="Expenses"
        component={ExpensesNavigator}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name="receipt-outline"
              size={size}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <MainTab.Screen
        name="Friends"
        component={FriendsNavigator}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name="person-add-outline"
              size={size}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </MainTab.Navigator>
  );
}

function MainNavigator() {
  const { colors } = useTheme();

  // Fixed: Use direct tab navigator with WebLayout wrapper for web
  if (Platform.OS === 'web') {
    return (
      <WebLayout title="Home">
        <MainTabNavigator />
      </WebLayout>
    );
  }

  // Mobile drawer navigation
  return (
    <MainDrawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        drawerStyle: {
          backgroundColor: colors.background,
          width: 280,
        },
        drawerActiveBackgroundColor: colors.primaryLight,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerType: 'front', // Changed to 'front' so drawer overlays content
      }}
      initialRouteName="MainTabs"
    >
      <MainDrawer.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "Groups";
          return {
            headerTitle: routeName,
          };
        }}
      />
      <MainDrawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: "Profile",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <MainDrawer.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerTitle: "Edit Profile",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <MainDrawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </MainDrawer.Navigator>
  );
}

export default function AppNavigator() {
  const { colors, colorScheme } = useTheme();
  const { isAuthenticated, isInitialized, isLoading } = useSelector(
    (state: RootState) => state.auth,
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

  // Show loading screen while checking authentication status
  if (!isInitialized || isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: colors.text,
            marginTop: 16,
          }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  const MainNavigatorWithDrawer = (props: any) => {
    return <MainNavigator />;
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainNavigatorWithDrawer} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
