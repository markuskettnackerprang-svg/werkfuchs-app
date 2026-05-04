import { supabase } from "./supabaseClient";

export async function createWorkshopInvite({
  workshopId,
  email,
  role = "member",
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Nicht eingeloggt");
  }

  const { data, error } = await supabase
    .from("workshop_invites")
    .insert({
      workshop_id: workshopId,
      email: email.trim().toLowerCase(),
      role,
      invited_by: user.id,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}