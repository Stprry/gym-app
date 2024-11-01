// src/screens/AddExerciseScreen.tsx
import React, { useState, useEffect } from "react";
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
import { XCircle, Plus, Search } from "lucide-react-native";
import { Database } from "../types/supabase";

type Props = NativeStackScreenProps<MainStackParamList, "AddExercise">;
type Exercise = Database["public"]["Tables"]["exercises"]["Row"];
type RPE = Database["public"]["Tables"]["rpe"]["Row"];

interface ExerciseFormData {
	exercise: Exercise | null;
	targetRPE: string;
	sets: Array<{
		reps: string;
		weight: string;
	}>;
}

export default function AddExerciseScreen({ route, navigation }: Props) {
	const { workoutId } = route.params;
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [exercises, setExercises] = useState<Exercise[]>([]);
	const [searching, setSearching] = useState(false);
	const [formData, setFormData] = useState<ExerciseFormData>({
		exercise: null,
		targetRPE: "7.5",
		sets: [{ reps: "", weight: "" }]
	});

	useEffect(() => {
		if (searchQuery) {
			searchExercises();
		}
	}, [searchQuery]);

	const searchExercises = async () => {
		try {
			setSearching(true);
			const { data, error } = await supabase
				.from("exercises")
				.select("*")
				.ilike("name", `%${searchQuery}%`)
				.limit(10);

			if (error) throw error;
			setExercises(data || []);
		} catch (error) {
			console.error("Error searching exercises:", error);
		} finally {
			setSearching(false);
		}
	};

	const handleSelectExercise = (exercise: Exercise) => {
		setFormData((prev) => ({ ...prev, exercise }));
		setSearchQuery("");
		setExercises([]);
	};

	const handleAddSet = () => {
		setFormData((prev) => ({
			...prev,
			sets: [...prev.sets, { reps: "", weight: "" }]
		}));
	};

	const handleRemoveSet = (index: number) => {
		setFormData((prev) => ({
			...prev,
			sets: prev.sets.filter((_, i) => i !== index)
		}));
	};

	const handleSetChange = (
		index: number,
		field: "reps" | "weight",
		value: string
	) => {
		setFormData((prev) => ({
			...prev,
			sets: prev.sets.map((set, i) =>
				i === index ? { ...set, [field]: value } : set
			)
		}));
	};

	const validateForm = () => {
		if (!formData.exercise) {
			Alert.alert("Error", "Please select an exercise");
			return false;
		}

		for (const set of formData.sets) {
			if (!set.reps || !set.weight) {
				Alert.alert("Error", "Please fill in all set data");
				return false;
			}
			if (isNaN(Number(set.reps)) || isNaN(Number(set.weight))) {
				Alert.alert("Error", "Please enter valid numbers for sets");
				return false;
			}
		}

		return true;
	};

	const handleSave = async () => {
		if (!user || !validateForm()) return;

		try {
			setLoading(true);

			// Get RPE ID
			const { data: rpeData, error: rpeError } = await supabase
				.from("rpe")
				.select("id")
				.eq("rpe_value", parseFloat(formData.targetRPE))
				.single();

			if (rpeError || !rpeData) throw new Error("Invalid RPE value");

			// Create exercise_rpe_user entry
			const { data: exerciseRPE, error: exerciseRPEError } = await supabase
				.from("exercise_rpe_user")
				.insert({
					user_id: user.id,
					exercise_id: formData.exercise!.id,
					workout_id: workoutId,
					target_rpe_id: rpeData.id,
					completed: false
				})
				.select()
				.single();

			if (exerciseRPEError || !exerciseRPE) throw exerciseRPEError;

			// Create sets
			const setsToInsert = formData.sets.map((set, index) => ({
				exercise_rpe_user_id: exerciseRPE.id,
				reps: parseInt(set.reps),
				weight: parseFloat(set.weight),
				set_number: index + 1
			}));

			const { error: setsError } = await supabase
				.from("sets")
				.insert(setsToInsert);

			if (setsError) throw setsError;

			navigation.goBack();
		} catch (error) {
			console.error("Error saving exercise:", error);
			Alert.alert("Error", "Failed to save exercise");
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<View style={styles.header}>
				<Text style={styles.title}>Add Exercise</Text>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					style={styles.closeButton}
					disabled={loading}
				>
					<XCircle size={24} color="#666" />
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
				<View style={styles.searchContainer}>
					<View style={styles.searchInputContainer}>
						{!formData.exercise ? (
							<>
								<Search size={20} color="#666" style={styles.searchIcon} />
								<TextInput
									style={styles.searchInput}
									value={searchQuery}
									onChangeText={setSearchQuery}
									placeholder="Search exercises..."
									placeholderTextColor="#999"
									autoCapitalize="none"
								/>
							</>
						) : (
							<View style={styles.selectedExercise}>
								<Text style={styles.selectedExerciseName}>
									{formData.exercise.name}
								</Text>
								<TouchableOpacity
									onPress={() =>
										setFormData((prev) => ({ ...prev, exercise: null }))
									}
								>
									<XCircle size={20} color="#666" />
								</TouchableOpacity>
							</View>
						)}
					</View>

					{searching && <ActivityIndicator style={styles.searchSpinner} />}

					{exercises.length > 0 && !formData.exercise && (
						<View style={styles.searchResults}>
							{exercises.map((exercise) => (
								<TouchableOpacity
									key={exercise.id}
									style={styles.searchResult}
									onPress={() => handleSelectExercise(exercise)}
								>
									<Text style={styles.searchResultText}>{exercise.name}</Text>
								</TouchableOpacity>
							))}
						</View>
					)}
				</View>

				{formData.exercise && (
					<>
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Target RPE</Text>
							<View style={styles.rpeContainer}>
								{[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((value) => (
									<TouchableOpacity
										key={value}
										style={[
											styles.rpeButton,
											formData.targetRPE === value.toString() &&
												styles.rpeButtonActive
										]}
										onPress={() =>
											setFormData((prev) => ({
												...prev,
												targetRPE: value.toString()
											}))
										}
									>
										<Text
											style={[
												styles.rpeButtonText,
												formData.targetRPE === value.toString() &&
													styles.rpeButtonTextActive
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
							{formData.sets.map((set, index) => (
								<View key={index} style={styles.setContainer}>
									<View style={styles.setHeader}>
										<Text style={styles.setNumber}>Set {index + 1}</Text>
										{index > 0 && (
											<TouchableOpacity
												onPress={() => handleRemoveSet(index)}
												style={styles.removeButton}
											>
												<XCircle size={20} color="#FF3B30" />
											</TouchableOpacity>
										)}
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
							<TouchableOpacity
								style={styles.addSetButton}
								onPress={handleAddSet}
							>
								<Plus size={20} color="#000" />
								<Text style={styles.addSetText}>Add Set</Text>
							</TouchableOpacity>
						</View>
					</>
				)}
			</ScrollView>

			{formData.exercise && (
				<View style={styles.footer}>
					<TouchableOpacity
						style={[styles.saveButton, loading && styles.saveButtonDisabled]}
						onPress={handleSave}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.saveButtonText}>Add to Workout</Text>
						)}
					</TouchableOpacity>
				</View>
			)}
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff"
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
	content: {
		flex: 1
	},
	searchContainer: {
		padding: 16
	},
	searchInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		backgroundColor: "#fafafa",
		paddingHorizontal: 12
	},
	searchIcon: {
		marginRight: 8
	},
	searchInput: {
		flex: 1,
		height: 44,
		fontSize: 16
	},
	searchSpinner: {
		marginTop: 8
	},
	searchResults: {
		marginTop: 8,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		backgroundColor: "#fff"
	},
	searchResult: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#eee"
	},
	searchResultText: {
		fontSize: 16
	},
	selectedExercise: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12
	},
	selectedExerciseName: {
		fontSize: 16,
		fontWeight: "500"
	},
	section: {
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: "#e0e0e0"
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
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row"
	},
	saveButtonDisabled: {
		backgroundColor: "#666"
	},
	saveButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600"
	},
	errorText: {
		color: "#FF3B30",
		fontSize: 12,
		marginTop: 4
	},
	emptyState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 24
	},
	emptyStateText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		marginBottom: 16
	},
	searchEmptyState: {
		padding: 16,
		alignItems: "center"
	},
	searchEmptyText: {
		fontSize: 14,
		color: "#666",
		textAlign: "center"
	},
	divider: {
		height: 1,
		backgroundColor: "#e0e0e0",
		marginVertical: 16
	},
	buttonIcon: {
		marginRight: 8
	},
	helpText: {
		fontSize: 12,
		color: "#666",
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
		maxWidth: 400,
		...(Platform.OS === "ios"
			? {
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.25,
					shadowRadius: 4
			  }
			: {
					elevation: 5
			  })
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
		backgroundColor: "#000"
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
	searchInputWrapper: {
		position: "relative"
	},
	clearButton: {
		position: "absolute",
		right: 12,
		top: "50%",
		transform: [{ translateY: -10 }]
	},
	recentSearches: {
		marginTop: 16
	},
	recentSearchTitle: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8
	},
	recentSearchItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#eee"
	},
	recentSearchText: {
		flex: 1,
		fontSize: 14
	},
	row: {
		flexDirection: "row",
		alignItems: "center"
	},
	column: {
		flex: 1
	},
	mr8: {
		marginRight: 8
	},
	ml8: {
		marginLeft: 8
	},
	mt16: {
		marginTop: 16
	},
	mb16: {
		marginBottom: 16
	},
	center: {
		alignItems: "center",
		justifyContent: "center"
	}
});
