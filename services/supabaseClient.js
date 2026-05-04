import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://talhdevjxffrysmmqwhi.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhbGhkZXZqeGZmcnlzbW1xd2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjg1MDYsImV4cCI6MjA5MjkwNDUwNn0.tLVlpgdxw5nOeJOzxYoXE2SijD8on0PlQZFOG7v2NZg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});