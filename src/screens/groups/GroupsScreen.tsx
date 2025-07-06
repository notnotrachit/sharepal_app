import React, { useEffect, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AppDispatch, RootState } from "../../store";
import {
  fetchGroups,
  deleteGroup,
  clearGroupData,
  clearCurrentTransaction,
  clearNavigationState,
} from "../../store/slices/groupsSlice";
import { GroupsStackParamList } from "../../navigation/AppNavigator";
import { Group } from "../../types/api";
import { useTheme } from "../../contexts/ThemeContext";
import AnimatedScreen from "../../components/AnimatedScreen";
import AnimatedFAB from "../../components/AnimatedFAB";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import GroupListSkeleton from "../../components/skeletons/GroupListSkeleton";
import ListContainer from "../../components/ListContainer";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../constants/theme";

type GroupsScreenNavigationProp = StackNavigationProp<
  GroupsStackParamList,
  "GroupsList"
>;

interface Props {
  navigation: GroupsScreenNavigationProp;
}

export default function GroupsScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { colors, components, colorScheme } = useTheme();
  const { groups, isLoading, error } = useSelector(
    (state: RootState) => state.groups
  );


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.md,
    },
    headerTitle: {
      ...typography.h2,
      color: colors.text,
    },
    fab: {
      ...components.fab,
    },
    groupCard: {
      ...components.card,
      marginBottom: spacing.md,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    groupIconContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    groupIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.md,
    },
    groupInfo: {
      flex: 1,
    },
    groupName: {
      ...typography.h4,
      color: colors.text,
      marginBottom: 2,
    },
    groupDescription: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    deleteButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
    },
    groupStats: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: spacing.sm,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    statText: {
      ...typography.caption,
      color: colors.textMuted,
      marginLeft: spacing.xs,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    currencyBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    currencyText: {
      ...typography.caption,
      color: colors.text,
      fontWeight: "600",
    },
  });

  // Focus effect to clear stale state when returning to groups list
  useFocusEffect(
    useCallback(() => {
      // Clear any stale group-specific state when returning to groups list
      dispatch(clearCurrentTransaction());
      dispatch(clearNavigationState());

      return () => {
        // Clean up when leaving groups screen
        dispatch(clearNavigationState());
      };
    }, [])
  );

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {}, [groups, isLoading, error]);

  const loadGroups = () => {
    dispatch(fetchGroups());
  };

  const handleGroupPress = (group: Group) => {
    // Clear any stale state before navigating to group details
    dispatch(clearGroupData());
    dispatch(clearCurrentTransaction());
    dispatch(clearNavigationState());
    navigation.navigate("GroupDetails", { groupId: group.id });
  };

  const handleDeleteGroup = (groupId: string) => {
    Alert.alert(
      "Delete Group",
      "Are you sure you want to delete this group? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => dispatch(deleteGroup(groupId)),
        },
      ]
    );
  };

  const getGroupIcon = (groupName: string) => {
    const icons = [
      "people",
      "home",
      "car",
      "restaurant",
      "airplane",
      "school",
      "business",
      "heart",
    ];
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
    ];
    const index = groupName.length % icons.length;
    return { icon: icons[index], color: colors[index] };
  };

  const renderGroupItem = ({ item }: { item: Group }) => {
    const { icon, color } = getGroupIcon(item.name);

    return (
      <TouchableOpacity
        style={styles.groupCard}
        onPress={() => handleGroupPress(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.groupIconContainer}>
            <View style={[styles.groupIcon, { backgroundColor: color }]}>
              <Ionicons name={icon as any} size={24} color="#fff" />
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{item.name}</Text>
              {item.description && (
                <Text style={styles.groupDescription}>{item.description}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteGroup(item.id)}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.groupStats}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={16} color={colors.textMuted} />
            <Text style={styles.statText}>
              {item.members?.length || 0} members
            </Text>
          </View>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyText}>{item.currency}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <AnimatedScreen animationType="slideUp" duration={400}>
      <View style={styles.container}>
        {isLoading && groups.length === 0 ? (
          <GroupListSkeleton count={5} />
        ) : groups.length === 0 ? (
          <EmptyState
            iconName="people-outline"
            title="No Groups Yet"
            subtitle="Create your first group to start splitting expenses with friends"
            buttonText="Create Your First Group"
            onButtonPress={() => navigation.navigate("CreateGroup")}
          />
        ) : (
          <ListContainer
            data={groups}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.id}
            refreshing={isLoading}
            onRefresh={loadGroups}
          />
        )}

        {/* Floating Action Button */}
        <AnimatedFAB
          style={styles.fab}
          iconName="add"
          iconSize={28}
          iconColor={colors.surface}
          onPress={() => navigation.navigate("CreateGroup")}
        />
      </View>
    </AnimatedScreen>
  );
}
