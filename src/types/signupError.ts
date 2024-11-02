export type SignUpErrorType = {
	[key: string]: string;
	user_already_exists: string;
	invalid_email: string;
	weak_password: string;
	default: string;
};
