// src/components/FormInput.tsx
import React from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TextInputProps,
	ViewStyle,
	StyleProp
} from "react-native";
import { Lock } from "lucide-react-native"; // Add this import

interface FormInputProps extends TextInputProps {
	label: string;
	error?: string;
	containerStyle?: ViewStyle;
	required?: boolean;
	style?: StyleProp<ViewStyle>;
	leftIcon?: React.ReactNode;
	locked?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
	label,
	error,
	containerStyle,
	required = false,
	locked = false,
	leftIcon,
	style,
	editable,
	...props
}) => {
	return (
		<View style={[styles.container, containerStyle]}>
			<View style={styles.labelContainer}>
				<Text style={[styles.label, locked && styles.lockedLabel]}>
					{label} {required && <Text style={styles.required}>*</Text>}
				</Text>
				{locked && (
					<View style={styles.lockIcon}>
						<Lock size={16} color="#666" />
					</View>
				)}
			</View>
			<View style={styles.inputWrapper}>
				{leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
				<TextInput
					style={[
						styles.input,
						error && styles.inputError,
						!editable && styles.inputDisabled,
						locked && styles.lockedInput,
						style as any // Type assertion to fix style error
					]}
					editable={editable && !locked}
					placeholderTextColor={locked ? "#999" : "#666"}
					{...props}
				/>
			</View>
			{error && <Text style={styles.error}>{error}</Text>}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		gap: 8
	},
	labelContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 8
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: "#333",
		flex: 1
	},
	lockedLabel: {
		color: "#666",
		fontStyle: "italic"
	},
	required: {
		color: "#FF3B30"
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center"
	},
	iconContainer: {
		marginRight: 8
	},
	lockIcon: {
		padding: 4
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#ddd",
		padding: 16,
		borderRadius: 12,
		fontSize: 16,
		backgroundColor: "#fafafa"
	},
	inputDisabled: {
		backgroundColor: "#f5f5f5",
		color: "#666"
	},
	lockedInput: {
		backgroundColor: "#f0f0f0",
		borderStyle: "dashed",
		borderColor: "#ccc",
		color: "#999"
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
