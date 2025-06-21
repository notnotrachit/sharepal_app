import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { AppDispatch, RootState } from "../../store";
import {
  fetchFriends,
  fetchReceivedRequests,
  fetchSentRequests,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
} from "../../store/slices/friendsSlice";
import { FriendsStackParamList } from "../../navigation/AppNavigator";
import { User, FriendRequest } from "../../types/api";
import { useTheme } from "../../constants/ThemeProvider";
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
  const [showAddFriend, setShowAddFriend] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.md,
    },
    title: {
      ...typography.h2,
      color: colors.text,
    },
    fab: {
      ...components.fab,
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
    friendCard: {
      ...components.card,
      marginBottom: spacing.md,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    friendInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatarContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.md,
    },
    avatarText: {
      ...typography.body,
      fontWeight: "700",
      color: colors.text,
    },
    friendDetails: {
      flex: 1,
    },
    friendName: {
      ...typography.h4,
      color: colors.text,
      marginBottom: 2,
    },
    friendEmail: {
      ...typography.bodySmall,
      color: colors.textSecondary,
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
    removeButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
    },
    requestCard: {
      ...components.card,
      marginBottom: spacing.md,
    },
    requestHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    requestInfo: {
      flex: 1,
    },
    requestTitle: {
      ...typography.h4,
      color: colors.text,
      marginBottom: 2,
    },
    requestDate: {
      ...typography.caption,
      color: colors.textMuted,
    },
    requestActions: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    acceptButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.success,
      justifyContent: "center",
      alignItems: "center",
    },
    rejectButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.error,
      justifyContent: "center",
      alignItems: "center",
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
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    emptyCard: {
      ...components.card,
      alignItems: "center",
      padding: spacing.xl,
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      ...typography.h3,
      color: colors.text,
      textAlign: "center",
      marginBottom: spacing.sm,
    },
    emptySubtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: spacing.lg,
      lineHeight: 22,
    },
    createFirstButton: {
      ...components.button.primary,
    },
    createFirstButtonText: {
      ...typography.button,
      color: colors.text,
      textAlign: "center",
    },
    modal: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      margin: spacing.xl,
      width: "80%",
      ...shadows.large,
    },
    modalTitle: {
      ...typography.h3,
      color: colors.text,
      textAlign: "center",
      marginBottom: spacing.lg,
    },
    emailInput: {
      ...components.input,
      marginBottom: spacing.lg,
    },
    modalActions: {
      flexDirection: "row",
      gap: spacing.md,
    },
    cancelButton: {
      ...components.button.secondary,
      flex: 1,
    },
    cancelButtonText: {
      ...typography.button,
      color: colors.primary,
      textAlign: "center",
    },
    sendButton: {
      ...components.button.primary,
      flex: 1,
    },
    sendButtonText: {
      ...typography.button,
      color: colors.text,
      textAlign: "center",
    },
  });

  const getAvatarColor = (name: string) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
      "#82E0AA",
      "#F8C471",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    loadFriendsData();
  }, []);

  const loadFriendsData = () => {
    dispatch(fetchFriends());
    dispatch(fetchReceivedRequests());
    dispatch(fetchSentRequests());
  };

  const handleSendFriendRequest = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    try {
      await dispatch(sendFriendRequest({ email: email.trim() })).unwrap();
      setEmail("");
      setShowAddFriend(false);
      Alert.alert("Success", "Friend request sent!");
    } catch (error: any) {
      Alert.alert("Error", error);
    }
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
    const avatarColor = getAvatarColor(friendName);
    const initials = getInitials(friendName);

    return (
      <View style={styles.friendCard}>
        <View style={styles.cardHeader}>
          <View style={styles.friendInfo}>
            <View
              style={[styles.avatarContainer, { backgroundColor: avatarColor }]}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.friendDetails}>
              <Text style={styles.friendName}>{friendName}</Text>
              <Text style={styles.friendEmail}>{friendEmail}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFriend(item)}
          >
            <Ionicons
              name="person-remove-outline"
              size={20}
              color={colors.error}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.statusText}>Friends</Text>
        </View>
      </View>
    );
  };

  const renderReceivedRequestItem = ({ item }: { item: FriendRequest }) => {
    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.requestInfo}>
            <Text style={styles.requestTitle}>Friend Request Received</Text>
            <Text style={styles.requestDate}>
              {item?.created_at
                ? new Date(item.created_at).toLocaleDateString()
                : "No date"}
            </Text>
          </View>
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleRespondToRequest(item?.id || "", true)}
            >
              <Ionicons name="checkmark" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleRespondToRequest(item?.id || "", false)}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderSentRequestItem = ({ item }: { item: FriendRequest }) => {
    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.requestInfo}>
            <Text style={styles.requestTitle}>Friend Request Sent</Text>
            <Text style={styles.requestDate}>
              {item?.created_at
                ? new Date(item.created_at).toLocaleDateString()
                : "No date"}
            </Text>
          </View>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "friends":
        return friends.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="people-outline"
                  size={40}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Friends Yet</Text>
              <Text style={styles.emptySubtitle}>
                Send friend requests to start splitting expenses
              </Text>
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => setShowAddFriend(true)}
              >
                <Text style={styles.createFirstButtonText}>
                  Add Your First Friend
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
          <View style={styles.emptyState}>
            <View style={styles.emptyCard}>
              <Ionicons name="mail-outline" size={64} color={colors.primary} />
              <Text style={styles.emptyTitle}>No Pending Requests</Text>
            </View>
          </View>
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
          <View style={styles.emptyState}>
            <View style={styles.emptyCard}>
              <Ionicons
                name="paper-plane-outline"
                size={64}
                color={colors.primary}
              />
              <Text style={styles.emptyTitle}>No Sent Requests</Text>
            </View>
          </View>
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

      {/* Add Friend Modal */}
      {showAddFriend && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Friend</Text>
            <TextInput
              style={styles.emailInput}
              placeholder="Enter friend's email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddFriend(false);
                  setEmail("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendFriendRequest}
              >
                <Text style={styles.sendButtonText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddFriend(true)}
      >
        <Ionicons name="person-add" size={28} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}
