import "server-only";

import { createClient } from "@/lib/supabase/server";

const UNAUTHORIZED_MESSAGE = "Bu amal uchun admin ruxsati talab qilinadi";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(UNAUTHORIZED_MESSAGE);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    throw new Error(UNAUTHORIZED_MESSAGE);
  }

  return { supabase, user };
}
