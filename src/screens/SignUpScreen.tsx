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
import { AuthStackParamList } from "../types/navigation";
import { useAuth } from "../hooks/useAuth";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export default function SignUpScreen({ navigation }: Props) {
	const { signUp } = useAuth();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		username: "",
		firstName: "",
		lastName: ""
	});

	const handleSignUp = async () => {
		if (loading) return;

		// Validation
		if (!formData.email || !formData.password || !formData.username) {
			Alert.alert("Error", "Please fill in all required fields");
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			Alert.alert("Error", "Passwords do not match");
			return;
		}

		if (formData.password.length < 6) {
			Alert.alert("Error", "Password must be at least 6 characters");
			return;
		}

		try {
			setLoading(true);
			await signUp(formData.email, formData.password, {
				username: formData.username,
				first_name: formData.firstName,
				last_name: formData.lastName,
				role: "client"
			});
		} catch (error) {
			// Error is handled in auth context
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
					<Text style={styles.title}>Create Account</Text>
					<Text style={styles.subtitle}>Start your fitness journey</Text>

					<View style={styles.form}>
						<View style={styles.inputContainer}>
							<Text style={styles.label}>Email *</Text>
							<TextInput
								style={styles.input}
								placeholder="Enter your email"
								value={formData.email}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, email: text }))
								}
								autoCapitalize="none"
								keyboardType="email-address"
								editable={!loading}
							/>
						</View>

						<View style={styles.inputContainer}>
							<Text style={styles.label}>Username *</Text>
							<TextInput
								style={styles.input}
								placeholder="Choose a username"
								value={formData.username}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, username: text }))
								}
								autoCapitalize="none"
								editable={!loading}
							/>
						</View>

						<View style={styles.row}>
							<View style={[styles.inputContainer, styles.halfWidth]}>
								<Text style={styles.label}>First Name</Text>
								<TextInput
									style={styles.input}
									placeholder="First name"
									value={formData.firstName}
									onChangeText={(text) =>
										setFormData((prev) => ({ ...prev, firstName: text }))
									}
									editable={!loading}
								/>
							</View>

							<View style={[styles.inputContainer, styles.halfWidth]}>
								<Text style={styles.label}>Last Name</Text>
								<TextInput
									style={styles.input}
									placeholder="Last name"
									value={formData.lastName}
									onChangeText={(text) =>
										setFormData((prev) => ({ ...prev, lastName: text }))
									}
									editable={!loading}
								/>
							</View>
						</View>

						<View style={styles.inputContainer}>
							<Text style={styles.label}>Password *</Text>
							<TextInput
								style={styles.input}
								placeholder="Create a password"
								value={formData.password}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, password: text }))
								}
								secureTextEntry
								autoCapitalize="none"
								editable={!loading}
							/>
						</View>

						<View style={styles.inputContainer}>
							<Text style={styles.label}>Confirm Password *</Text>
							<TextInput
								style={styles.input}
								placeholder="Confirm your password"
								value={formData.confirmPassword}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, confirmPassword: text }))
								}
								secureTextEntry
								autoCapitalize="none"
								editable={!loading}
							/>
						</View>

						<TouchableOpacity
							style={[styles.button, loading && styles.buttonDisabled]}
							onPress={handleSignUp}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color="#FFFFFF" />
							) : (
								<Text style={styles.buttonText}>Create Account</Text>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => navigation.navigate("SignIn")}
							style={styles.linkButton}
							disabled={loading}
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
