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
  Animated,
  Dimensions,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
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
import { useTheme } from "../../contexts/ThemeContext";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import FriendsListSkeleton from "../../components/skeletons/FriendsListSkeleton";
import PullToRefresh from "../../components/PullToRefresh";
import EmptyStateIllustration from "../../components/EmptyStateIllustration";
import SwipeableRow from "../../components/SwipeableRow";
import SecondaryButton from "../../components/SecondaryButton";
import Card from "../../components/Card";
import AnimatedFAB from "../../components/AnimatedFAB";
import UserAvatar from "../../components/UserAvatar";
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

  // Animation and gesture handling for swipe
  const screenWidth = Dimensions.get("window").width;
  const translateX = React.useRef(new Animated.Value(0)).current;
  const currentIndex = React.useRef(0);

  // Update translateX when activeTab changes
  React.useEffect(() => {
    const toValue = activeTab === "friends" ? 0 : -screenWidth;
    currentIndex.current = activeTab === "friends" ? 0 : 1;

    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [activeTab, screenWidth]);

  const onGestureEvent = (event: any) => {
    const { translationX } = event.nativeEvent;
    const currentTabIndex = currentIndex.current;

    // Calculate the base position for current tab
    const basePosition = currentTabIndex === 0 ? 0 : -screenWidth;

    // Calculate the new position with translation
    let newPosition = basePosition + translationX;

    // Clamp the position to prevent over-scrolling
    // Position range: 0 (friends tab) to -screenWidth (sent tab)
    newPosition = Math.max(Math.min(newPosition, 0), -screenWidth);

    translateX.setValue(newPosition);
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      const threshold = screenWidth * 0.3; // 30% of screen width
      const velocity = velocityX;

      let shouldSwipe = false;
      let newIndex = currentIndex.current;

      // Determine if we should swipe based on distance or velocity
      if (Math.abs(translationX) > threshold || Math.abs(velocity) > 500) {
        if (translationX < 0 && velocity < 0) {
          // Swiping left (to "sent" tab)
          newIndex = 1;
          // Only allow swipe if not already at the last tab
          if (currentIndex.current < 1) {
            shouldSwipe = true;
          }
        } else if (translationX > 0 && velocity > 0) {
          // Swiping right (to "friends" tab)
          newIndex = 0;
          // Only allow swipe if not already at the first tab
          if (currentIndex.current > 0) {
            shouldSwipe = true;
          }
        }
      }

      if (shouldSwipe && newIndex !== currentIndex.current) {
        // Update the active tab
        setActiveTab(newIndex === 0 ? "friends" : "sent");
      } else {
        // Snap back to current position
        const toValue = currentIndex.current === 0 ? 0 : -screenWidth;
        Animated.spring(translateX, {
          toValue,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  // Debug modal state

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
    swipeContainer: {
      flex: 1,
      flexDirection: "row",
      width: screenWidth * 2, // Double width to fit both tabs
    },
    tabPage: {
      width: screenWidth,
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

    if (receivedRequests.length === 0) {
      Alert.alert("Debug", "No received requests found");
    }

    setShowReceivedRequestsModal(true);

    // Add a timeout to check if state was set
    setTimeout(() => {
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
          leftElement={<UserAvatar user={item} size="medium" />}
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

    // Create a user object for the avatar (friend requests don't have full user objects)
    const requesterUser = {
      _id: item?.requester_id || "",
      name: requesterName,
      email: requesterEmail,
      role: "user",
      mail_verified: false,
      fcm_token: "",
      profile_pic_url: undefined, // Friend requests typically don't include profile pics
    };

    return (
      <Card>
        <Card.Header
          title={`${requesterName}`}
          subtitle={`${requesterEmail} • ${
            requestDate ? new Date(requestDate).toLocaleDateString() : ""
          }`}
          leftElement={<UserAvatar user={requesterUser} size="medium" fallbackIcon="person-add" />}
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

    // Create a user object for the avatar
    const addresseeUser = {
      _id: item?.addressee_id || "",
      name: addresseeName,
      email: addresseeEmail,
      role: "user",
      mail_verified: false,
      fcm_token: "",
      profile_pic_url: undefined,
    };

    return (
      <Card>
        <Card.Header
          title={`${addresseeName}`}
          subtitle={`${addresseeEmail} • ${
            requestDate ? new Date(requestDate).toLocaleDateString() : "No date"
          }`}
          leftElement={<UserAvatar user={addresseeUser} size="medium" fallbackIcon="paper-plane" />}
          rightElement={
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          }
        />
      </Card>
    );
  };

  const renderFriendsTab = () => {
    return (
      <View style={styles.tabPage}>
        {isLoading && friends.length === 0 ? (
          <FriendsListSkeleton count={6} />
        ) : friends.length === 0 ? (
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
        )}
      </View>
    );
  };

  const renderSentTab = () => {
    const validSentRequests = sentRequests.filter((item) => item && item.id);
    return (
      <View style={styles.tabPage}>
        {isLoading && validSentRequests.length === 0 ? (
          <FriendsListSkeleton count={3} />
        ) : validSentRequests.length === 0 ? (
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
        )}
      </View>
    );
  };

  const renderTabContent = () => {
    return (
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-30, 30]}
        shouldCancelWhenOutside={true}
      >
        <Animated.View
          style={[
            styles.swipeContainer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {renderFriendsTab()}
          {renderSentTab()}
        </Animated.View>
      </PanGestureHandler>
    );
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
            setShowReceivedRequestsModal((prev) => {
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
              {isLoading &&
              receivedRequests.filter((item) => item && item.id).length ===
                0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <LoadingState message="Loading requests..." />
                </View>
              ) : receivedRequests.filter((item) => item && item.id).length ===
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
