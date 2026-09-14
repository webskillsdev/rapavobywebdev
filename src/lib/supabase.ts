import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log("URL:", import.meta.env.VITE_SUPABASE_URL);

console.log("KEY:", supabaseUrl, supabasePublishableKey);

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Missing Supabase environment variables");
}
export const supabase = createClient(supabaseUrl, supabasePublishableKey);
