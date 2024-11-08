// src/types/formdata.ts
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export interface ProfileFormData {
	first_name: string;
	last_name: string;
	height: string;
	weight: string;
	date_of_birth: Date | string;
	goals: string;
	experience_level: ExperienceLevel;
}

export interface SignUpFormData {
	email: string;
	password: string;
	confirmPassword: string;
	username: string;
	firstName: string;
	lastName: string;
	date_of_birth: Date;
}
