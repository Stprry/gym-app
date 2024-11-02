export const usernameTaken: string = "23505";

export type SupabaseErrorCode =
	| "user_already_exists"
	| "invalid_password"
	| "invalid_email"
	| "invalid_credentials"
	| "email_not_confirmed"
	| string;
