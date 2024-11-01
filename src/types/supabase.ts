// src/types/supabase.ts
export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export interface Database {
	public: {
		Tables: {
			users: {
				Row: {
					id: string;
					email: string;
					username: string;
					first_name: string | null;
					last_name: string | null;
					role: "client" | "coach";
					profile_image_url: string | null;
					height: number | null;
					weight: number | null;
					date_of_birth: string | null;
					goals: string | null;
					experience_level: "beginner" | "intermediate" | "advanced" | null;
					is_active: boolean;
					last_login: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					email: string;
					username: string;
					first_name?: string | null;
					last_name?: string | null;
					role: "client" | "coach";
					profile_image_url?: string | null;
					height?: number | null;
					weight?: number | null;
					date_of_birth?: string | null;
					goals?: string | null;
					experience_level?: "beginner" | "intermediate" | "advanced" | null;
					is_active?: boolean;
					last_login?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					email?: string;
					username?: string;
					first_name?: string | null;
					last_name?: string | null;
					role?: "client" | "coach";
					profile_image_url?: string | null;
					height?: number | null;
					weight?: number | null;
					date_of_birth?: string | null;
					goals?: string | null;
					experience_level?: "beginner" | "intermediate" | "advanced" | null;
					is_active?: boolean;
					last_login?: string | null;
					created_at?: string;
				};
			};
			workout_plans: {
				Row: {
					id: string;
					created_by_id: string;
					name: string;
					description: string | null;
					is_template: boolean;
					created_at: string;
				};
				Insert: {
					id?: string;
					created_by_id: string;
					name: string;
					description?: string | null;
					is_template?: boolean;
					created_at?: string;
				};
				Update: {
					id?: string;
					created_by_id?: string;
					name?: string;
					description?: string | null;
					is_template?: boolean;
					created_at?: string;
				};
			};
			exercises: {
				Row: {
					id: string;
					template_id: string | null;
					name: string;
					notes: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					template_id?: string | null;
					name: string;
					notes?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					template_id?: string | null;
					name?: string;
					notes?: string | null;
					created_at?: string;
				};
			};
			rpe: {
				Row: {
					id: string;
					rpe_value: number;
					notes: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					rpe_value: number;
					notes?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					rpe_value?: number;
					notes?: string | null;
					created_at?: string;
				};
			};
			sets: {
				Row: {
					id: string;
					exercise_rpe_user_id: string;
					reps: number;
					weight: number;
					set_number: number;
					notes: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					exercise_rpe_user_id: string;
					reps: number;
					weight: number;
					set_number: number;
					notes?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					exercise_rpe_user_id?: string;
					reps?: number;
					weight?: number;
					set_number?: number;
					notes?: string | null;
					created_at?: string;
				};
			};
			exercise_rpe_user: {
				Row: {
					id: string;
					user_id: string;
					exercise_id: string;
					workout_id: string;
					target_rpe_id: string;
					actual_rpe_id: string | null;
					assigned_at: string;
					exercise_date: string | null;
					completed: boolean;
					notes: string | null;
				};
				Insert: {
					id?: string;
					user_id: string;
					exercise_id: string;
					workout_id: string;
					target_rpe_id: string;
					actual_rpe_id?: string | null;
					assigned_at?: string;
					exercise_date?: string | null;
					completed?: boolean;
					notes?: string | null;
				};
				Update: {
					id?: string;
					user_id?: string;
					exercise_id?: string;
					workout_id?: string;
					target_rpe_id?: string;
					actual_rpe_id?: string | null;
					assigned_at?: string;
					exercise_date?: string | null;
					completed?: boolean;
					notes?: string | null;
				};
			};
		};
	};
}

// You can then use these types to create more specific types
export type Tables = Database["public"]["Tables"];
export type RPERow = Tables["rpe"]["Row"];
export type ExerciseRow = Tables["exercises"]["Row"];
export type WorkoutPlanRow = Tables["workout_plans"]["Row"];
export type UserRow = Tables["users"]["Row"];
export type SetRow = Tables["sets"]["Row"];
export type ExerciseRPEUserRow = Tables["exercise_rpe_user"]["Row"];
