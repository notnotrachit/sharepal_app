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
import { useTheme } from "../../constants/ThemeProvider";
import InputGroup from "../../components/InputGroup";
import AppModal from "../../components/AppModal";
import PrimaryButton from "../../components/PrimaryButton";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../constants/theme";

type CreateGroupScreenNavigationProp = StackNavigationProp<
  GroupsStackParamList,
  "CreateGroup"
>;

interface Props {
  navigation: CreateGroupScreenNavigationProp;
}

export default function CreateGroupScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { colors, components } = useTheme();
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
        <Ionicons name="checkmark" size={20} color={colors.primary} />
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
        <Ionicons name="checkmark" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.lg,
    },
    form: {
      gap: spacing.lg,
    },
    inputGroup: {
      gap: spacing.sm,
    },
    label: {
      ...typography.h4,
      color: colors.text,
    },
    input: {
      ...components.input,
    },
    textArea: {
      ...components.input,
      height: 80,
      textAlignVertical: "top",
    },
    selector: {
      ...components.input,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    selectorText: {
      ...typography.body,
      color: colors.text,
    },
    createButton: {
      ...components.button.primary,
      backgroundColor: colors.primary,
      marginTop: spacing.lg,
      ...shadows.medium,
      elevation: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonDisabled: {
      backgroundColor: colors.textSecondary,
    },
    createButtonText: {
      ...typography.button,
      color: "#ffffff",
      fontWeight: "600",
      textAlign: "center",
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      ...typography.h3,
      color: colors.text,
    },
    modalItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalItemText: {
      ...typography.body,
      color: colors.text,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <InputGroup
          label="Group Name"
          value={formData.name}
          onChangeText={(value) =>
            setFormData((prev) => ({ ...prev, name: value }))
          }
          placeholder="Enter group name"
          required
        />

        <InputGroup
          label="Description"
          value={formData.description}
          onChangeText={(value) =>
            setFormData((prev) => ({ ...prev, description: value }))
          }
          placeholder="What's this group for?"
          multiline
          numberOfLines={3}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Currency</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowCurrencyModal(true)}
          >
            <Text style={styles.selectorText}>{formData.currency}</Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.textSecondary}
            />
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
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title={isLoading ? "Creating..." : "Create Group"}
          onPress={handleCreateGroup}
          loading={isLoading}
          disabled={!formData.name.trim()}
        />
      </View>

      {/* Currency Modal */}
      <AppModal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        title="Select Currency"
      >
        <FlatList
          data={CURRENCIES}
          renderItem={renderCurrencyItem}
          keyExtractor={(item) => item}
        />
      </AppModal>

      {/* Members Modal */}
      <AppModal
        visible={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title="Add Friends"
      >
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
      </AppModal>
    </ScrollView>
  );
}
