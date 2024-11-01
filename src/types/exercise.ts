// src/types/exercise.ts
import { Database } from "./supabase";

export type RPE = Database["public"]["Tables"]["rpe"]["Row"];
export type Exercise = Database["public"]["Tables"]["exercises"]["Row"];
export type Set = Database["public"]["Tables"]["sets"]["Row"];

export interface SetData {
	id: string;
	reps: number;
	weight: number;
	set_number: number;
}

export interface SetForm {
	id?: string;
	reps: string;
	weight: string;
	set_number: number;
}

export interface ExerciseRPEUser {
	id: string;
	target_rpe_id: string;
	actual_rpe_id: string | null;
	completed: boolean;
	sets: SetData[];
}

export interface ExerciseDetail {
	id: string;
	name: string;
	notes: string | null;
	exercise_rpe_user: ExerciseRPEUser[];
}

export interface ExerciseFormData {
	name: string;
	notes: string;
	targetRPE: string;
	sets: SetForm[];
}
