import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	ScrollView
} from "react-native";
import Toast, {
	BaseToast,
	ErrorToast,
	BaseToastProps
} from "react-native-toast-message";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types/navigation";
import { supabase } from "../lib/supabase";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { SupabaseErrorCode } from "../constants/errorCodes";
import { FormInput } from "../components/FormInput";
import { DatePickerInput } from "../components/DatePickerInput";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

interface SignUpFormData {
	email: string;
	password: string;
	confirmPassword: string;
	username: string;
	first_name: string;
	last_name: string;
	date_of_birth: Date;
	role: "client";
}

const toastConfig = {
	success: (props: BaseToastProps) => (
		<BaseToast
			{...props}
			style={styles.successToast}
			contentContainerStyle={styles.toastContent}
			text1Style={styles.toastTitle}
			text2Style={styles.toastSuccessMessage}
			text2NumberOfLines={3}
		/>
	),
	error: (props: BaseToastProps) => (
		<ErrorToast
			{...props}
			style={styles.errorToast}
			contentContainerStyle={styles.toastContent}
			text1Style={styles.toastTitle}
			text2Style={styles.toastErrorMessage}
			text2NumberOfLines={3}
		/>
	)
};

export default function SignUpScreen({ navigation }: Props) {
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState<SignUpFormData>({
		email: "",
		password: "",
		confirmPassword: "",
		username: "",
		first_name: "",
		last_name: "",
		date_of_birth: new Date(),
		role: "client"
	});

	const validateForm = (): string | null => {
		if (!formData.email || !formData.password || !formData.username) {
			return "Please fill in all required fields";
		}
		if (!formData.email.includes("@") || !formData.email.includes(".")) {
			return "Please enter a valid email address";
		}
		if (formData.password.length < 6) {
			return "Password must be at least 6 characters long";
		}
		if (formData.password !== formData.confirmPassword) {
			return "Passwords do not match";
		}
		if (formData.username.length < 3) {
			return "Username must be at least 3 characters long";
		}
		return null;
	};

	const showToast = (
		type: "success" | "error",
		title: string,
		message?: string,
		onHideCallback?: () => void
	) => {
		Toast.show({
			type,
			text1: title,
			text2: message,
			position: "bottom",
			visibilityTime: 4000,
			autoHide: true,
			topOffset: 30,
			bottomOffset: 40,
			onHide: onHideCallback
		});
	};

	const handleSignUp = async () => {
		if (submitting) return;

		const validationError = validateForm();
		if (validationError) {
			showToast("error", "Validation Error", validationError);
			return;
		}

		try {
			setSubmitting(true);

			// Sign up with Supabase Auth - this will trigger our database function
			const {
				data: { user },
				error: signUpError
			} = await supabase.auth.signUp({
				email: formData.email.trim(),
				password: formData.password,
				options: {
					data: {
						username: formData.username,
						first_name: formData.first_name,
						last_name: formData.last_name,
						role: formData.role,
						date_of_birth: formData.date_of_birth.toISOString(),
						height: null,
						weight: null,
						goals: null,
						experience_level: null,
						profile_image_url: null
					}
				}
			});

			if (signUpError) {
				// Handle specific error cases
				if (signUpError.message?.includes("User already registered")) {
					showToast(
						"error",
						"Account Exists",
						"An account with this email already exists. Please sign in instead.",
						() =>
							navigation.navigate("SignIn", { email: formData.email.trim() })
					);
					return;
				}

				throw signUpError;
			}

			if (!user) {
				throw new Error("No user returned from sign up");
			}

			// Show success message and navigate
			showToast(
				"success",
				"Account Created",
				"Please check your email to verify your account.",
				() => navigation.navigate("SignIn", { email: formData.email.trim() })
			);
		} catch (error) {
			console.error("SignUp error:", error);
			const errorMessage =
				error instanceof Error ? error.message : ERROR_MESSAGES.default;
			showToast("error", "Sign Up Error", errorMessage);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
		>
			<LoadingOverlay visible={submitting} message="Creating your account..." />
			<ScrollView
				contentContainerStyle={styles.scrollContainer}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.content}>
					<Text style={styles.title}>Create Account</Text>
					<Text style={styles.subtitle}>Start your fitness journey</Text>

					<View style={styles.form}>
						<FormInput
							label="Email"
							required
							value={formData.email}
							onChangeText={(text) =>
								setFormData((prev) => ({ ...prev, email: text }))
							}
							autoCapitalize="none"
							keyboardType="email-address"
							error={
								formData.email && !formData.email.includes("@")
									? "Please enter a valid email address"
									: undefined
							}
							editable={!submitting}
						/>

						<FormInput
							label="Username"
							required
							value={formData.username}
							onChangeText={(text) =>
								setFormData((prev) => ({ ...prev, username: text }))
							}
							autoCapitalize="none"
							error={
								formData.username && formData.username.length < 3
									? "Username must be at least 3 characters"
									: undefined
							}
							editable={!submitting}
						/>

						<View style={styles.row}>
							<FormInput
								label="First Name"
								containerStyle={styles.halfWidth}
								value={formData.first_name}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, first_name: text }))
								}
								editable={!submitting}
							/>
							<FormInput
								label="Last Name"
								containerStyle={styles.halfWidth}
								value={formData.last_name}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, last_name: text }))
								}
								editable={!submitting}
							/>
						</View>

						<DatePickerInput
							label="Date of Birth"
							value={formData.date_of_birth}
							onChange={(date) =>
								setFormData((prev) => ({ ...prev, date_of_birth: date }))
							}
							required
							editable={!submitting}
							minDate={new Date(1900, 0, 1)}
							maxDate={new Date()}
						/>

						<FormInput
							label="Password"
							required
							value={formData.password}
							onChangeText={(text) =>
								setFormData((prev) => ({ ...prev, password: text }))
							}
							secureTextEntry
							autoCapitalize="none"
							error={
								formData.password && formData.password.length < 6
									? "Password must be at least 6 characters"
									: undefined
							}
							editable={!submitting}
						/>

						<FormInput
							label="Confirm Password"
							required
							value={formData.confirmPassword}
							onChangeText={(text) =>
								setFormData((prev) => ({ ...prev, confirmPassword: text }))
							}
							secureTextEntry
							autoCapitalize="none"
							error={
								formData.confirmPassword &&
								formData.password !== formData.confirmPassword
									? "Passwords do not match"
									: undefined
							}
							editable={!submitting}
						/>

						<TouchableOpacity
							style={[styles.button, submitting && styles.buttonDisabled]}
							onPress={handleSignUp}
							disabled={submitting}
						>
							<Text style={styles.buttonText}>Create Account</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => navigation.navigate("SignIn")}
							style={styles.linkButton}
							disabled={submitting}
						>
							<Text style={styles.linkText}>
								Already have an account?{" "}
								<Text style={styles.linkTextBold}>Sign In</Text>
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
			<Toast config={toastConfig} position="bottom" bottomOffset={20} />
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff"
	},
	scrollContainer: {
		flexGrow: 1
	},
	content: {
		flex: 1,
		padding: 24
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		marginBottom: 8,
		textAlign: "center"
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		marginBottom: 32,
		textAlign: "center"
	},
	form: {
		gap: 16
	},
	row: {
		flexDirection: "row",
		gap: 12
	},
	halfWidth: {
		flex: 1
	},
	button: {
		backgroundColor: "#000",
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
		marginTop: 8
	},
	buttonDisabled: {
		backgroundColor: "#666"
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600"
	},
	linkButton: {
		alignItems: "center",
		padding: 8
	},
	linkText: {
		color: "#666",
		fontSize: 14
	},
	linkTextBold: {
		fontWeight: "600",
		color: "#000"
	},
	successToast: {
		borderLeftColor: "#4CAF50",
		minHeight: 80,
		width: "90%",
		maxWidth: 350,
		paddingHorizontal: 15
	},
	errorToast: {
		borderLeftColor: "#FF5252",
		minHeight: 80,
		width: "90%",
		maxWidth: 350,
		paddingHorizontal: 15,
		backgroundColor: "#fff"
	},
	toastContent: {
		paddingHorizontal: 15
	},
	toastTitle: {
		fontSize: 16,
		fontWeight: "600"
	},
	toastSuccessMessage: {
		fontSize: 14,
		color: "#4CAF50"
	},
	toastErrorMessage: {
		fontSize: 14,
		color: "#FF5252"
	}
});
