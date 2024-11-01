import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	TextInput,
	Alert,
	ActivityIndicator,
	Image,
	Platform
} from "react-native";
import { User, LogOut, Edit2, Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { Database } from "../types/supabase";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];

type FormData = {
	username: string;
	first_name: string;
	last_name: string;
	height: string;
	weight: string;
	goals: string;
	experience_level: string;
};

export default function ProfileScreen() {
	const { user, signOut, updateUser } = useAuth();
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		username: "",
		first_name: "",
		last_name: "",
		height: "",
		weight: "",
		goals: "",
		experience_level: ""
	});

	useEffect(() => {
		if (user) {
			setFormData({
				username: user.username || "",
				first_name: user.first_name || "",
				last_name: user.last_name || "",
				height: user.height?.toString() || "",
				weight: user.weight?.toString() || "",
				goals: user.goals || "",
				experience_level: user.experience_level || ""
			});
		}
	}, [user]);

	const handleImagePick = async () => {
		if (!user) return;

		try {
			const { status } =
				await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (status !== "granted") {
				Alert.alert(
					"Permission needed",
					"Please grant permission to access your photos"
				);
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.5,
				base64: true
			});

			if (!result.canceled && result.assets[0].base64) {
				await uploadProfileImage(result.assets[0].base64);
			}
		} catch (error) {
			Alert.alert("Error", "Failed to pick image");
		}
	};

	const uploadProfileImage = async (base64Image: string) => {
		if (!user) return;

		try {
			setUploadingImage(true);

			const filePath = `${user.id}/${Date.now()}.jpg`;
			const { error: uploadError } = await supabase.storage
				.from("profile-images")
				.upload(filePath, decode(base64Image), {
					contentType: "image/jpeg",
					upsert: true
				});

			if (uploadError) throw uploadError;

			const {
				data: { publicUrl }
			} = supabase.storage.from("profile-images").getPublicUrl(filePath);

			await updateUser({ profile_image_url: publicUrl });
		} catch (error) {
			Alert.alert("Error", "Failed to upload image");
		} finally {
			setUploadingImage(false);
		}
	};

	const handleUpdateProfile = async () => {
		if (!user) return;

		try {
			setLoading(true);

			const updates: Partial<UserProfile> = {
				username: formData.username,
				first_name: formData.first_name,
				last_name: formData.last_name,
				height: formData.height ? parseFloat(formData.height) : null,
				weight: formData.weight ? parseFloat(formData.weight) : null,
				goals: formData.goals,
				experience_level:
					formData.experience_level as UserProfile["experience_level"]
			};

			await updateUser(updates);
			setEditing(false);
			Alert.alert("Success", "Profile updated successfully");
		} catch (error) {
			Alert.alert("Error", "Failed to update profile");
		} finally {
			setLoading(false);
		}
	};

	const handleSignOut = async () => {
		try {
			setLoading(true);
			await signOut();
		} catch (error) {
			Alert.alert("Error", "Failed to sign out");
		} finally {
			setLoading(false);
		}
	};

	if (!user) return null;

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<View style={styles.profileImageContainer}>
					{uploadingImage ? (
						<View style={styles.profileImagePlaceholder}>
							<ActivityIndicator color="#666" />
						</View>
					) : user.profile_image_url ? (
						<Image
							source={{ uri: user.profile_image_url }}
							style={styles.profileImage}
						/>
					) : (
						<View style={styles.profileImagePlaceholder}>
							<User size={40} color="#666" />
						</View>
					)}
					<TouchableOpacity
						style={styles.cameraButton}
						onPress={handleImagePick}
						disabled={uploadingImage}
					>
						<Camera size={20} color="#fff" />
					</TouchableOpacity>
				</View>

				<View style={styles.headerInfo}>
					<Text style={styles.name}>
						{user.first_name
							? `${user.first_name} ${user.last_name || ""}`
							: user.username}
					</Text>
					<Text style={styles.email}>{user.email}</Text>
				</View>

				<TouchableOpacity
					style={styles.editButton}
					onPress={() => (editing ? handleUpdateProfile() : setEditing(true))}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color="#fff" />
					) : (
						<>
							{editing ? (
								<Text style={styles.editButtonText}>Save</Text>
							) : (
								<Edit2 size={20} color="#fff" />
							)}
						</>
					)}
				</TouchableOpacity>
			</View>

			<View style={styles.content}>
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Personal Information</Text>

					<View style={styles.field}>
						<Text style={styles.label}>Username</Text>
						{editing ? (
							<TextInput
								style={styles.input}
								value={formData.username}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, username: text }))
								}
								editable={!loading}
								placeholder="Enter username"
							/>
						) : (
							<Text style={styles.value}>{user.username}</Text>
						)}
					</View>

					<View style={styles.row}>
						<View style={[styles.field, styles.halfWidth]}>
							<Text style={styles.label}>First Name</Text>
							{editing ? (
								<TextInput
									style={styles.input}
									value={formData.first_name}
									onChangeText={(text) =>
										setFormData((prev) => ({ ...prev, first_name: text }))
									}
									editable={!loading}
									placeholder="First name"
								/>
							) : (
								<Text style={styles.value}>{user.first_name || "Not set"}</Text>
							)}
						</View>

						<View style={[styles.field, styles.halfWidth]}>
							<Text style={styles.label}>Last Name</Text>
							{editing ? (
								<TextInput
									style={styles.input}
									value={formData.last_name}
									onChangeText={(text) =>
										setFormData((prev) => ({ ...prev, last_name: text }))
									}
									editable={!loading}
									placeholder="Last name"
								/>
							) : (
								<Text style={styles.value}>{user.last_name || "Not set"}</Text>
							)}
						</View>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Fitness Information</Text>

					<View style={styles.row}>
						<View style={[styles.field, styles.halfWidth]}>
							<Text style={styles.label}>Height (cm)</Text>
							{editing ? (
								<TextInput
									style={styles.input}
									value={formData.height}
									onChangeText={(text) =>
										setFormData((prev) => ({ ...prev, height: text }))
									}
									keyboardType="numeric"
									editable={!loading}
									placeholder="Height"
								/>
							) : (
								<Text style={styles.value}>{user.height || "Not set"}</Text>
							)}
						</View>

						<View style={[styles.field, styles.halfWidth]}>
							<Text style={styles.label}>Weight (kg)</Text>
							{editing ? (
								<TextInput
									style={styles.input}
									value={formData.weight}
									onChangeText={(text) =>
										setFormData((prev) => ({ ...prev, weight: text }))
									}
									keyboardType="numeric"
									editable={!loading}
									placeholder="Weight"
								/>
							) : (
								<Text style={styles.value}>{user.weight || "Not set"}</Text>
							)}
						</View>
					</View>

					<View style={styles.field}>
						<Text style={styles.label}>Experience Level</Text>
						{editing ? (
							<View style={styles.experiencePicker}>
								{["beginner", "intermediate", "advanced"].map((level) => (
									<TouchableOpacity
										key={level}
										style={[
											styles.experienceOption,
											formData.experience_level === level &&
												styles.experienceOptionSelected
										]}
										onPress={() =>
											setFormData((prev) => ({
												...prev,
												experience_level: level
											}))
										}
										disabled={loading}
									>
										<Text
											style={[
												styles.experienceOptionText,
												formData.experience_level === level &&
													styles.experienceOptionTextSelected
											]}
										>
											{level.charAt(0).toUpperCase() + level.slice(1)}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						) : (
							<Text style={styles.value}>
								{user.experience_level
									? user.experience_level.charAt(0).toUpperCase() +
									  user.experience_level.slice(1)
									: "Not set"}
							</Text>
						)}
					</View>

					<View style={styles.field}>
						<Text style={styles.label}>Goals</Text>
						{editing ? (
							<TextInput
								style={[styles.input, styles.textArea]}
								value={formData.goals}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, goals: text }))
								}
								multiline
								numberOfLines={4}
								editable={!loading}
								placeholder="What are your fitness goals?"
							/>
						) : (
							<Text style={styles.value}>{user.goals || "Not set"}</Text>
						)}
					</View>
				</View>

				<TouchableOpacity
					style={styles.signOutButton}
					onPress={handleSignOut}
					disabled={loading}
				>
					<LogOut size={20} color="#FF3B30" />
					<Text style={styles.signOutText}>Sign Out</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5"
	},
	header: {
		backgroundColor: "#fff",
		padding: 24,
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0"
	},
	profileImageContainer: {
		position: "relative",
		marginRight: 16
	},
	profileImage: {
		width: 80,
		height: 80,
		borderRadius: 40
	},
	profileImagePlaceholder: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "#f0f0f0",
		justifyContent: "center",
		alignItems: "center"
	},
	cameraButton: {
		position: "absolute",
		bottom: 0,
		right: 0,
		backgroundColor: "#000",
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderColor: "#fff"
	},
	headerInfo: {
		flex: 1
	},
	name: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 4
	},
	email: {
		fontSize: 14,
		color: "#666"
	},
	editButton: {
		backgroundColor: "#000",
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center"
	},
	editButtonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600"
	},
	content: {
		padding: 24
	},
	section: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		marginBottom: 24
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 16
	},
	row: {
		flexDirection: "row",
		gap: 12
	},
	halfWidth: {
		flex: 1
	},
	field: {
		marginBottom: 16
	},
	label: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8
	},
	value: {
		fontSize: 16,
		color: "#000"
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: "#fafafa"
	},
	textArea: {
		height: 100,
		textAlignVertical: "top"
	},
	experiencePicker: {
		flexDirection: "row",
		gap: 8
	},
	experienceOption: {
		flex: 1,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ddd",
		alignItems: "center"
	},
	experienceOptionSelected: {
		backgroundColor: "#000",
		borderColor: "#000"
	},
	experienceOptionText: {
		fontSize: 14,
		color: "#000"
	},
	experienceOptionTextSelected: {
		color: "#fff"
	},
	signOutButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#fff",
		padding: 16,
		borderRadius: 12,
		gap: 8
	},
	signOutText: {
		color: "#FF3B30",
		fontSize: 16,
		fontWeight: "600"
	}
});
