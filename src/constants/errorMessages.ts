import { SupabaseErrorCode } from "./errorCodes";

export const ERROR_MESSAGES: Record<SupabaseErrorCode, string> = {
	user_already_exists:
		"An account with this email already exists. Would you like to sign in instead?",
	invalid_password: "Please check your password and try again",
	invalid_email: "Please enter a valid email address",
	invalid_credentials: "Incorrect email or password",
	email_not_confirmed: "Please confirm your email address",
	default: "An error occurred. Please try again."
};
