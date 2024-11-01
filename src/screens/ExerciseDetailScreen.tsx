// src/screens/ExerciseDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
	ActivityIndicator,
	Platform
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList } from "../types/navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { Plus, Minus, Save, Trash2 } from "lucide-react-native";
import {
	ExerciseDetail,
	SetForm,
	SetData,
	ExerciseFormData
} from "../types/exercise";

type Props = NativeStackScreenProps<MainStackParamList, "ExerciseDetail">;

interface Set {
	id?: string;
	reps: string;
	weight: string;
	set_number: number;
}

interface ExerciseDetails {
	id: string;
	name: string;
	notes: string | null;
	exercise_rpe_user: {
		id: string;
		target_rpe_id: string;
		actual_rpe_id: string | null;
		completed: boolean;
		sets: Array<{
			id: string;
			reps: number;
			weight: number;
			set_number: number;
		}>;
	}[];
}

export default function ExerciseDetailScreen({ route, navigation }: Props) {
	const { exerciseId, workoutId } = route.params;
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [exercise, setExercise] = useState<ExerciseDetails | null>(null);
	const [sets, setSets] = useState<Set[]>([
		{ reps: "", weight: "", set_number: 1 }
	]);
	const [targetRPE, setTargetRPE] = useState("7.5");
	const [actualRPE, setActualRPE] = useState("");
	const [notes, setNotes] = useState("");

	useEffect(() => {
		fetchExerciseDetails();
	}, [exerciseId]);

	const fetchExerciseDetails = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("exercises")
				.select(
					`
          *,
          exercise_rpe_user (
            id,
            target_rpe_id,
            actual_rpe_id,
            completed,
            sets (
              id,
              reps,
              weight,
              set_number
            )
          )
        `
				)
				.eq("id", exerciseId)
				.single();

			if (error) throw error;

			setExercise(data);
			if (data.exercise_rpe_user[0]?.sets) {
				setSets(
					data.exercise_rpe_user[0].sets.map((set: any) => ({
						id: set.id,
						reps: set.reps.toString(),
						weight: set.weight.toString(),
						set_number: set.set_number
					}))
				);
			}
			setNotes(data.notes || "");

			// Get RPE values
			if (data.exercise_rpe_user[0]?.target_rpe_id) {
				const { data: rpeData } = await supabase
					.from("rpe")
					.select("rpe_value")
					.eq("id", data.exercise_rpe_user[0].target_rpe_id)
					.single();

				if (rpeData) setTargetRPE(rpeData.rpe_value.toString());
			}

			if (data.exercise_rpe_user[0]?.actual_rpe_id) {
				const { data: rpeData } = await supabase
					.from("rpe")
					.select("rpe_value")
					.eq("id", data.exercise_rpe_user[0].actual_rpe_id)
					.single();

				if (rpeData) setActualRPE(rpeData.rpe_value.toString());
			}
		} catch (error) {
			console.error("Error fetching exercise:", error);
			Alert.alert("Error", "Failed to load exercise details");
			navigation.goBack();
		} finally {
			setLoading(false);
		}
	};

	const handleAddSet = () => {
		setSets((current) => [
			...current,
			{ reps: "", weight: "", set_number: current.length + 1 }
		]);
	};

	const handleRemoveSet = (index: number) => {
		setSets((current) => current.filter((_, i) => i !== index));
	};

	const handleSetChange = (index: number, field: keyof Set, value: string) => {
		setSets((current) =>
			current.map((set, i) => (i === index ? { ...set, [field]: value } : set))
		);
	};

	const validateData = () => {
		for (const set of sets) {
			if (!set.reps || !set.weight) {
				Alert.alert("Error", "Please fill in all set data");
				return false;
			}
			if (isNaN(Number(set.reps)) || isNaN(Number(set.weight))) {
				Alert.alert("Error", "Please enter valid numbers");
				return false;
			}
		}
		return true;
	};

	const handleSave = async () => {
		if (!exercise || !user) return;
		if (!validateData()) return;

		try {
			setSaving(true);

			// Get RPE IDs
			const { data: targetRpeData } = await supabase
				.from("rpe")
				.select("id")
				.eq("rpe_value", parseFloat(targetRPE))
				.single();

			const { data: actualRpeData } = await supabase
				.from("rpe")
				.select("id")
				.eq("rpe_value", parseFloat(actualRPE || targetRPE))
				.single();

			if (!targetRpeData) throw new Error("Invalid target RPE");

			// Update exercise RPE
			const { error: rpeError } = await supabase
				.from("exercise_rpe_user")
				.update({
					target_rpe_id: targetRpeData.id,
					actual_rpe_id: actualRpeData?.id || null,
					completed: true
				})
				.eq("id", exercise.exercise_rpe_user[0].id);

			if (rpeError) throw rpeError;

			// Update sets
			const setsToUpsert = sets.map((set) => ({
				exercise_rpe_user_id: exercise.exercise_rpe_user[0].id,
				reps: parseInt(set.reps),
				weight: parseFloat(set.weight),
				set_number: set.set_number
			}));

			const { error: setsError } = await supabase
				.from("sets")
				.upsert(setsToUpsert);

			if (setsError) throw setsError;

			// Update exercise notes
			const { error: notesError } = await supabase
				.from("exercises")
				.update({ notes })
				.eq("id", exerciseId);

			if (notesError) throw notesError;

			Alert.alert("Success", "Exercise data saved successfully");
			navigation.goBack();
		} catch (error) {
			console.error("Error saving exercise:", error);
			Alert.alert("Error", "Failed to save exercise data");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.header}>
					<Text style={styles.title}>{exercise?.name}</Text>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>RPE Target</Text>
					<View style={styles.rpeContainer}>
						{[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((value) => (
							<TouchableOpacity
								key={value}
								style={[
									styles.rpeButton,
									targetRPE === value.toString() && styles.rpeButtonActive
								]}
								onPress={() => setTargetRPE(value.toString())}
							>
								<Text
									style={[
										styles.rpeButtonText,
										targetRPE === value.toString() && styles.rpeButtonTextActive
									]}
								>
									{value}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Sets</Text>
					{sets.map((set, index) => (
						<View key={index} style={styles.setContainer}>
							<View style={styles.setHeader}>
								<Text style={styles.setNumber}>Set {set.set_number}</Text>
								<TouchableOpacity
									onPress={() => handleRemoveSet(index)}
									style={styles.removeButton}
								>
									<Minus size={20} color="#FF3B30" />
								</TouchableOpacity>
							</View>
							<View style={styles.setInputs}>
								<View style={styles.inputContainer}>
									<Text style={styles.inputLabel}>Weight (kg)</Text>
									<TextInput
										style={styles.input}
										value={set.weight}
										onChangeText={(value) =>
											handleSetChange(index, "weight", value)
										}
										keyboardType="numeric"
										placeholder="0"
									/>
								</View>
								<View style={styles.inputContainer}>
									<Text style={styles.inputLabel}>Reps</Text>
									<TextInput
										style={styles.input}
										value={set.reps}
										onChangeText={(value) =>
											handleSetChange(index, "reps", value)
										}
										keyboardType="numeric"
										placeholder="0"
									/>
								</View>
							</View>
						</View>
					))}
					<TouchableOpacity style={styles.addSetButton} onPress={handleAddSet}>
						<Plus size={20} color="#000" />
						<Text style={styles.addSetText}>Add Set</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Actual RPE</Text>
					<View style={styles.rpeContainer}>
						{[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((value) => (
							<TouchableOpacity
								key={value}
								style={[
									styles.rpeButton,
									actualRPE === value.toString() && styles.rpeButtonActive
								]}
								onPress={() => setActualRPE(value.toString())}
							>
								<Text
									style={[
										styles.rpeButtonText,
										actualRPE === value.toString() && styles.rpeButtonTextActive
									]}
								>
									{value}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Notes</Text>
					<TextInput
						style={styles.notesInput}
						value={notes}
						onChangeText={setNotes}
						placeholder="Add notes about this exercise..."
						multiline
						numberOfLines={4}
					/>
				</View>
			</ScrollView>

			<View style={styles.footer}>
				<TouchableOpacity
					style={[styles.saveButton, saving && styles.saveButtonDisabled]}
					onPress={handleSave}
					disabled={saving}
				>
					{saving ? (
						<ActivityIndicator color="#fff" />
					) : (
						<>
							<Save size={20} color="#fff" />
							<Text style={styles.saveButtonText}>Save Exercise</Text>
						</>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5"
	},
	scrollContent: {
		padding: 16
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	},
	header: {
		marginBottom: 20
	},
	title: {
		fontSize: 24,
		fontWeight: "bold"
	},
	section: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		...(Platform.OS === "ios"
			? {
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.1,
					shadowRadius: 4
			  }
			: {
					elevation: 2
			  })
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 12
	},
	rpeContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8
	},
	rpeButton: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ddd",
		backgroundColor: "#fff"
	},
	rpeButtonActive: {
		backgroundColor: "#000",
		borderColor: "#000"
	},
	rpeButtonText: {
		fontSize: 16,
		color: "#000"
	},
	rpeButtonTextActive: {
		color: "#fff"
	},
	setContainer: {
		marginBottom: 16
	},
	setHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8
	},
	setNumber: {
		fontSize: 16,
		fontWeight: "500"
	},
	removeButton: {
		padding: 4
	},
	setInputs: {
		flexDirection: "row",
		gap: 12
	},
	inputContainer: {
		flex: 1
	},
	inputLabel: {
		fontSize: 14,
		color: "#666",
		marginBottom: 4
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 12,
		fontSize: 16
	},
	addSetButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 12,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		marginTop: 8
	},
	addSetText: {
		marginLeft: 8,
		fontSize: 16,
		color: "#000"
	},
	notesInput: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		minHeight: 100,
		textAlignVertical: "top",
		backgroundColor: "#fafafa"
	},
	footer: {
		padding: 16,
		backgroundColor: "#fff",
		borderTopWidth: 1,
		borderTopColor: "#e0e0e0",
		...(Platform.OS === "ios"
			? {
					shadowColor: "#000",
					shadowOffset: { width: 0, height: -2 },
					shadowOpacity: 0.1,
					shadowRadius: 4
			  }
			: {
					elevation: 2
			  })
	},
	saveButton: {
		backgroundColor: "#000",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
		borderRadius: 8,
		gap: 8
	},
	saveButtonDisabled: {
		backgroundColor: "#666"
	},
	saveButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600"
	},
	deleteButton: {
		backgroundColor: "#FF3B30",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
		borderRadius: 8,
		marginTop: 8
	},
	deleteButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600"
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		padding: 20
	},
	modalContent: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		width: "100%",
		maxWidth: 400
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 12
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 12,
		marginTop: 20
	},
	modalButton: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 6
	},
	modalButtonCancel: {
		backgroundColor: "#e0e0e0"
	},
	modalButtonConfirm: {
		backgroundColor: "#FF3B30"
	},
	modalButtonText: {
		fontSize: 16,
		fontWeight: "500"
	},
	modalButtonTextCancel: {
		color: "#000"
	},
	modalButtonTextConfirm: {
		color: "#fff"
	},
	historyContainer: {
		marginTop: 12
	},
	historyTitle: {
		fontSize: 16,
		fontWeight: "500",
		marginBottom: 8
	},
	historyItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0"
	},
	historyDate: {
		fontSize: 14,
		color: "#666"
	},
	historyValue: {
		fontSize: 14,
		fontWeight: "500"
	},
	tooltipContainer: {
		position: "absolute",
		backgroundColor: "rgba(0, 0, 0, 0.8)",
		padding: 8,
		borderRadius: 4,
		maxWidth: 200
	},
	tooltipText: {
		color: "#fff",
		fontSize: 12
	},
	emptyState: {
		alignItems: "center",
		padding: 20
	},
	emptyStateText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		marginBottom: 12
	},
	warningText: {
		color: "#FF3B30",
		fontSize: 12,
		marginTop: 4
	},
	badge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		backgroundColor: "#e0e0e0"
	},
	badgeText: {
		fontSize: 12,
		color: "#666"
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8
	},
	divider: {
		height: 1,
		backgroundColor: "#e0e0e0",
		marginVertical: 16
	},
	chip: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		backgroundColor: "#f0f0f0",
		marginRight: 8
	},
	chipText: {
		fontSize: 14,
		color: "#666"
	},
	chipActive: {
		backgroundColor: "#000"
	},
	chipTextActive: {
		color: "#fff"
	}
});
