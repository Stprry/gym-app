import { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
	Home: undefined;
	Progress: undefined; // Add this
	Profile: undefined;
};

export type RootStackParamList = {
	AuthStack: NavigatorScreenParams<AuthStackParamList>;
	MainStack: NavigatorScreenParams<MainStackParamList>;
};

export type AuthStackParamList = {
	SignIn: { email?: string } | undefined;
	SignUp: undefined;
	ForgotPassword: undefined;
};

export type MainStackParamList = {
	MainTabs: NavigatorScreenParams<MainTabParamList>;
	WorkoutDetail: { workoutId: string };
	ExerciseDetail: { exerciseId: string; workoutId: string };
	AddWorkout: undefined;
	AddExercise: { workoutId: string };
};
