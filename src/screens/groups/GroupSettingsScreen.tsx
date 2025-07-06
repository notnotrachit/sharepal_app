import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AppDispatch, RootState } from "../../store";
import {
  fetchGroup,
  fetchGroupMembers,
  addGroupMember,
  removeGroupMember,
} from "../../store/slices/groupsSlice";
import { GroupsStackParamList } from "../../navigation/AppNavigator";
import { useTheme } from "../../constants/ThemeProvider";
import { apiService } from "../../services/api";
import Card from "../../components/Card";
import InputGroup from "../../components/InputGroup";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import UserAvatar from "../../components/UserAvatar";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../constants/theme";

type GroupSettingsScreenNavigationProp = StackNavigationProp<
  GroupsStackParamList,
  "GroupSettings"
>;
type GroupSettingsScreenRouteProp = RouteProp<
  GroupsStackParamList,
  "GroupSettings"
>;

interface Props {
  navigation: GroupSettingsScreenNavigationProp;
  route: GroupSettingsScreenRouteProp;
}

export default function GroupSettingsScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  
  const { currentGroup, groupMembers, isLoading } = useSelector(
    (state: RootState) => state.groups
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [groupName, setGroupName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (currentGroup) {
      setGroupName(currentGroup.name || "");
    }
  }, [currentGroup]);

  useEffect(() => {
    dispatch(fetchGroup(groupId));
    dispatch(fetchGroupMembers(groupId));
  }, [groupId]);

  const handleUpdateGroupName = async () => {
    if (!groupName.trim() || groupName === currentGroup?.name) {
      setIsEditingName(false);
      return;
    }

    try {
      setIsUpdating(true);
      // Note: You'll need to add this endpoint to your API service
      await apiService.updateGroup(groupId, { name: groupName.trim() });
      dispatch(fetchGroup(groupId)); // Refresh group data
      setIsEditingName(false);
      Alert.alert("Success", "Group name updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update group name");
      setGroupName(currentGroup?.name || ""); // Reset to original name
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    try {
      setIsUpdating(true);
      await dispatch(addGroupMember({
        groupId,
        userId: newMemberEmail.trim() // Note: This should be userId, you may need to implement user lookup by email
      })).unwrap();
      
      setNewMemberEmail("");
      setShowAddMemberModal(false);
      dispatch(fetchGroupMembers(groupId)); // Refresh members
      Alert.alert("Success", "Member added successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add member");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${memberName} from this group?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setIsUpdating(true);
              await dispatch(removeGroupMember({
                groupId,
                memberId
              })).unwrap();
              
              dispatch(fetchGroupMembers(groupId)); // Refresh members
              Alert.alert("Success", "Member removed successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to remove member");
            } finally {
              setIsUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      "Leave Group",
      "Are you sure you want to leave this group? You won't be able to see group expenses anymore.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              setIsUpdating(true);
              await dispatch(removeGroupMember({
                groupId,
                memberId: user?.id || ""
              })).unwrap();
              
              navigation.navigate("Groups");
              Alert.alert("Success", "You have left the group");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to leave group");
            } finally {
              setIsUpdating(false);
            }
          }
        }
      ]
    );
  };

  const isCurrentUserAdmin = () => {
    // Check if current user is admin (you might need to add admin field to your data structure)
    return currentGroup?.created_by === user?.id;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.md,
    },
    groupNameContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    groupNameInput: {
      ...typography.h4,
      color: colors.text,
      flex: 1,
      borderBottomWidth: isEditingName ? 1 : 0,
      borderBottomColor: colors.primary,
      paddingVertical: spacing.sm,
    },
    editButton: {
      padding: spacing.sm,
      marginLeft: spacing.sm,
    },
    memberItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    memberInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    memberDetails: {
      marginLeft: spacing.md,
      flex: 1,
    },
    memberName: {
      ...typography.body,
      color: colors.text,
      fontWeight: "600",
    },
    memberEmail: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    adminBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      marginLeft: spacing.sm,
    },
    adminText: {
      ...typography.caption,
      color: colors.surface,
      fontWeight: "600",
    },
    removeButton: {
      padding: spacing.sm,
    },
    addMemberButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: colors.primary,
      borderStyle: "dashed",
      borderRadius: borderRadius.md,
      marginTop: spacing.md,
    },
    addMemberText: {
      ...typography.body,
      color: colors.primary,
      marginLeft: spacing.sm,
      fontWeight: "600",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      width: "90%",
      maxWidth: 400,
    },
    modalTitle: {
      ...typography.h3,
      color: colors.text,
      textAlign: "center",
      marginBottom: spacing.lg,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: spacing.lg,
      gap: spacing.md,
    },
    dangerSection: {
      marginTop: spacing.xl,
      paddingTop: spacing.xl,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    dangerButton: {
      backgroundColor: colors.error,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      alignItems: "center",
    },
    dangerButtonText: {
      ...typography.body,
      color: colors.surface,
      fontWeight: "600",
    },
  });

  if (isLoading && !currentGroup) {
    return <LoadingSpinner message="Loading group settings..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Information</Text>
          <Card>
            <Card.Content>
              <View style={styles.groupNameContainer}>
                <TextInput
                  style={styles.groupNameInput}
                  value={groupName}
                  onChangeText={setGroupName}
                  editable={isEditingName}
                  placeholder="Group name"
                  placeholderTextColor={colors.textSecondary}
                />
                {isEditingName ? (
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        setGroupName(currentGroup?.name || "");
                        setIsEditingName(false);
                      }}
                    >
                      <Ionicons name="close" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={handleUpdateGroupName}
                      disabled={isUpdating}
                    >
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditingName(true)}
                  >
                    <Ionicons name="pencil" size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members ({groupMembers?.length || 0})</Text>
          <Card>
            <Card.Content>
              {groupMembers?.map((member: any) => (
                <View key={member.id || member._id} style={styles.memberItem}>
                  <View style={styles.memberInfo}>
                    <UserAvatar user={member} size="medium" fallbackIcon="person" />
                    <View style={styles.memberDetails}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={styles.memberName}>
                          {member.name || member.user_name || "Unknown"}
                          {member.id === user?.id && " (You)"}
                        </Text>
                        {member.id === currentGroup?.created_by && (
                          <View style={styles.adminBadge}>
                            <Text style={styles.adminText}>Admin</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.memberEmail}>
                        {member.email || "No email"}
                      </Text>
                    </View>
                  </View>
                  {member.id !== user?.id && isCurrentUserAdmin() && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveMember(
                        member.id || member._id,
                        member.name || member.user_name || "Unknown"
                      )}
                    >
                      <Ionicons name="remove-circle" size={24} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              {isCurrentUserAdmin() && (
                <TouchableOpacity
                  style={styles.addMemberButton}
                  onPress={() => setShowAddMemberModal(true)}
                >
                  <Ionicons name="add" size={24} color={colors.primary} />
                  <Text style={styles.addMemberText}>Add Member</Text>
                </TouchableOpacity>
              )}
            </Card.Content>
          </Card>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleLeaveGroup}
          >
            <Text style={styles.dangerButtonText}>Leave Group</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Member Modal */}
      <Modal
        visible={showAddMemberModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Member</Text>
            <InputGroup
              label="Email Address"
              value={newMemberEmail}
              onChangeText={setNewMemberEmail}
              placeholder="Enter member's email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <SecondaryButton
                title="Cancel"
                onPress={() => {
                  setShowAddMemberModal(false);
                  setNewMemberEmail("");
                }}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="Add"
                onPress={handleAddMember}
                loading={isUpdating}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}