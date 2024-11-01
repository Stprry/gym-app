// src/hooks/useWorkouts.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Database } from "../types/supabase";

type WorkoutPlan = Database["public"]["Tables"]["workout_plans"]["Row"];
type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

interface WorkoutWithExercises extends WorkoutPlan {
	exercises: Exercise[];
}

export const useWorkouts = (userId: string) => {
	const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchWorkouts();
	}, [userId]);

	const fetchWorkouts = async () => {
		try {
			const { data: workoutPlans, error: workoutError } = await supabase
				.from("workout_plans")
				.select("*")
				.eq("created_by_id", userId);

			if (workoutError) throw workoutError;

			const workoutsWithExercises = await Promise.all(
				workoutPlans.map(async (workout) => {
					const { data: exercises, error: exerciseError } = await supabase
						.from("exercise_rpe_user")
						.select(
							`
              exercises (*)
            `
						)
						.eq("workout_id", workout.id);

					if (exerciseError) throw exerciseError;

					return {
						...workout,
						exercises: exercises.map((e) => e.exercises)
					};
				})
			);

			setWorkouts(workoutsWithExercises);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return { workouts, loading, error, refetch: fetchWorkouts };
};
