import { Database } from "./supabase";

export type User = Database["public"]["Tables"]["users"]["Row"];

export interface AuthState {
	user: User | null;
	session: any | null;
	loading: boolean;
}

export interface AuthContextType {
	user: User | null;
	loading: boolean;
	initialized: boolean;
	updateUser: (updates: Partial<User>) => Promise<void>;
	signOut: () => Promise<void>;
}
