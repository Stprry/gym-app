// src/screens/SignInScreen.tsx
import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types/navigation";
import { supabase } from "../lib/supabase";
import { FormInput } from "../components/FormInput";
import { LoadingOverlay } from "../components/LoadingOverlay";

type Props = NativeStackScreenProps<AuthStackParamList, "SignIn">;

type SignInError =
	| "invalid_credentials"
	| "invalid_email"
	| "email_not_confirmed"
	| string;

const ERROR_MESSAGES: Record<SignInError, string> = {
	invalid_credentials: "Invalid email or password",
	invalid_email: "Please enter a valid email address",
	email_not_confirmed: "Please confirm your email address before signing in",
	default: "An error occurred while signing in"
};

export default function SignInScreen({ navigation, route }: Props) {
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		email: route.params?.email || "",
		password: ""
	});

	const handleSignIn = async () => {
		if (submitting) return;

		// Validation
		if (!formData.email || !formData.password) {
			Alert.alert("Error", "Please fill in all fields");
			return;
		}

		try {
			setSubmitting(true);

			const { data, error } = await supabase.auth.signInWithPassword({
				email: formData.email.trim(),
				password: formData.password
			});

			if (error) {
				const errorCode = (error as any).code as SignInError;
				Alert.alert(
					"Sign In Error",
					ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default
				);
				return;
			}

			// Success is handled by the auth listener in AuthContext
		} catch (error) {
			console.error("SignIn error:", error);
			Alert.alert(
				"Error",
				error instanceof Error ? error.message : ERROR_MESSAGES.default
			);
		} finally {
			setSubmitting(false);
		}
	};

	const handleForgotPassword = () => {
		// Navigation to forgot password screen (if implemented)
		// navigation.navigate('ForgotPassword');
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
		>
			<LoadingOverlay visible={submitting} message="Signing in..." />

			<ScrollView
				contentContainerStyle={styles.scrollContainer}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.content}>
					<Text style={styles.title}>Welcome Back</Text>
					<Text style={styles.subtitle}>Sign in to continue</Text>

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
							editable={!submitting}
							autoComplete="email"
							textContentType="emailAddress"
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
							editable={!submitting}
							autoComplete="password"
							textContentType="password"
						/>

						<TouchableOpacity
							onPress={handleForgotPassword}
							style={styles.forgotPasswordButton}
						>
							<Text style={styles.forgotPasswordText}>Forgot Password?</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.button, submitting && styles.buttonDisabled]}
							onPress={handleSignIn}
							disabled={submitting}
						>
							<Text style={styles.buttonText}>Sign In</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => navigation.navigate("SignUp")}
							style={styles.linkButton}
							disabled={submitting}
						>
							<Text style={styles.linkText}>
								Don't have an account?{" "}
								<Text style={styles.linkTextBold}>Sign Up</Text>
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
	forgotPasswordButton: {
		alignSelf: "flex-end"
	},
	forgotPasswordText: {
		color: "#666",
		fontSize: 14
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
