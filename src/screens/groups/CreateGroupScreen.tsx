import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { AppDispatch, RootState } from "../../store";
import { createGroup } from "../../store/slices/groupsSlice";
import { fetchFriends } from "../../store/slices/friendsSlice";
import { GroupsStackParamList } from "../../navigation/AppNavigator";
import { CURRENCIES } from "../../constants/api";
import { User } from "../../types/api";

type CreateGroupScreenNavigationProp = StackNavigationProp<
  GroupsStackParamList,
  "CreateGroup"
>;

interface Props {
  navigation: CreateGroupScreenNavigationProp;
}

export default function CreateGroupScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.groups);
  const { friends } = useSelector((state: RootState) => state.friends);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    currency: "USD",
  });

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  React.useEffect(() => {
    dispatch(fetchFriends());
  }, []);

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    try {
      await dispatch(
        createGroup({
          name: formData.name.trim(),
          description: formData.description.trim(),
          currency: formData.currency,
          member_ids: selectedMembers,
        })
      ).unwrap();

      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const renderCurrencyItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setFormData((prev) => ({ ...prev, currency: item }));
        setShowCurrencyModal(false);
      }}
    >
      <Text style={styles.modalItemText}>{item}</Text>
      {formData.currency === item && (
        <Ionicons name="checkmark" size={20} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  const renderMemberItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => toggleMemberSelection(item.id)}
    >
      <Text style={styles.modalItemText}>{item.name}</Text>
      {selectedMembers.includes(item.id) && (
        <Ionicons name="checkmark" size={20} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Group Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter group name"
            value={formData.name}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, name: value }))
            }
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What's this group for?"
            value={formData.description}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, description: value }))
            }
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Currency</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowCurrencyModal(true)}
          >
            <Text style={styles.selectorText}>{formData.currency}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Add Friends ({selectedMembers.length} selected)
          </Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowMembersModal(true)}
          >
            <Text style={styles.selectorText}>
              {selectedMembers.length === 0
                ? "Select friends to add"
                : `${selectedMembers.length} friends selected`}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.buttonDisabled]}
          onPress={handleCreateGroup}
          disabled={isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? "Creating..." : "Create Group"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={CURRENCIES}
            renderItem={renderCurrencyItem}
            keyExtractor={(item) => item}
          />
        </View>
      </Modal>

      {/* Members Modal */}
      <Modal
        visible={showMembersModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Friends</Text>
            <TouchableOpacity onPress={() => setShowMembersModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No friends added yet</Text>
            </View>
          ) : (
            <FlatList
              data={friends}
              renderItem={renderMemberItem}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 16,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  selector: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectorText: {
    fontSize: 16,
    color: "#333",
  },
  createButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
