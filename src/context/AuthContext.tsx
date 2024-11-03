// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { User } from "../types/auth";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	initialized: boolean;
	signOut: () => Promise<void>;
	updateUser: (updates: Partial<User>) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (
		email: string,
		password: string,
		userData: Partial<User>
	) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(false);
	const [initialized, setInitialized] = useState(false);

	async function fetchUserProfile(userId: string) {
		try {
			setLoading(true);

			// First check if the session is valid
			const {
				data: { session }
			} = await supabase.auth.getSession();
			if (!session) {
				setUser(null);
				return;
			}

			const { data, error } = await supabase
				.from("users")
				.select("*")
				.eq("id", userId)
				.single();

			if (error) {
				if (error.code === "PGRST116") {
					// Record not found
					console.log("User profile not found");
					setUser(null);
				} else {
					console.error("Profile fetch error:", error);
					throw error;
				}
			} else {
				setUser(data);
			}
		} catch (error) {
			console.error("Error fetching user profile:", error);
			setUser(null);
		} finally {
			setLoading(false);
		}
	}

	async function signUp(
		email: string,
		password: string,
		userData: Partial<User>
	): Promise<void> {
		try {
			setLoading(true);
			const {
				data: { user: authUser },
				error: signUpError
			} = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: userData
				}
			});

			if (signUpError) throw signUpError;
			if (!authUser) throw new Error("No user returned from sign up");

			// Create user profile
			const { error: profileError } = await supabase.from("users").insert([
				{
					id: authUser.id,
					email,
					...userData,
					is_active: true
				}
			]);

			if (profileError) throw profileError;

			// Don't return anything (void)
		} catch (error) {
			console.error("SignUp error:", error);
			throw error;
		} finally {
			setLoading(false);
		}
	}

	async function signIn(email: string, password: string) {
		try {
			setLoading(true);
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (error) throw error;
		} catch (error) {
			console.error("SignIn error:", error);
			throw error;
		} finally {
			setLoading(false);
		}
	}

	async function signOut() {
		try {
			setLoading(true);
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			setUser(null);
		} catch (error) {
			console.error("Error signing out:", error);
			Alert.alert("Error", "An error occurred while signing out");
		} finally {
			setLoading(false);
		}
	}

	async function updateUser(updates: Partial<User>) {
		try {
			setLoading(true);

			if (!user) throw new Error("No user logged in");

			const { data, error } = await supabase
				.from("users")
				.update(updates)
				.eq("id", user.id)
				.select()
				.single();

			if (error) throw error;
			setUser(data);
		} catch (error) {
			console.error("Error updating user:", error);
			throw error;
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		let mounted = true;

		// Check current session
		const checkSession = async () => {
			try {
				const {
					data: { session }
				} = await supabase.auth.getSession();
				if (session?.user && mounted) {
					await fetchUserProfile(session.user.id);
				} else {
					setUser(null);
				}
			} catch (error) {
				console.error("Session check error:", error);
				setUser(null);
			} finally {
				if (mounted) {
					setInitialized(true);
					setLoading(false);
				}
			}
		};

		checkSession();

		// Listen for auth changes
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (mounted) {
				if (session?.user) {
					await fetchUserProfile(session.user.id);
				} else {
					setUser(null);
					setLoading(false);
				}
			}
		});

		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
	}, []);
	const value = {
		user,
		loading,
		initialized,
		signIn,
		signUp,
		signOut,
		updateUser
	};

	return (
		<AuthContext.Provider value={value}>
			{initialized ? children : null}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
