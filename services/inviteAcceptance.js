import { supabase } from "./supabaseClient";

export async function acceptWorkshopInvite(token) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Nicht eingeloggt");
  }

  // Einladung holen
  const { data: invite, error: inviteError } = await supabase
    .from("workshop_invites")
    .select("*")
    .eq("token", token)
    .single();

  if (inviteError || !invite) {
    throw new Error("Einladung ungültig");
  }

  if (invite.accepted_at) {
    throw new Error("Einladung bereits verwendet");
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    throw new Error("Einladung abgelaufen");
  }

  // User zum Workshop hinzufügen
  const { error: insertError } = await supabase
    .from("workshop_members")
    .insert({
      workshop_id: invite.workshop_id,
      user_id: user.id,
      role: invite.role,
    });

  if (insertError) {
    throw insertError;
  }

  // Einladung aktualisieren
  await supabase
    .from("workshop_invites")
    .update({
      accepted_at: new Date().toISOString(),
      accepted_by: user.id,
      status: "accepted",
    })
    .eq("id", invite.id);

  return invite;
}