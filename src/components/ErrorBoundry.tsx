// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return (
				<View style={styles.container}>
					<Text style={styles.title}>Something went wrong</Text>
					<TouchableOpacity
						style={styles.button}
						onPress={() => this.setState({ hasError: false })}
					>
						<Text style={styles.buttonText}>Try again</Text>
					</TouchableOpacity>
				</View>
			);
		}

		return this.props.children;
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20
	},
	title: {
		fontSize: 20,
		marginBottom: 20
	},
	button: {
		backgroundColor: "#000",
		padding: 15,
		borderRadius: 8
	},
	buttonText: {
		color: "#fff",
		fontSize: 16
	}
});
