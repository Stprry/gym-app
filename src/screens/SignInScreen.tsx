// src/screens/SignInScreen.tsx
import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { supabase } from "../lib/supabase";
import { AuthStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<AuthStackParamList, "SignIn">;

export default function SignInScreen({ navigation }: Props) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSignIn = async () => {
		if (loading) return;

		// Basic validation
		if (!email || !password) {
			Alert.alert("Error", "Please fill in all fields");
			return;
		}

		try {
			setLoading(true);

			const { data, error } = await supabase.auth.signInWithPassword({
				email: email.trim(),
				password: password
			});

			if (error) {
				throw error;
			}

			// Check if user profile exists in users table
			const { data: profile, error: profileError } = await supabase
				.from("users")
				.select("*")
				.eq("id", data.user?.id)
				.single();

			if (profileError) {
				// If profile doesn't exist, create one
				const { error: insertError } = await supabase.from("users").insert([
					{
						id: data.user?.id,
						email: email.trim(),
						username: email.split("@")[0], // Default username from email
						role: "client", // Default role
						is_active: true
					}
				]);

				if (insertError) throw insertError;
			}
		} catch (error) {
			if (error instanceof Error) {
				Alert.alert("Error", error.message);
			} else {
				Alert.alert("Error", "An unexpected error occurred");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
		>
			<ScrollView
				contentContainerStyle={styles.scrollContainer}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.content}>
					<Text style={styles.title}>Welcome Back</Text>
					<Text style={styles.subtitle}>Sign in to continue</Text>

					<View style={styles.form}>
						<View style={styles.inputContainer}>
							<Text style={styles.label}>Email</Text>
							<TextInput
								style={styles.input}
								placeholder="Enter your email"
								value={email}
								onChangeText={setEmail}
								autoCapitalize="none"
								keyboardType="email-address"
								autoComplete="email"
								editable={!loading}
							/>
						</View>

						<View style={styles.inputContainer}>
							<Text style={styles.label}>Password</Text>
							<TextInput
								style={styles.input}
								placeholder="Enter your password"
								value={password}
								onChangeText={setPassword}
								secureTextEntry
								autoCapitalize="none"
								autoComplete="password"
								editable={!loading}
							/>
						</View>

						<TouchableOpacity
							onPress={() => navigation.navigate("ForgotPassword")}
							style={styles.forgotPassword}
						>
							<Text style={styles.forgotPasswordText}>Forgot Password?</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.button, loading && styles.buttonDisabled]}
							onPress={handleSignIn}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color="#FFFFFF" />
							) : (
								<Text style={styles.buttonText}>Sign In</Text>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => navigation.navigate("SignUp")}
							style={styles.linkButton}
							disabled={loading}
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
		padding: 24,
		justifyContent: "center"
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
	inputContainer: {
		gap: 8
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: "#333"
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		padding: 16,
		borderRadius: 12,
		fontSize: 16,
		backgroundColor: "#fafafa"
	},
	forgotPassword: {
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
