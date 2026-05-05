import { supabase } from "./supabaseClient";

export async function acceptWorkshopInvite(token) {

  const cleanToken = String(token || "").trim();

  console.log("ACCEPT TOKEN RAW:", token);
  console.log("ACCEPT TOKEN CLEAN:", cleanToken);
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
    .eq("token", cleanToken)
    .single();

  if (inviteError || !invite) {
    console.log("INVITE LOOKUP ERROR:", inviteError);
    console.log("INVITE LOOKUP TOKEN:", cleanToken);

    throw new Error(
      "Einladung ungültig: " +
        (inviteError?.message || "Kein Datensatz gefunden") +
        " | Token: " +
        cleanToken
    );
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
    console.log("FEHLER BEI workshop_members INSERT:", insertError);
    throw new Error(
        "workshop_members INSERT: " +
        (insertError.message || JSON.stringify(insertError))
    );
    }

  // Einladung aktualisieren
  const { error: updateError } = await supabase
  .from("workshop_invites")
  .update({
      accepted_at: new Date().toISOString(),
      accepted_by: user.id,
      status: "accepted",
    })
    .eq("id", invite.id);

   if (updateError) {
    console.log("FEHLER BEI workshop_invites UPDATE:", updateError);
    throw new Error(
        "workshop_invites UPDATE: " +
        (updateError.message || JSON.stringify(updateError))
    );
    }
  return invite;
}