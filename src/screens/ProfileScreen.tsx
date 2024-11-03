// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	TextInput,
	Alert
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { User, Edit2, Save, LogOut, Lock } from "lucide-react-native";
import { LoadingOverlay } from "../components/LoadingOverlay";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Image } from "react-native"; // Use React Native's Image component
import { ProfileFormData, ExperienceLevel } from "../types/formdata";
import { AuthContextType } from "../types/auth";
import { FormInput } from "@/components/FormInput";

export default function ProfileScreen() {
	const { user, updateUser, signOut } = useAuth();
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<ProfileFormData>({
		first_name: user?.first_name || "",
		last_name: user?.last_name || "",
		height: user?.height?.toString() || "",
		weight: user?.weight?.toString() || "",
		date_of_birth: user?.date_of_birth || new Date(),
		goals: user?.goals || "",
		experience_level: (user?.experience_level as ExperienceLevel) || "beginner"
	});

	useEffect(() => {
		if (user) {
			setFormData({
				first_name: user.first_name || "",
				last_name: user.last_name || "",
				height: user.height?.toString() || "",
				weight: user.weight?.toString() || "",
				date_of_birth: user.date_of_birth || new Date(),
				goals: user.goals || "",
				experience_level:
					(user.experience_level as ExperienceLevel) || "beginner"
			});
		}
	}, [user]);
	const handleExperienceChange = (level: ExperienceLevel) => {
		setFormData((prev) => ({
			...prev,
			experience_level: level
		}));
	};

	const handleSave = async () => {
		try {
			setLoading(true);
			await updateUser({
				first_name: formData.first_name,
				last_name: formData.last_name,
				height: formData.height ? parseFloat(formData.height) : null,
				weight: formData.weight ? parseFloat(formData.weight) : null,
				date_of_birth: formData.date_of_birth.toString(),
				goals: formData.goals,
				experience_level: formData.experience_level
			});
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

	return (
		<ScrollView style={styles.container}>
			<LoadingOverlay visible={loading} />

			<View style={styles.header}>
				<View style={styles.profileImageContainer}>
					{user?.profile_image_url ? (
						<Image
							source={{ uri: user.profile_image_url }}
							style={styles.profileImage}
						/>
					) : (
						<View style={styles.profileImagePlaceholder}>
							<User size={40} color="#666" />
						</View>
					)}
				</View>
				<View style={styles.headerInfo}>
					<Text style={styles.name}>
						{user?.first_name
							? `${user.first_name} ${user.last_name || ""}`
							: user?.username}
					</Text>
					<Text style={styles.email}>{user?.email}</Text>
				</View>
				<TouchableOpacity
					style={styles.editButton}
					onPress={() => (editing ? handleSave() : setEditing(true))}
					disabled={loading}
				>
					{editing ? (
						<Save size={20} color="#fff" />
					) : (
						<Edit2 size={20} color="#fff" />
					)}
				</TouchableOpacity>
			</View>

			<View style={styles.content}>
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Personal Information</Text>

					<FormInput
						label="First Name (locked)" // Updated label
						value={user?.first_name || ""}
						editable={false}
						containerStyle={styles.field}
						required={false}
						placeholder="Not provided"
						style={styles.lockedField} // Add new style
						leftIcon={<Lock size={16} color="#666" />} // Add lock icon
					/>

					<FormInput
						label="Last Name (locked)" // Updated label
						value={user?.last_name || ""}
						editable={false}
						containerStyle={styles.field}
						required={false}
						placeholder="Not provided"
						style={styles.lockedField} // Add new style
						leftIcon={<Lock size={16} color="#666" />} // Add lock icon
					/>

					<FormInput
						label="Height (cm)"
						value={formData.height}
						onChangeText={(text) =>
							setFormData((prev) => ({ ...prev, height: text }))
						}
						editable={editing}
						containerStyle={styles.field}
						keyboardType="numeric"
						required={false}
						placeholder="Enter height"
					/>

					<FormInput
						label="Weight (kg)"
						value={formData.weight}
						onChangeText={(text) =>
							setFormData((prev) => ({ ...prev, weight: text }))
						}
						editable={editing}
						containerStyle={styles.field}
						keyboardType="numeric"
						required={false}
						placeholder="Enter weight"
					/>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Fitness Information</Text>

					<View style={styles.field}>
						<Text style={styles.label}>Experience Level</Text>
						{editing ? (
							<View style={styles.experienceContainer}>
								{["beginner", "intermediate", "advanced"].map((level) => (
									<TouchableOpacity
										key={level}
										style={[
											styles.experienceButton,
											formData.experience_level === level &&
												styles.experienceButtonActive
										]}
										onPress={() =>
											handleExperienceChange(level as ExperienceLevel)
										}
									>
										<Text
											style={[
												styles.experienceButtonText,
												formData.experience_level === level &&
													styles.experienceButtonTextActive
											]}
										>
											{level.charAt(0).toUpperCase() + level.slice(1)}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						) : (
							<Text style={styles.value}>
								{formData.experience_level?.charAt(0).toUpperCase() +
									formData.experience_level?.slice(1) || "Not set"}
							</Text>
						)}
					</View>

					<FormInput
						label="Goals"
						value={formData.goals}
						onChangeText={(text) =>
							setFormData((prev) => ({ ...prev, goals: text }))
						}
						editable={editing}
						containerStyle={styles.field}
						multiline
						numberOfLines={4}
						required={false}
						placeholder="What are your fitness goals?"
					/>
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
	content: {
		padding: 16
	},
	section: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 16
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
	experienceContainer: {
		flexDirection: "row",
		gap: 8
	},
	experienceButton: {
		flex: 1,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ddd",
		alignItems: "center"
	},
	experienceButtonActive: {
		backgroundColor: "#000",
		borderColor: "#000"
	},
	experienceButtonText: {
		fontSize: 14,
		color: "#000"
	},
	experienceButtonTextActive: {
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
	},
	lockedField: {
		backgroundColor: "#f8f8f8",
		borderStyle: "dashed",
		borderColor: "#ccc",
		color: "#666"
	},
	lockedLabel: {
		color: "#666",
		fontStyle: "italic"
	}
});
