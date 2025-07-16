import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

// Platform-specific image picker imports
let ImagePicker: any = null;
let ImageManipulator: any = null;

if (Platform.OS !== 'web') {
  try {
    ImagePicker = require("expo-image-picker");
    ImageManipulator = require("expo-image-manipulator");
  } catch (error) {
    console.warn('Image picker modules not available on this platform');
  }
}
import { AppDispatch, RootState } from "../../store";
import { getCurrentUser, setUser } from "../../store/slices/authSlice";
import { useTheme } from "../../contexts/ThemeContext";
import { apiService } from "../../services/api";
import { API_BASE_URL, STORAGE_KEYS } from "../../constants/api";
import { secureStorage } from "../../utils/secureStorage";
import Card from "../../components/Card";
import InputGroup from "../../components/InputGroup";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../constants/theme";

interface Props {
  navigation: StackNavigationProp<any>;
}

interface FormData {
  name: string;
  email: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

interface PresignedUploadResponse {
  upload_url: string;
  s3_key: string;
  expires_at: number;
}

interface ConfirmUploadResponse {
  profile_pic_url: string;
}

export default function EditProfileScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  
  // Extract the actual user data (handle nested user object)
  const actualUser = user?.user || user;

  const [formData, setFormData] = useState<FormData>({
    name: actualUser?.name || "",
    email: actualUser?.email || "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (actualUser) {
      const initialData = {
        name: actualUser.name || "",
        email: actualUser.email || "",
      };
      setFormData(initialData);
      setHasChanges(false);
    }
  }, [actualUser]);

  useEffect(() => {
    if (actualUser) {
      // Only check name changes since email is not editable
      const hasFormChanges = formData.name !== actualUser.name;
      setHasChanges(hasFormChanges);
    }
  }, [formData, actualUser]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: spacing.lg,
    },
    header: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    avatarContainer: {
      position: "relative",
      marginBottom: spacing.md,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      ...shadows.medium,
    },
    avatarImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    avatarText: {
      ...typography.h1,
      color: colors.surface,
      fontWeight: "700",
    },
    editAvatarButton: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: colors.surface,
      ...shadows.small,
    },
    uploadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 60,
      justifyContent: "center",
      alignItems: "center",
    },
    form: {
      marginBottom: spacing.xl,
    },
    buttonContainer: {
      gap: spacing.md,
      marginTop: spacing.lg,
    },
    errorText: {
      ...typography.caption,
      color: colors.error || colors.primary,
      marginTop: spacing.xs,
    },
    deleteImageButton: {
      alignItems: "center",
      marginTop: spacing.md,
    },
    deleteImageText: {
      ...typography.caption,
      color: colors.error || colors.primary,
    },
    disabledField: {
      opacity: 0.6,
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    } else if (formData.name.trim().length > 64) {
      newErrors.name = "Name must be less than 64 characters";
    }

    // Email validation - skip since email is not editable
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!formData.email.trim()) {
    //   newErrors.email = "Email is required";
    // } else if (!emailRegex.test(formData.email.trim())) {
    //   newErrors.email = "Please enter a valid email address";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const response = await apiService.updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(), // Keep email in API call but it won't change
      }) as { user: typeof actualUser };

      // Update user in Redux store - maintain the nested structure if it exists
      const updatedUser = user?.user ? { user: response.user } : response.user;
      dispatch(setUser(updatedUser));
      setHasChanges(false);

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'web' || !ImagePicker) {
      Alert.alert(
        "Not Supported",
        "Image picker is not supported on this platform."
      );
      return false;
    }
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to upload profile pictures."
      );
      return false;
    }
    return true;
  };

  const processImage = async (uri: string): Promise<string> => {
    if (Platform.OS === 'web' || !ImageManipulator) {
      throw new Error("Image processing not supported on this platform");
    }
    
    try {
      // Get image info to check size
      const imageInfo = await ImageManipulator.manipulateAsync(
        uri,
        [],
        { format: ImageManipulator.SaveFormat.JPEG }
      );

      let manipulatedImage = imageInfo;

      // Resize if too large (max 1024x1024)
      if (imageInfo.width > 1024 || imageInfo.height > 1024) {
        const maxDimension = Math.max(imageInfo.width, imageInfo.height);
        const scale = 1024 / maxDimension;
        
        manipulatedImage = await ImageManipulator.manipulateAsync(
          uri,
          [
            {
              resize: {
                width: Math.round(imageInfo.width * scale),
                height: Math.round(imageInfo.height * scale),
              },
            },
          ],
          { 
            compress: 0.8,
            format: ImageManipulator.SaveFormat.JPEG 
          }
        );
      }

      return manipulatedImage.uri;
    } catch (error) {
      throw new Error("Failed to process image");
    }
  };

  const uploadWithoutCustomHeaders = async (imageUri: string, uploadUrl: string) => {
    try {
      
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      
      // Simple PUT request without custom headers - this works!
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: blob,
      });

      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }
      
    } catch (error) {
      throw error;
    }
  };

  // Removed the complex XMLHttpRequest method since simple fetch works perfectly

  const handleImagePicker = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        "Not Supported",
        "Image picker is not available on web. Please use the mobile app to change your profile picture."
      );
      return;
    }
    
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      "Select Image",
      "Choose how you'd like to select your profile picture",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Camera",
          onPress: () => pickImage("camera"),
        },
        {
          text: "Gallery",
          onPress: () => pickImage("gallery"),
        },
      ]
    );
  };

  const pickImage = async (source: "camera" | "gallery") => {
    if (Platform.OS === 'web' || !ImagePicker) {
      Alert.alert("Not Supported", "Image picker is not supported on this platform.");
      return;
    }
    
    try {
      setIsUploadingImage(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        setIsUploadingImage(false);
        return;
      }

      const asset = result.assets[0];
      
      // Check file size (5MB limit)
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert("Error", "Image size must be less than 5MB");
        setIsUploadingImage(false);
        return;
      }

      // Process image
      const processedUri = await processImage(asset.uri);
      setTempImageUri(processedUri);

      // Get presigned URL
      const fileName = `profile_${Date.now()}.jpg`;
      
      const presignedResponse = await apiService.getPresignedUploadUrl({
        file_name: fileName,
      });
      

      // Upload to S3 using the optimized method
      await uploadWithoutCustomHeaders(processedUri, presignedResponse.upload_url);

      // Confirm upload with backend
      
      const confirmResponse = await apiService.confirmUpload({
        s3_key: presignedResponse.s3_key,
      });
      
      
      // Update user in Redux store - maintain the nested structure if it exists
      const updatedUserData = { ...actualUser!, profile_pic_url: confirmResponse.profile_pic_url };
      const updatedUser = user?.user ? { user: updatedUserData } : updatedUserData;
      dispatch(setUser(updatedUser));
      setTempImageUri(null);

      Alert.alert("Success", "Profile picture updated successfully");

      // This code is now moved inside the try block above
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to upload image");
      setTempImageUri(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    Alert.alert(
      "Delete Profile Picture",
      "Are you sure you want to delete your profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsUploadingImage(true);
              await apiService.deleteProfilePicture();
              
              // Update user in Redux store - maintain the nested structure if it exists
              const updatedUserData = { ...actualUser!, profile_pic_url: undefined };
              const updatedUser = user?.user ? { user: updatedUserData } : updatedUserData;
              dispatch(setUser(updatedUser));
              
              Alert.alert("Success", "Profile picture deleted successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete profile picture");
            } finally {
              setIsUploadingImage(false);
            }
          },
        },
      ]
    );
  };

  const getAvatarSource = () => {
    if (tempImageUri) return tempImageUri;
    if (actualUser?.profile_pic_url) return actualUser.profile_pic_url;
    return null;
  };

  const getInitials = () => {
    if (!actualUser?.name) return "U";
    return actualUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {getAvatarSource() ? (
                <Image
                  source={{ uri: getAvatarSource()! }}
                  style={styles.avatarImage}
                  onError={() => {
                  }}
                />
              ) : (
                <Text style={styles.avatarText}>{getInitials()}</Text>
              )}
              
              {isUploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color={colors.surface} />
                </View>
              )}
            </View>
            
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handleImagePicker}
              disabled={isUploadingImage}
            >
              <Ionicons
                name="camera"
                size={20}
                color={colors.surface}
              />
            </TouchableOpacity>
          </View>

          {actualUser?.profile_pic_url && (
            <TouchableOpacity
              style={styles.deleteImageButton}
              onPress={handleDeleteProfilePicture}
              disabled={isUploadingImage}
            >
              <Text style={styles.deleteImageText}>Delete Profile Picture</Text>
            </TouchableOpacity>
          )}
        </View>

        <Card style={styles.form}>
          <Card.Header title="Profile Information" />
          <Card.Content>
            <InputGroup
              label="Name"
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              placeholder="Enter your name"
              autoCapitalize="words"
              required
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <InputGroup
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
              required
              style={styles.disabledField}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Save Changes"
            onPress={handleSave}
            loading={isSaving}
            disabled={!hasChanges || isSaving}
          />
          
          <SecondaryButton
            title="Cancel"
            onPress={handleCancel}
            disabled={isSaving}
          />
        </View>
      </ScrollView>
    </View>
  );
}