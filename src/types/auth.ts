import { Database } from "./supabase";

export type User = Database["public"]["Tables"]["users"]["Row"];

export interface AuthState {
	user: User | null;
	session: any | null;
	loading: boolean;
}

export interface AuthContextType extends AuthState {
	signUp: (
		email: string,
		password: string,
		userData: Partial<User>
	) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	updateUser: (updates: Partial<User>) => Promise<void>;
}
