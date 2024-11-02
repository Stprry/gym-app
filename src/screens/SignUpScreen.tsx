import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types/navigation";
import { supabase } from "../lib/supabase";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { usernameTaken } from "../constants/errorCodes";
import { FormInput } from "../components/FormInput";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export default function SignUpScreen({ navigation }: Props) {
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		username: "",
		firstName: "",
		lastName: ""
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

	const handleSignUp = async () => {
		if (submitting) return;

		// Validation
		if (!formData.email || !formData.password || !formData.username) {
			Alert.alert("Error", "Please fill in all required fields");
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			Alert.alert("Error", "Passwords do not match");
			return;
		}

		try {
			setSubmitting(true);

			const {
				data: { user: authUser },
				error: signUpError
			} = await supabase.auth.signUp({
				email: formData.email.trim(),
				password: formData.password,
				options: {
					data: {
						username: formData.username,
						first_name: formData.firstName,
						last_name: formData.lastName
					}
				}
			});
			if (signUpError) {
				// Handle specific auth errors
				if (signUpError.message === "User already registered") {
					Alert.alert(
						"Account Exists",
						"An account with this email already exists. Would you like to sign in instead?",
						[
							{
								text: "Cancel",
								style: "cancel"
							},
							{
								text: "Sign In",
								onPress: () => navigation.navigate("SignIn")
							}
						]
					);
					return;
				}
				throw signUpError;
			}

			if (!authUser) throw new Error("No user returned from sign up");

			const { error: profileError } = await supabase.from("users").insert([
				{
					id: authUser.id,
					email: formData.email.trim(),
					username: formData.username,
					first_name: formData.firstName,
					last_name: formData.lastName,
					role: "client",
					is_active: true
				}
			]);

			if (profileError) {
				// Handle specific profile creation errors
				if (profileError.code === usernameTaken) {
					// Unique constraint error
					Alert.alert(
						"Username Taken",
						"This username is already taken. Please choose another one."
					);
					return;
				}
				throw profileError;
			}

			Alert.alert("Success", "Account created successfully!", [
				{ text: "OK", onPress: () => navigation.navigate("SignIn") }
			]);
		} catch (error) {
			console.error("SignUp error:", error);
			console.error("SignUp error:", error);

			// Handle known error types
			if (error instanceof Error) {
				const errorCode = (error as any).code;
				const errorMessage =
					ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default;

				Alert.alert("Error", errorMessage);
			} else {
				Alert.alert("Error", ERROR_MESSAGES.default);
			}
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
								value={formData.firstName}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, firstName: text }))
								}
								editable={!submitting}
							/>

							<FormInput
								label="Last Name"
								containerStyle={styles.halfWidth}
								value={formData.lastName}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, lastName: text }))
								}
								editable={!submitting}
							/>
						</View>

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
	}
});
