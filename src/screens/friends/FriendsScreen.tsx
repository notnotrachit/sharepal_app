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

type FriendsScreenNavigationProp = StackNavigationProp<
  FriendsStackParamList,
  "FriendsList"
>;

interface Props {
  navigation: FriendsScreenNavigationProp;
}

export default function FriendsScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { friends, receivedRequests, sentRequests, isLoading } = useSelector(
    (state: RootState) => state.friends
  );

  const [activeTab, setActiveTab] = React.useState<
    "friends" | "received" | "sent"
  >("friends");
  const [showAddFriend, setShowAddFriend] = React.useState(false);
  const [email, setEmail] = React.useState("");

  useEffect(() => {
    console.log("FriendsScreen: Component mounted");
    loadFriendsData();
  }, []);

  useEffect(() => {
    console.log("FriendsScreen: State changed:", {
      friends: friends?.length || 0,
      receivedRequests: receivedRequests?.length || 0,
      sentRequests: sentRequests?.length || 0,
      isLoading,
    });
    console.log("FriendsScreen: Friends data:", friends);
    console.log("FriendsScreen: Received requests data:", receivedRequests);
    console.log("FriendsScreen: Sent requests data:", sentRequests);
  }, [friends, receivedRequests, sentRequests, isLoading]);

  useEffect(() => {
    console.log("FriendsScreen: Friends state changed:", {
      friends,
      receivedRequests,
      sentRequests,
      friendsCount: friends?.length || 0,
      receivedCount: receivedRequests?.length || 0,
      sentCount: sentRequests?.length || 0,
      isLoading,
    });
  }, [friends, receivedRequests, sentRequests, isLoading]);

  const loadFriendsData = () => {
    console.log("FriendsScreen: Loading friends data...");
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
    console.log("🔍 Rendering friend item:", JSON.stringify(item, null, 2));
    return (
      <View style={styles.friendItem}>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item?.name || "No name"}</Text>
          <Text style={styles.friendEmail}>{item?.email || "No email"}</Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFriend(item)}
        >
          <Ionicons name="person-remove-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderReceivedRequestItem = ({ item }: { item: FriendRequest }) => {
    console.log(
      "🔍 Rendering received request item:",
      JSON.stringify(item, null, 2)
    );
    return (
      <View style={styles.requestItem}>
        <View style={styles.requestInfo}>
          <Text style={styles.requestText}>Friend request received</Text>
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
            <Ionicons name="checkmark" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleRespondToRequest(item?.id || "", false)}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSentRequestItem = ({ item }: { item: FriendRequest }) => {
    console.log(
      "🔍 Rendering sent request item:",
      JSON.stringify(item, null, 2)
    );
    return (
      <View style={styles.requestItem}>
        <View style={styles.requestInfo}>
          <Text style={styles.requestText}>Friend request sent</Text>
          <Text style={styles.requestDate}>
            {item?.created_at
              ? new Date(item.created_at).toLocaleDateString()
              : "No date"}
          </Text>
        </View>
        <Text style={styles.pendingText}>Pending</Text>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "friends":
        return friends.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Friends Yet</Text>
            <Text style={styles.emptySubtitle}>
              Send friend requests to start splitting expenses
            </Text>
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
            <Ionicons name="mail-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Pending Requests</Text>
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
            <Ionicons name="paper-plane-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Sent Requests</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddFriend(true)}
        >
          <Ionicons name="person-add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  friendItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  friendEmail: {
    fontSize: 14,
    color: "#666",
  },
  removeButton: {
    padding: 8,
  },
  requestItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestInfo: {
    flex: 1,
  },
  requestText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: "#666",
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "#F44336",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  pendingText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  modal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    margin: 32,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  emailInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  sendButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
