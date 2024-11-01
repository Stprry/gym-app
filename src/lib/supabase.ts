import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

const supabaseUrl = "https://xpgywavmpznizwzaeemh.supabase.co";
const supabaseAnonKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwZ3l3YXZtcHpuaXp3emFlZW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk5NDk1NDIsImV4cCI6MjA0NTUyNTU0Mn0.B6oAabCD3MUWgl7Mak_dyCrTntm2eNf70YaJ5qzQKRw";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false
	}
});
