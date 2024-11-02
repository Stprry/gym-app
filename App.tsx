// App.tsx
import "react-native-url-polyfill/auto";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from "react-native";
import { Home, Activity, User } from "lucide-react-native";

// Import screens
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import WorkoutDetailScreen from "./src/screens/WorkoutDetailScreen";
import AddWorkoutScreen from "./src/screens/AddWorkoutScreen";
import ExerciseDetailScreen from "./src/screens/ExerciseDetailScreen";
import AddExerciseScreen from "./src/screens/AddExerciseScreen";

// Import auth context and provider
import { AuthProvider } from "./src/context/AuthContext";
import { useAuth } from "./src/hooks/useAuth";

// Import types
import {
	MainTabParamList,
	RootStackParamList,
	AuthStackParamList,
	MainStackParamList
} from "./src/types/navigation";

//Import components
import { LoadingOverlay } from "./src/components/LoadingOverlay";
import Toast from "react-native-toast-message";

// Create navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Auth navigator
function AuthNavigator() {
	return (
		<AuthStack.Navigator screenOptions={{ headerShown: false }}>
			<AuthStack.Screen name="SignIn" component={SignInScreen} />
			<AuthStack.Screen name="SignUp" component={SignUpScreen} />
		</AuthStack.Navigator>
	);
}

// Tab navigator
function TabNavigator() {
	return (
		<Tab.Navigator
			screenOptions={{
				tabBarActiveTintColor: "#000",
				tabBarInactiveTintColor: "#666",
				tabBarStyle: {
					borderTopWidth: 1,
					borderTopColor: "#e0e0e0",
					paddingBottom: 5,
					paddingTop: 5
				},
				headerShown: false
			}}
		>
			<Tab.Screen
				name="Home"
				component={HomeScreen}
				options={{
					tabBarIcon: ({ color, size }) => <Home size={size} color={color} />
				}}
			/>
			{/* <Tab.Screen
				name="Progress"
				component={HomeScreen} // Temporarily using HomeScreen
				options={{
					tabBarIcon: ({ color, size }) => (
						<Activity size={size} color={color} />
					)
				}}
			/> */}
			<Tab.Screen
				name="Profile"
				component={ProfileScreen}
				options={{
					tabBarIcon: ({ color, size }) => <User size={size} color={color} />
				}}
			/>
		</Tab.Navigator>
	);
}

// Main navigator
function MainNavigator() {
	return (
		<MainStack.Navigator>
			<MainStack.Screen
				name="MainTabs"
				component={TabNavigator}
				options={{ headerShown: false }}
			/>
			<MainStack.Screen
				name="WorkoutDetail"
				component={WorkoutDetailScreen}
				options={{ title: "Workout Details" }}
			/>
			<MainStack.Screen
				name="AddWorkout"
				component={AddWorkoutScreen}
				options={{
					title: "Create Workout",
					presentation: "modal"
				}}
			/>
			<MainStack.Screen
				name="ExerciseDetail"
				component={ExerciseDetailScreen}
				options={{ title: "Exercise Details" }}
			/>
			<MainStack.Screen
				name="AddExercise"
				component={AddExerciseScreen}
				options={{
					title: "Add Exercise",
					presentation: "modal"
				}}
			/>
		</MainStack.Navigator>
	);
}

// Root navigator with auth state handling

function RootNavigator() {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<LoadingOverlay visible={true} message="Checking authentication..." />
		);
	}

	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			{user ? (
				<Stack.Screen name="MainStack" component={MainNavigator} />
			) : (
				<Stack.Screen name="AuthStack" component={AuthNavigator} />
			)}
		</Stack.Navigator>
	);
}

// Main App component
export default function App() {
	return (
		<AuthProvider>
			<NavigationContainer>
				<RootNavigator />
				<Toast />
			</NavigationContainer>
		</AuthProvider>
	);
}
