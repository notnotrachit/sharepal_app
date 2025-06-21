import React, { useEffect } from "react";
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
  fetchFriends,
  fetchReceivedRequests,
  fetchSentRequests,
  respondToFriendRequest,
  removeFriend,
} from "../../store/slices/friendsSlice";
import { FriendsStackParamList } from "../../navigation/AppNavigator";
import { User, FriendRequest } from "../../types/api";
import { useTheme } from "../../constants/ThemeProvider";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import SecondaryButton from "../../components/SecondaryButton";
import Card from "../../components/Card";
import AnimatedFAB from "../../components/AnimatedFAB";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../constants/theme";

type FriendsScreenNavigationProp = StackNavigationProp<
  FriendsStackParamList,
  "FriendsList"
>;

interface Props {
  navigation: FriendsScreenNavigationProp;
}

export default function FriendsScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { colors, components } = useTheme();
  const { friends, receivedRequests, sentRequests, isLoading } = useSelector(
    (state: RootState) => state.friends
  );

  const [activeTab, setActiveTab] = React.useState<
    "friends" | "received" | "sent"
  >("friends");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tabs: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.md,
      alignItems: "center",
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    activeTab: {
      borderBottomColor: colors.primary,
    },
    tabText: {
      ...typography.bodySmall,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    activeTabText: {
      ...typography.bodySmall,
      color: colors.primary,
      fontWeight: "700",
    },
    content: {
      flex: 1,
    },
    listContainer: {
      padding: spacing.lg,
      paddingBottom: 100, // Account for FAB
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
    },
    statusText: {
      ...typography.caption,
      color: colors.success,
      marginLeft: spacing.xs,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    requestActions: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    pendingBadge: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    pendingText: {
      ...typography.caption,
      color: colors.warning,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
  });

  useEffect(() => {
    loadFriendsData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadFriendsData();
    }, [])
  );

  const loadFriendsData = () => {
    dispatch(fetchFriends());
    dispatch(fetchReceivedRequests());
    dispatch(fetchSentRequests());
  };

  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    try {
      await dispatch(
        respondToFriendRequest({ requestId, response: { accept } })
      ).unwrap();
      if (accept) {
        dispatch(fetchFriends()); // Refresh friends list
      }
    } catch (error: any) {
      Alert.alert("Error", error);
    }
  };

  const handleRemoveFriend = (friend: User) => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${friend.name} from your friends?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => dispatch(removeFriend(friend.id)),
        },
      ]
    );
  };

  const renderFriendItem = ({ item }: { item: User }) => {
    const friendName = item?.name || "No name";
    const friendEmail = item?.email || "No email";

    return (
      <Card>
        <Card.Header
          title={friendName}
          subtitle={friendEmail}
          icon="person"
          rightElement={
            <SecondaryButton
              title=""
              icon="person-remove-outline"
              variant="ghost"
              size="small"
              onPress={() => handleRemoveFriend(item)}
            />
          }
        />
        <Card.Content>
          <View style={styles.statusBadge}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.success}
            />
            <Text style={styles.statusText}>Friends</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderReceivedRequestItem = ({ item }: { item: FriendRequest }) => {
    return (
      <Card>
        <Card.Header
          title="Friend Request Received"
          subtitle={
            item?.created_at
              ? new Date(item.created_at).toLocaleDateString()
              : "No date"
          }
          icon="mail"
          rightElement={
            <View style={styles.requestActions}>
              <SecondaryButton
                title=""
                icon="checkmark"
                variant="success"
                size="small"
                onPress={() => handleRespondToRequest(item?.id || "", true)}
              />
              <SecondaryButton
                title=""
                icon="close"
                variant="error"
                size="small"
                onPress={() => handleRespondToRequest(item?.id || "", false)}
              />
            </View>
          }
        />
      </Card>
    );
  };

  const renderSentRequestItem = ({ item }: { item: FriendRequest }) => {
    return (
      <Card>
        <Card.Header
          title="Friend Request Sent"
          subtitle={
            item?.created_at
              ? new Date(item.created_at).toLocaleDateString()
              : "No date"
          }
          icon="paper-plane"
          rightElement={
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          }
        />
      </Card>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "friends":
        return friends.length === 0 ? (
          <EmptyState
            iconName="people-outline"
            title="No Friends Yet"
            subtitle="Send friend requests to start splitting expenses"
            buttonText="Add Your First Friend"
            onButtonPress={() => navigation.navigate("AddFriend")}
          />
        ) : (
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item, index) => item?.id || `friend-${index}`}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={loadFriendsData}
              />
            }
          />
        );

      case "received":
        const validReceivedRequests = receivedRequests.filter(
          (item) => item && item.id
        );
        return validReceivedRequests.length === 0 ? (
          <EmptyState
            iconName="mail-outline"
            title="No Pending Requests"
            subtitle="You'll see friend requests here when they arrive"
          />
        ) : (
          <FlatList
            data={validReceivedRequests}
            renderItem={renderReceivedRequestItem}
            keyExtractor={(item, index) => item?.id || `received-${index}`}
            contentContainerStyle={styles.listContainer}
          />
        );

      case "sent":
        const validSentRequests = sentRequests.filter(
          (item) => item && item.id
        );
        return validSentRequests.length === 0 ? (
          <EmptyState
            iconName="paper-plane-outline"
            title="No Sent Requests"
            subtitle="Friend requests you send will appear here"
          />
        ) : (
          <FlatList
            data={validSentRequests}
            renderItem={renderSentRequestItem}
            keyExtractor={(item, index) => item?.id || `sent-${index}`}
            contentContainerStyle={styles.listContainer}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "friends" && styles.activeTab]}
          onPress={() => setActiveTab("friends")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "friends" && styles.activeTabText,
            ]}
          >
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "received" && styles.activeTab]}
          onPress={() => setActiveTab("received")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "received" && styles.activeTabText,
            ]}
          >
            Received ({receivedRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "sent" && styles.activeTab]}
          onPress={() => setActiveTab("sent")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sent" && styles.activeTabText,
            ]}
          >
            Sent ({sentRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>{renderTabContent()}</View>

      {/* Floating Action Button */}
      <AnimatedFAB
        iconName="person-add"
        onPress={() => navigation.navigate("AddFriend")}
      />
    </View>
  );
}
