import React, { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { AuthContextType, AuthState, User } from "../types/auth";

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<AuthState>({
		user: null,
		session: null,
		loading: true
	});

	useEffect(() => {
		// Check initial auth state
		checkUser();

		// Set up auth state listener
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (session?.user) {
				const { data: user, error } = await supabase
					.from("users")
					.select("*")
					.eq("id", session.user.id)
					.single();

				setState((current) => ({
					...current,
					session,
					user: error ? null : user,
					loading: false
				}));
			} else {
				setState((current) => ({
					...current,
					user: null,
					session: null,
					loading: false
				}));
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	async function checkUser() {
		try {
			const {
				data: { session }
			} = await supabase.auth.getSession();
			if (session?.user) {
				const { data: user, error } = await supabase
					.from("users")
					.select("*")
					.eq("id", session.user.id)
					.single();

				setState({
					session,
					user: error ? null : user,
					loading: false
				});
			} else {
				setState((current) => ({
					...current,
					loading: false
				}));
			}
		} catch (error) {
			setState((current) => ({
				...current,
				loading: false
			}));
		}
	}

	async function signUp(
		email: string,
		password: string,
		userData: Partial<User>
	) {
		try {
			const {
				data: { user: authUser },
				error: signUpError
			} = await supabase.auth.signUp({
				email,
				password
			});

			if (signUpError) throw signUpError;
			if (!authUser) throw new Error("No user returned from sign up");

			// Create user profile
			const { data: profile, error: profileError } = await supabase
				.from("users")
				.insert([
					{
						id: authUser.id,
						email,
						...userData,
						is_active: true
					}
				])
				.select()
				.single();

			if (profileError) throw profileError;

			setState((current) => ({
				...current,
				user: profile
			}));
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "An error occurred during sign up";
			Alert.alert("Error", message);
			throw error;
		}
	}

	async function signIn(email: string, password: string) {
		try {
			const {
				data: { user: authUser },
				error: signInError
			} = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (signInError) throw signInError;
			if (!authUser) throw new Error("No user returned from sign in");

			const { data: profile, error: profileError } = await supabase
				.from("users")
				.select("*")
				.eq("id", authUser.id)
				.single();

			if (profileError) throw profileError;

			setState((current) => ({
				...current,
				user: profile
			}));
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "An error occurred during sign in";
			Alert.alert("Error", message);
			throw error;
		}
	}

	async function signOut() {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;

			setState((current) => ({
				...current,
				user: null,
				session: null
			}));
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "An error occurred during sign out";
			Alert.alert("Error", message);
			throw error;
		}
	}

	async function updateUser(updates: Partial<User>) {
		try {
			if (!state.user) throw new Error("No user logged in");

			const { data, error } = await supabase
				.from("users")
				.update(updates)
				.eq("id", state.user.id)
				.select()
				.single();

			if (error) throw error;

			setState((current) => ({
				...current,
				user: data
			}));
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "An error occurred while updating user";
			Alert.alert("Error", message);
			throw error;
		}
	}

	return (
		<AuthContext.Provider
			value={{
				...state,
				signUp,
				signIn,
				signOut,
				updateUser
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
