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
import { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["users"]["Row"];

export default function ProfileScreen() {
	const { user, updateUser, signOut } = useAuth();
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<Partial<Profile>>({
		first_name: user?.first_name || "",
		last_name: user?.last_name || "",
		height: user?.height || null,
		weight: user?.weight || null,
		goals: user?.goals || "",
		experience_level: user?.experience_level || "beginner"
	});

	useEffect(() => {
		if (user) {
			setFormData({
				first_name: user.first_name || "",
				last_name: user.last_name || "",
				height: user.height ?? null,
				weight: user.weight ?? null,
				goals: user.goals || "",
				experience_level: user.experience_level || "beginner"
			});
			setInputValues({
				height: user.height?.toString() ?? "",
				weight: user.weight?.toString() ?? ""
			});
		}
	}, [user]);

	const [inputValues, setInputValues] = useState({
		height: user?.height?.toString() ?? "",
		weight: user?.weight?.toString() ?? ""
	});

	// Helper to format numeric values for display
	const formatNumericValue = (value: number | null | undefined): string => {
		if (value === null || value === undefined) return "";
		return value.toString();
	};

	// Helper to validate and parse numeric input
	const handleNumericChange = (field: "height" | "weight", value: string) => {
		// Allow empty string, numbers, and one decimal point
		// This regex allows typing numbers with decimals
		if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
			setInputValues((prev) => ({
				...prev,
				[field]: value
			}));

			// Update formData with the numeric value
			setFormData((prev) => ({
				...prev,
				[field]: value === "" ? null : parseFloat(value)
			}));
		}
	};
	const handleExperienceChange = (level: Profile["experience_level"]) => {
		setFormData((prev) => ({
			...prev,
			experience_level: level
		}));
	};

	const handleSave = async () => {
		if (!user) return;

		try {
			setLoading(true);

			const updates: Partial<Profile> = {
				height: inputValues.height ? parseFloat(inputValues.height) : null,
				weight: inputValues.weight ? parseFloat(inputValues.weight) : null,
				goals: formData.goals || null,
				experience_level: formData.experience_level || null
			};

			await updateUser(updates);
			setEditing(false);
			Alert.alert("Success", "Profile updated successfully");
		} catch (error) {
			console.error("Profile update error:", error);
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

	const formatDateOfBirth = (date: string | null) => {
		if (!date) return "Not provided";
		return new Date(date).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric"
		});
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
						label="First Name"
						value={user?.first_name || ""}
						locked={true}
						containerStyle={styles.field}
						placeholder="Not provided"
					/>

					<FormInput
						label="Last Name"
						value={user?.last_name || ""}
						locked={true}
						containerStyle={styles.field}
						placeholder="Not provided"
					/>

					<FormInput
						label="Email"
						value={user?.email || ""}
						locked={true}
						containerStyle={styles.field}
						placeholder="Not provided"
					/>

					<FormInput
						label="Date of Birth"
						value={formatDateOfBirth(user?.date_of_birth ?? null)}
						locked={true}
						containerStyle={styles.field}
						placeholder="Not provided"
					/>

					<FormInput
						label="Height (cm)"
						value={inputValues.height}
						onChangeText={(text) => handleNumericChange("height", text)}
						editable={editing}
						containerStyle={styles.field}
						keyboardType="decimal-pad"
						placeholder={editing ? "Enter height" : "Not provided"}
					/>

					<FormInput
						label="Weight (kg)"
						value={inputValues.weight}
						onChangeText={(text) => handleNumericChange("weight", text)}
						editable={editing}
						containerStyle={styles.field}
						keyboardType="decimal-pad"
						placeholder={editing ? "Enter weight" : "Not provided"}
					/>

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
											handleExperienceChange(
												level as Profile["experience_level"]
											)
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
								{formData.experience_level
									? formData.experience_level.charAt(0).toUpperCase() +
									  formData.experience_level.slice(1)
									: "Not set"}
							</Text>
						)}
					</View>

					<FormInput
						label="Goals"
						value={formData.goals || ""}
						onChangeText={(text) =>
							setFormData((prev) => ({ ...prev, goals: text }))
						}
						editable={editing}
						containerStyle={styles.field}
						multiline
						numberOfLines={4}
						placeholder={
							editing ? "What are your fitness goals?" : "Not provided"
						}
					/>
				</View>

				{editing ? (
					<TouchableOpacity
						style={styles.saveButton}
						onPress={handleSave}
						disabled={loading}
					>
						<Save size={20} color="#fff" />
						<Text style={styles.saveButtonText}>Save Changes</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						style={styles.signOutButton}
						onPress={handleSignOut}
						disabled={loading}
					>
						<LogOut size={20} color="#FF3B30" />
						<Text style={styles.signOutText}>Sign Out</Text>
					</TouchableOpacity>
				)}
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
	},
	saveButton: {
		backgroundColor: "#000",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
		borderRadius: 12,
		marginTop: 16,
		marginHorizontal: 16,
		gap: 8
	},
	saveButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600"
	}
});
