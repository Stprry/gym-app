// src/components/FormInput.tsx
import React from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TextInputProps,
	ViewStyle
} from "react-native";

interface FormInputProps extends TextInputProps {
	label: string;
	error?: string;
	containerStyle?: ViewStyle;
	required?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
	label,
	error,
	containerStyle,
	required = false,
	...props
}) => {
	return (
		<View style={[styles.container, containerStyle]}>
			<Text style={styles.label}>
				{label} {required && <Text style={styles.required}>*</Text>}
			</Text>
			<TextInput
				style={[styles.input, error ? styles.inputError : null, props.style]}
				{...props}
			/>
			{error && <Text style={styles.error}>{error}</Text>}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		gap: 8
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: "#333"
	},
	required: {
		color: "#FF3B30"
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		padding: 16,
		borderRadius: 12,
		fontSize: 16,
		backgroundColor: "#fafafa"
	},
	inputError: {
		borderColor: "#FF3B30"
	},
	error: {
		color: "#FF3B30",
		fontSize: 12,
		marginTop: 4
	}
});
