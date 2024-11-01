export interface User {
	id: string;
	email: string;
	username: string;
	first_name?: string;
	last_name?: string;
	role: "client" | "coach";
	profile_image_url?: string;
	height?: number;
	weight?: number;
	date_of_birth?: string;
	goals?: string;
	experience_level?: "beginner" | "intermediate" | "advanced";
	is_active: boolean;
	last_login?: string;
	created_at: string;
}

export interface WorkoutPlan {
	id: string;
	created_by_id: string;
	name: string;
	description?: string;
	is_template: boolean;
	created_at: string;
}

export interface Exercise {
	id: string;
	template_id?: string;
	name: string;
	notes?: string;
	created_at: string;
}

export interface Set {
	id: string;
	exercise_rpe_user_id: string;
	reps: number;
	weight: number;
	set_number: number;
	notes?: string;
	created_at: string;
}

export interface AuthResponse {
	error: Error | null;
	data: {
		user: User | null;
		session: any;
	};
}

export type NavigationParams = {
	AuthStack: undefined;
	MainTabs: undefined;
	SignIn: undefined;
	SignUp: undefined;
	Home: undefined;
	Profile: undefined;
};
