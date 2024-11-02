// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "../types/auth";

export function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

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

	return { user, loading };
}
