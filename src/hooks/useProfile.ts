import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Database } from "../types/supabase";

type Profile = Database["public"]["Tables"]["users"]["Row"];

export const useProfile = (userId: string) => {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchProfile();
	}, [userId]);

	const fetchProfile = async () => {
		try {
			const { data, error: profileError } = await supabase
				.from("users")
				.select("*")
				.eq("id", userId)
				.single();

			if (profileError) throw profileError;
			setProfile(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	const updateProfile = async (updates: Partial<Profile>) => {
		try {
			const { data, error } = await supabase
				.from("users")
				.update(updates)
				.eq("id", userId)
				.select()
				.single();

			if (error) throw error;
			setProfile(data);
			return data;
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
			throw err;
		}
	};

	return { profile, loading, error, updateProfile, refetch: fetchProfile };
};
