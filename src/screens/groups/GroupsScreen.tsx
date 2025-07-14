import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import PullToRefresh from "../../components/PullToRefresh";
import EmptyStateIllustration from "../../components/EmptyStateIllustration";
import SwipeableRow from "../../components/SwipeableRow";
import ListContainer from "../../components/ListContainer";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../constants/theme";

const { width } = Dimensions.get('window');

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
    fab: {
      ...components.fab,
      backgroundColor: colors.primary,
      ...shadows.large,
    },
    groupCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      overflow: 'hidden',
      ...shadows.medium,
    },
    groupCardGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
    },
    cardContent: {
      padding: spacing.lg,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    groupIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.md,
      ...shadows.small,
    },
    groupInfo: {
      flex: 1,
    },
    groupName: {
      ...typography.h3,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    groupDescription: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    groupStats: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${colors.primary}10`,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.lg,
    },
    statIcon: {
      marginRight: spacing.xs,
    },
    statText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    currencyBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.lg,
      ...shadows.small,
    },
    currencyText: {
      ...typography.caption,
      color: colors.surface,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    memberAvatars: {
      flexDirection: 'row',
      marginLeft: spacing.sm,
    },
    memberAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.textSecondary,
      marginLeft: -spacing.xs,
      borderWidth: 2,
      borderColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    memberAvatarText: {
      ...typography.caption,
      color: colors.surface,
      fontSize: 10,
      fontWeight: '600',
    },
    moreMembers: {
      backgroundColor: colors.primary,
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

  const handleRefresh = async () => {
    await dispatch(fetchGroups());
  };

  const handleLeaveGroup = (group: any) => {
    Alert.alert(
      "Leave Group",
      `Are you sure you want to leave "${group.name}"? You won't be able to see group expenses anymore.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            // Implement leave group logic
            Alert.alert("Pending", "Leave Group logic will be implemented soon.");
          },
        },
      ]
    );
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
      "fitness",
      "game-controller",
    ];
    const gradients = [
      ["#FF6B6B", "#FF8E8E"],
      ["#4ECDC4", "#6EDDD6"],
      ["#45B7D1", "#67C3DB"],
      ["#FFA07A", "#FFB399"],
      ["#98D8C8", "#B0E0D3"],
      ["#F7DC6F", "#F9E79F"],
      ["#BB8FCE", "#C8A2C8"],
      ["#85C1E9", "#A3D5F1"],
      ["#FF9F43", "#FFA726"],
      ["#6C5CE7", "#A29BFE"],
    ];
    const index = groupName.length % icons.length;
    return { icon: icons[index], gradient: gradients[index] };
  };

  const renderMemberAvatars = (members: any[]) => {
    const maxVisible = 3;
    const visibleMembers = members.slice(0, maxVisible);
    const remainingCount = Math.max(0, members.length - maxVisible);

    return (
      <View style={styles.memberAvatars}>
        {visibleMembers.map((member, index) => (
          <View key={index} style={styles.memberAvatar}>
            <Text style={styles.memberAvatarText}>
              {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
        ))}
        {remainingCount > 0 && (
          <View style={[styles.memberAvatar, styles.moreMembers]}>
            <Text style={styles.memberAvatarText}>+{remainingCount}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderGroupItem = ({ item }: { item: Group }) => {
    const { icon, gradient } = getGroupIcon(item.name);

    return (
      <SwipeableRow
        onPress={() => handleGroupPress(item)}
        rightActions={[
          {
            text: "Settings",
            icon: "settings-sharp",
            color: colors.text,
            backgroundColor: colors.surface,
            onPress: () =>
              navigation.navigate("GroupSettings", { groupId: item.id }),
          },
          {
            text: "Leave",
            icon: "exit-outline",
            color: colors.text,
            backgroundColor: colors.surface,
            onPress: () => handleLeaveGroup(item),
          },
        ]}
      >
        <View style={styles.groupCard}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.groupCardGradient}
          />
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.groupIcon}
              >
                <Ionicons name={icon as any} size={28} color="#fff" />
              </LinearGradient>
              
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.groupDescription}>{item.description}</Text>
                )}
              </View>
            </View>

            <View style={styles.groupStats}>
              <View style={styles.statItem}>
                <Ionicons 
                  name="people" 
                  size={14} 
                  color={colors.primary} 
                  style={styles.statIcon}
                />
                <Text style={styles.statText}>
                  {item.members?.length || 0}
                </Text>
                {item.members && item.members.length > 0 && 
                  renderMemberAvatars(item.members)
                }
              </View>
              
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyText}>{item.currency}</Text>
              </View>
            </View>
          </View>
        </View>
      </SwipeableRow>
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
            subtitle="Create your first group to start splitting expenses with friends and family"
            buttonText="Create Your First Group"
            onButtonPress={() => navigation.navigate("CreateGroup")}
          />
        ) : (
          <FlatList
            data={groups}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={loadGroups}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: spacing.lg,
              paddingBottom: spacing.xxl * 2,
            }}
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
