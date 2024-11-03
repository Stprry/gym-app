// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContextType, User } from "../types/auth";

export function useAuth(): AuthContextType {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [initialized, setInitialized] = useState(false);

	async function fetchUserProfile(userId: string) {
		try {
			const { data, error } = await supabase
				.from("users")
				.select("*")
				.eq("id", userId)
				.single();
			if (error) {
				console.error("Profile fetch error:", error);
				throw error;
			}
			setUser(data);
		} catch (error) {
			console.error("Error fetching user profile:", error);
			setUser(null);
		} finally {
			setLoading(false);
		}
	}

	async function signOut() {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			setUser(null);
		} catch (error) {
			console.error("Error signing out:", error);
			throw error;
		}
	}

	async function updateUser(updates: Partial<User>) {
		try {
			if (!user?.id) throw new Error("No user logged in");

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
		}
	}

	useEffect(() => {
		let mounted = true;
		// Check current session
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session?.user && mounted) {
				fetchUserProfile(session.user.id);
			} else {
				setLoading(false);
				setUser(null);
			}
			setInitialized(true);
		});

		// Listen for auth changes
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.user && mounted) {
				fetchUserProfile(session.user.id);
			} else {
				setUser(null);
				setLoading(false);
			}
		});

		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
	}, []);

	return {
		user,
		loading,
		initialized,
		signOut,
		updateUser
	};
}
