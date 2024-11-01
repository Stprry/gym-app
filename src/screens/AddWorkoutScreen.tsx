// src/screens/AddWorkoutScreen.tsx
import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Alert,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList } from "../types/navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { XCircle } from "lucide-react-native";

type Props = NativeStackScreenProps<MainStackParamList, "AddWorkout">;

interface WorkoutForm {
	name: string;
	description: string;
	is_template: boolean;
}

export default function AddWorkoutScreen({ navigation }: Props) {
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState<WorkoutForm>({
		name: "",
		description: "",
		is_template: false
	});

	const handleCreate = async () => {
		if (!user) return;

		if (!form.name.trim()) {
			Alert.alert("Error", "Please enter a workout name");
			return;
		}

		try {
			setLoading(true);

			const { data, error } = await supabase
				.from("workout_plans")
				.insert([
					{
						name: form.name.trim(),
						description: form.description.trim(),
						is_template: form.is_template,
						created_by_id: user.id
					}
				])
				.select()
				.single();

			if (error) throw error;

			navigation.replace("WorkoutDetail", { workoutId: data.id });
		} catch (error) {
			console.error("Error creating workout:", error);
			Alert.alert("Error", "Failed to create workout");
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		navigation.goBack();
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.header}>
					<Text style={styles.title}>Create Workout</Text>
					<TouchableOpacity
						onPress={handleCancel}
						style={styles.closeButton}
						disabled={loading}
					>
						<XCircle size={24} color="#666" />
					</TouchableOpacity>
				</View>

				<View style={styles.form}>
					<View style={styles.inputContainer}>
						<Text style={styles.label}>Workout Name*</Text>
						<TextInput
							style={styles.input}
							value={form.name}
							onChangeText={(text) =>
								setForm((prev) => ({ ...prev, name: text }))
							}
							placeholder="Enter workout name"
							placeholderTextColor="#999"
							maxLength={100}
							autoFocus
							returnKeyType="next"
							editable={!loading}
						/>
					</View>

					<View style={styles.inputContainer}>
						<Text style={styles.label}>Description</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={form.description}
							onChangeText={(text) =>
								setForm((prev) => ({ ...prev, description: text }))
							}
							placeholder="Enter workout description"
							placeholderTextColor="#999"
							multiline
							numberOfLines={4}
							maxLength={500}
							editable={!loading}
						/>
					</View>

					<View style={styles.switchContainer}>
						<TouchableOpacity
							style={[
								styles.switchOption,
								form.is_template && styles.switchOptionActive
							]}
							onPress={() =>
								setForm((prev) => ({ ...prev, is_template: true }))
							}
							disabled={loading}
						>
							<Text
								style={[
									styles.switchText,
									form.is_template && styles.switchTextActive
								]}
							>
								Template
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.switchOption,
								!form.is_template && styles.switchOptionActive
							]}
							onPress={() =>
								setForm((prev) => ({ ...prev, is_template: false }))
							}
							disabled={loading}
						>
							<Text
								style={[
									styles.switchText,
									!form.is_template && styles.switchTextActive
								]}
							>
								Workout
							</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						style={[styles.button, loading && styles.buttonDisabled]}
						onPress={handleCreate}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.buttonText}>Create Workout</Text>
						)}
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff"
	},
	scrollContent: {
		flexGrow: 1
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0"
	},
	title: {
		fontSize: 20,
		fontWeight: "bold"
	},
	closeButton: {
		padding: 4
	},
	form: {
		padding: 16,
		gap: 20
	},
	inputContainer: {
		gap: 8
	},
	label: {
		fontSize: 16,
		fontWeight: "500",
		color: "#333"
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
		minHeight: 100,
		textAlignVertical: "top"
	},
	switchContainer: {
		flexDirection: "row",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		overflow: "hidden"
	},
	switchOption: {
		flex: 1,
		paddingVertical: 12,
		alignItems: "center",
		backgroundColor: "#fafafa"
	},
	switchOptionActive: {
		backgroundColor: "#000"
	},
	switchText: {
		fontSize: 16,
		color: "#666"
	},
	switchTextActive: {
		color: "#fff",
		fontWeight: "500"
	},
	button: {
		backgroundColor: "#000",
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 20
	},
	buttonDisabled: {
		backgroundColor: "#666"
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600"
	}
});
