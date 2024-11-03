import React from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	RefreshControl,
	ActivityIndicator,
	Platform,
	ScrollView
} from "react-native";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { MainTabParamList, MainStackParamList } from "../types/navigation";
import { Plus, Clock, Dumbbell } from "lucide-react-native";
import { useWorkouts } from "../hooks/useWorkouts";
import { useAuth } from "../hooks/useAuth";
import { Database } from "../types/supabase";
import { LoadingOverlay } from "@/components/LoadingOverlay";

type Props = CompositeScreenProps<
	BottomTabScreenProps<MainTabParamList, "Home">,
	NativeStackScreenProps<MainStackParamList>
>;

type WorkoutPlan = Database["public"]["Tables"]["workout_plans"]["Row"];

interface WorkoutCardProps {
	workout: WorkoutPlan;
	onPress: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onPress }) => (
	<TouchableOpacity style={styles.card} onPress={onPress}>
		<View style={styles.cardHeader}>
			<Text style={styles.cardTitle}>{workout.name}</Text>
			{workout.is_template && (
				<View style={styles.templateBadge}>
					<Text style={styles.templateText}>Template</Text>
				</View>
			)}
		</View>
		<Text style={styles.cardDescription}>{workout.description}</Text>
		<Text style={styles.cardDate}>
			Created {new Date(workout.created_at).toLocaleDateString()}
		</Text>
	</TouchableOpacity>
);

export default function HomeScreen({ navigation }: Props) {
	const { user } = useAuth();
	const { workouts, loading, error, refetch } = useWorkouts(user?.id ?? "");
	const [refreshing, setRefreshing] = React.useState(false);

	const handleAddWorkout = () => {
		navigation.navigate("AddWorkout");
	};

	const handleWorkoutPress = (workoutId: string) => {
		navigation.navigate("WorkoutDetail", { workoutId });
	};

	const onRefresh = React.useCallback(async () => {
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
	}, [refetch]);

	if (loading) {
		return <LoadingOverlay visible={true} message="Loading workouts..." />;
	}

	if (workouts.length === 0) {
		return (
			<View style={styles.container}>
				<View style={styles.emptyContainer}>
					<Dumbbell size={64} color="#666" style={styles.emptyIcon} />
					<Text style={styles.emptyTitle}>No Workouts Yet</Text>
					<Text style={styles.emptyDescription}>
						Start your fitness journey by creating your first workout plan.
						Track your exercises, sets, and progress all in one place.
					</Text>
					<TouchableOpacity
						style={styles.createButton}
						onPress={handleAddWorkout}
					>
						<Plus size={20} color="#fff" style={styles.createButtonIcon} />
						<Text style={styles.createButtonText}>Create Workout</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centerContainer}>
				<Text style={styles.errorText}>Error loading workouts</Text>
				<TouchableOpacity style={styles.retryButton} onPress={refetch}>
					<Text style={styles.retryButtonText}>Retry</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Workouts</Text>
				<TouchableOpacity style={styles.addButton} onPress={handleAddWorkout}>
					<Plus color="#fff" size={24} />
				</TouchableOpacity>
			</View>

			{loading && !refreshing ? (
				<View style={styles.centerContainer}>
					<ActivityIndicator size="large" color="#000" />
				</View>
			) : (
				<FlatList
					data={workouts}
					renderItem={({ item }) => (
						<WorkoutCard
							workout={item}
							onPress={() => handleWorkoutPress(item.id)}
						/>
					)}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContainer}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
					ListEmptyComponent={
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyTitle}>No Workouts Yet</Text>
							<Text style={styles.emptyDescription}>
								Create your first workout to get started
							</Text>
							<TouchableOpacity
								style={styles.createButton}
								onPress={handleAddWorkout}
							>
								<Text style={styles.createButtonText}>Create Workout</Text>
							</TouchableOpacity>
						</View>
					}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5"
	},
	emptyContainer: {
		flex: 1,
		padding: 24,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 60
	},
	emptyIcon: {
		marginBottom: 24
	},
	emptyTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 12,
		textAlign: "center"
	},
	emptyDescription: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		marginBottom: 32,
		lineHeight: 24
	},
	createButton: {
		backgroundColor: "#000",
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderRadius: 12,
		marginTop: 8
	},
	createButtonIcon: {
		marginRight: 8
	},
	createButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600"
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0"
	},
	title: {
		fontSize: 24,
		fontWeight: "bold"
	},
	addButton: {
		backgroundColor: "#000",
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center"
	},
	listContainer: {
		padding: 16
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "600"
	},
	templateBadge: {
		backgroundColor: "#e0e0e0",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4
	},
	templateText: {
		fontSize: 12,
		color: "#666"
	},
	cardDescription: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8
	},
	cardDate: {
		fontSize: 12,
		color: "#999"
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	},
	errorText: {
		fontSize: 16,
		color: "#666",
		marginBottom: 16
	},
	retryButton: {
		backgroundColor: "#000",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8
	},
	retryButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "500"
	}
});
