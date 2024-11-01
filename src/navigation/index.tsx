// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import {
// 	RootStackParamList,
// 	AuthStackParamList,
// 	MainStackParamList,
// 	MainTabParamList
// } from "./types";
// import { useAuth } from "../hooks/useAuth";
// import { Home, ActivitySquare, User } from "lucide-react-native";

// const RootStack = createNativeStackNavigator<RootStackParamList>();
// const AuthStack = createNativeStackNavigator<AuthStackParamList>();
// const MainStack = createNativeStackNavigator<MainStackParamList>();
// const MainTab = createBottomTabNavigator<MainTabParamList>();

// export function Navigation() {
// 	const { user, loading } = useAuth();

// 	if (loading) {
// 		return null; // or loading screen
// 	}

// 	return (
// 		<NavigationContainer>
// 			<RootStack.Navigator screenOptions={{ headerShown: false }}>
// 				{user ? (
// 					<RootStack.Screen name="MainStack" component={MainNavigator} />
// 				) : (
// 					<RootStack.Screen name="AuthStack" component={AuthNavigator} />
// 				)}
// 			</RootStack.Navigator>
// 		</NavigationContainer>
// 	);
// }

// // function AuthNavigator() {
// // 	return (
// // 		<AuthStack.Navigator>
// // 			<AuthStack.Screen name="SignIn" component={SignInScreen} />
// // 			<AuthStack.Screen name="SignUp" component={SignUpScreen} />
// // 			<AuthStack.Screen
// // 				name="ForgotPassword"
// // 				component={ForgotPasswordScreen}
// // 			/>
// // 		</AuthStack.Navigator>
// // 	);
// // }

// // function MainNavigator() {
// // 	return (
// // 		<MainStack.Navigator>
// // 			<MainStack.Screen
// // 				name="MainTabs"
// // 				component={TabNavigator}
// // 				options={{ headerShown: false }}
// // 			/>
// // 			<MainStack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
// // 			<MainStack.Screen
// // 				name="ExerciseDetail"
// // 				component={ExerciseDetailScreen}
// // 			/>
// // 			<MainStack.Screen name="AddWorkout" component={AddWorkoutScreen} />
// // 			<MainStack.Screen name="AddExercise" component={AddExerciseScreen} />
// // 		</MainStack.Navigator>
// // 	);
// // }

// // function TabNavigator() {
// //   return (
// //     <MainTab.Navigator>
// //       <MainTab.Screen
// //         name="Home"
// //         component={HomeScreen}
// //         options={{
// //           tabBarIcon: ({ color, size }) => <Home size={size} color={color} />
// //         }}
// //       />
// //       <MainTab.Screen
// //         name="Progress"
// //         component={ProgressScreen}
