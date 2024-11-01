// src/screens/WorkoutDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	Platform
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList } from "../types/navigation";
import {
	Plus,
	MoreVertical,
	Trash2,
	Clock,
	Dumbbell
} from "lucide-react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { Database } from "../types/supabase";

type Props = NativeStackScreenProps<MainStackParamList, "WorkoutDetail">;

type WorkoutPlan = Database["public"]["Tables"]["workout_plans"]["Row"];
type Exercise = Database["public"]["Tables"]["exercises"]["Row"] & {
	exercise_rpe_user: Array<{
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
	}>;
};

export default function WorkoutDetailScreen({ route, navigation }: Props) {
	const { workoutId } = route.params;
	const { user } = useAuth();
	const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
	const [exercises, setExercises] = useState<Exercise[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchWorkoutDetails();
	}, [workoutId]);

	const fetchWorkoutDetails = async () => {
		try {
			setLoading(true);

			// Fetch workout details
			const { data: workoutData, error: workoutError } = await supabase
				.from("workout_plans")
				.select("*")
				.eq("id", workoutId)
				.single();

			if (workoutError) throw workoutError;
			setWorkout(workoutData);

			// Fetch exercises with their RPE and sets
			const { data: exerciseData, error: exerciseError } = await supabase
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
				.eq("exercise_rpe_user.workout_id", workoutId)
				.order("created_at");

			if (exerciseError) throw exerciseError;
			setExercises(exerciseData as Exercise[]);
		} catch (error) {
			Alert.alert("Error", "Failed to load workout details");
			navigation.goBack();
		} finally {
			setLoading(false);
		}
	};

	const handleAddExercise = () => {
		navigation.navigate("AddExercise", { workoutId });
	};

	const handleExercisePress = (exerciseId: string) => {
		navigation.navigate("ExerciseDetail", { exerciseId, workoutId });
	};

	const handleDeleteWorkout = async () => {
		Alert.alert(
			"Delete Workout",
			"Are you sure you want to delete this workout?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							const { error } = await supabase
								.from("workout_plans")
								.delete()
								.eq("id", workoutId);

							if (error) throw error;
							navigation.goBack();
						} catch (error) {
							Alert.alert("Error", "Failed to delete workout");
						}
					}
				}
			]
		);
	};

	const calculateWorkoutStats = () => {
		let totalSets = 0;
		let completedSets = 0;
		let estimatedDuration = 0;

		exercises.forEach((exercise) => {
			exercise.exercise_rpe_user.forEach((rpe) => {
				const setCount = rpe.sets.length;
				totalSets += setCount;
				completedSets += rpe.completed ? setCount : 0;
				// Estimate 2 minutes per set
				estimatedDuration += setCount * 2;
			});
		});

		return {
			totalSets,
			completedSets,
			estimatedDuration,
			progress: totalSets > 0 ? (completedSets / totalSets) * 100 : 0
		};
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	const stats = calculateWorkoutStats();

	return (
		<View style={styles.container}>
			<ScrollView>
				<View style={styles.header}>
					<View style={styles.headerContent}>
						<Text style={styles.title}>{workout?.name}</Text>
						{workout?.description && (
							<Text style={styles.description}>{workout.description}</Text>
						)}
					</View>
					<TouchableOpacity
						onPress={handleDeleteWorkout}
						style={styles.deleteButton}
					>
						<Trash2 size={20} color="#FF3B30" />
					</TouchableOpacity>
				</View>

				<View style={styles.statsContainer}>
					<View style={styles.statCard}>
						<Dumbbell size={20} color="#000" />
						<Text style={styles.statValue}>{stats.totalSets}</Text>
						<Text style={styles.statLabel}>Total Sets</Text>
					</View>
					<View style={styles.statCard}>
						<Clock size={20} color="#000" />
						<Text style={styles.statValue}>{stats.estimatedDuration}m</Text>
						<Text style={styles.statLabel}>Est. Duration</Text>
					</View>
				</View>

				<View style={styles.progressContainer}>
					<View style={styles.progressBar}>
						<View
							style={[styles.progressFill, { width: `${stats.progress}%` }]}
						/>
					</View>
					<Text style={styles.progressText}>
						{stats.completedSets} / {stats.totalSets} sets completed
					</Text>
				</View>

				<View style={styles.exercisesContainer}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Exercises</Text>
						<TouchableOpacity
							style={styles.addButton}
							onPress={handleAddExercise}
						>
							<Plus size={20} color="#fff" />
						</TouchableOpacity>
					</View>

					{exercises.length === 0 ? (
						<View style={styles.emptyState}>
							<Text style={styles.emptyStateText}>No exercises added yet</Text>
							<TouchableOpacity
								style={styles.emptyStateButton}
								onPress={handleAddExercise}
							>
								<Text style={styles.emptyStateButtonText}>Add Exercise</Text>
							</TouchableOpacity>
						</View>
					) : (
						exercises.map((exercise) => (
							<TouchableOpacity
								key={exercise.id}
								style={styles.exerciseCard}
								onPress={() => handleExercisePress(exercise.id)}
							>
								<View style={styles.exerciseContent}>
									<Text style={styles.exerciseName}>{exercise.name}</Text>
									{exercise.notes && (
										<Text style={styles.exerciseNotes}>{exercise.notes}</Text>
									)}
									<View style={styles.setInfo}>
										{exercise.exercise_rpe_user[0]?.sets.map((set, index) => (
											<Text key={set.id} style={styles.setText}>
												Set {index + 1}: {set.weight}kg × {set.reps}
											</Text>
										))}
									</View>
								</View>
								<MoreVertical size={20} color="#666" />
							</TouchableOpacity>
						))
					)}
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5"
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	},
	header: {
		backgroundColor: "#fff",
		padding: 16,
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0"
	},
	headerContent: {
		flex: 1
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 4
	},
	description: {
		fontSize: 14,
		color: "#666"
	},
	deleteButton: {
		padding: 8
	},
	statsContainer: {
		flexDirection: "row",
		padding: 16,
		gap: 16
	},
	statCard: {
		flex: 1,
		backgroundColor: "#fff",
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 4
			},
			android: {
				elevation: 2
			}
		})
	},
	statValue: {
		fontSize: 20,
		fontWeight: "bold",
		marginVertical: 4
	},
	statLabel: {
		fontSize: 12,
		color: "#666"
	},
	progressContainer: {
		padding: 16
	},
	progressBar: {
		height: 8,
		backgroundColor: "#e0e0e0",
		borderRadius: 4,
		overflow: "hidden"
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#000"
	},
	progressText: {
		fontSize: 12,
		color: "#666",
		marginTop: 8,
		textAlign: "center"
	},
	exercisesContainer: {
		padding: 16
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600"
	},
	addButton: {
		backgroundColor: "#000",
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center"
	},
	emptyState: {
		padding: 24,
		alignItems: "center"
	},
	emptyStateText: {
		fontSize: 16,
		color: "#666",
		marginBottom: 16
	},
	emptyStateButton: {
		backgroundColor: "#000",
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8
	},
	emptyStateButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "500"
	},
	exerciseCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		flexDirection: "row",
		alignItems: "center",
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 4
			},
			android: {
				elevation: 2
			}
		})
	},
	exerciseContent: {
		flex: 1
	},
	exerciseName: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4
	},
	exerciseNotes: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8
	},
	setInfo: {
		marginTop: 8
	},
	setText: {
		fontSize: 14,
		color: "#666"
	}
});
