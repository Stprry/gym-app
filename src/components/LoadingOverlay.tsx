// src/components/LoadingOverlay.tsx
import React from "react";
import {
	ActivityIndicator,
	StyleSheet,
	View,
	Text,
	Platform
} from "react-native";

interface LoadingOverlayProps {
	visible: boolean;
	message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
	visible,
	message = "Loading..."
}) => {
	if (!visible) return null;

	return (
		<View style={styles.container}>
			<View style={styles.overlay}>
				<ActivityIndicator size="large" color="#fff" />
				{message && <Text style={styles.message}>{message}</Text>}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		zIndex: 999
	},
	overlay: {
		backgroundColor: "rgba(0, 0, 0, 0.8)",
		padding: 20,
		borderRadius: 8,
		alignItems: "center",
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.25,
				shadowRadius: 4
			},
			android: {
				elevation: 5
			}
		})
	},
	message: {
		marginTop: 10,
		color: "#fff",
		fontSize: 16,
		textAlign: "center"
	}
});
