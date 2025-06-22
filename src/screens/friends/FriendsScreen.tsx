import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
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

  const [activeTab, setActiveTab] = React.useState<"friends" | "sent">(
    "friends"
  );
  const [showReceivedRequestsModal, setShowReceivedRequestsModal] =
    React.useState(false);

  // Debug modal state
  console.log("Modal state:", showReceivedRequestsModal);

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
    floatingRequestButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.full,
      position: "absolute",
      bottom: spacing.lg, // Same bottom position as the FAB
      left: spacing.lg, // Align to left
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      ...shadows.medium,
      zIndex: 9999,
      elevation: 10, // For Android
    },
    floatingRequestText: {
      ...typography.bodySmall,
      color: "white",
      fontWeight: "600",
    },
    floatingRequestBadge: {
      backgroundColor: colors.error,
      borderRadius: borderRadius.full,
      minWidth: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: spacing.xs,
    },
    floatingRequestBadgeText: {
      ...typography.caption,
      color: "white",
      fontWeight: "700",
      fontSize: 10,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10000,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: 0,
      marginHorizontal: spacing.lg,
      width: "90%",
      maxHeight: "70%",
      minHeight: 300,
      ...shadows.large,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      ...typography.h3,
      color: colors.text,
      fontWeight: "700",
    },
    modalCloseButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: colors.inputBackground,
      justifyContent: "center",
      alignItems: "center",
    },
    modalBody: {
      flex: 1,
      padding: spacing.lg,
      paddingTop: spacing.md,
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
      // Close modal if no more requests
      if (receivedRequests.length <= 1) {
        setShowReceivedRequestsModal(false);
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

  const handleViewReceivedRequests = () => {
    console.log("Friend request button clicked!", receivedRequests.length);
    console.log("Current modal state:", showReceivedRequestsModal);

    if (receivedRequests.length === 0) {
      Alert.alert("Debug", "No received requests found");
    }

    console.log("Setting modal to true...");
    setShowReceivedRequestsModal(true);

    // Add a timeout to check if state was set
    setTimeout(() => {
      console.log("Modal state after setting:", showReceivedRequestsModal);
    }, 100);
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
    const requesterName = item?.requester_name || "Unknown User";
    const requesterEmail = item?.requester_email || "No email";
    const requestDate = item?.requested_at || item?.created_at;

    return (
      <Card>
        <Card.Header
          title={`${requesterName}`}
          subtitle={`${requesterEmail} • ${
            requestDate ? new Date(requestDate).toLocaleDateString() : ""
          }`}
          icon="person-add"
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
    const addresseeName = item?.addressee_name || "Unknown User";
    const addresseeEmail = item?.addressee_email || "No email";
    const requestDate = item?.requested_at || item?.created_at;

    return (
      <Card>
        <Card.Header
          title={`${addresseeName}`}
          subtitle={`${addresseeEmail} • ${
            requestDate ? new Date(requestDate).toLocaleDateString() : "No date"
          }`}
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

      {/* Floating Button for Received Requests */}
      {receivedRequests.length > 0 && (
        <TouchableOpacity
          style={styles.floatingRequestButton}
          onPress={() => {
            console.log("Setting modal to true directly");
            setShowReceivedRequestsModal((prev) => {
              console.log("Previous state:", prev);
              return true;
            });
          }}
        >
          <Ionicons name="mail" size={20} color="white" />
          <Text style={styles.floatingRequestText}>Friend Requests</Text>
          <View style={styles.floatingRequestBadge}>
            <Text style={styles.floatingRequestBadgeText}>
              {receivedRequests.length}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Floating Action Button */}
      <AnimatedFAB
        iconName="person-add"
        onPress={() => navigation.navigate("AddFriend")}
      />

      {/* Received Requests Modal */}
      {showReceivedRequestsModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Friend Requests ({receivedRequests.length})
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowReceivedRequestsModal(false)}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {receivedRequests.filter((item) => item && item.id).length ===
              0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <EmptyState
                    iconName="mail-outline"
                    title="No Pending Requests"
                    subtitle="You'll see friend requests here when they arrive"
                  />
                </View>
              ) : (
                <FlatList
                  data={receivedRequests.filter((item) => item && item.id)}
                  renderItem={renderReceivedRequestItem}
                  keyExtractor={(item, index) =>
                    item?.id || `received-${index}`
                  }
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    gap: spacing.md,
                    paddingBottom: spacing.md,
                  }}
                />
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
