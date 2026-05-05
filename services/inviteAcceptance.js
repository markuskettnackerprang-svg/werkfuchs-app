import { supabase } from "./supabaseClient";

export async function acceptWorkshopInvite(token) {
  const cleanToken = String(token || "")
    .replace(/\s/g, "")
    .trim();

  console.log("ACCEPT TOKEN RAW:", token);
  console.log("ACCEPT TOKEN CLEAN:", cleanToken);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Nicht eingeloggt");
  }

  const { data: invite, error: inviteError } = await supabase
    .from("workshop_invites")
    .select("*")
    .eq("token", cleanToken)
    .single();

  if (inviteError || !invite) {
    throw new Error(
      "Einladung ungültig: " +
        (inviteError?.message || "Kein Datensatz gefunden")
    );
  }

  if (invite.accepted_at) {
    throw new Error("Einladung bereits verwendet");
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    throw new Error("Einladung abgelaufen");
  }

  const { data: existing } = await supabase
    .from("workshop_members")
    .select("role")
    .eq("workshop_id", invite.workshop_id)
    .eq("user_id", user.id)
    .maybeSingle();

  const rolePriority = {
    owner: 2,
    member: 1,
  };

  let finalRole = invite.role;

  if (existing) {
    const currentRole = existing.role;

    if (rolePriority[currentRole] >= rolePriority[invite.role]) {
      finalRole = currentRole;
    }
  }

  const { error: memberError } = await supabase
    .from("workshop_members")
    .upsert(
      {
        workshop_id: invite.workshop_id,
        user_id: user.id,
        role: finalRole,
      },
      {
        onConflict: "workshop_id,user_id",
      }
    );

  if (memberError) {
    throw new Error(
      "workshop_members UPSERT: " +
        (memberError.message || JSON.stringify(memberError))
    );
  }

  const { error: updateError } = await supabase
    .from("workshop_invites")
    .update({
      accepted_at: new Date().toISOString(),
      accepted_by: user.id,
      status: "accepted",
    })
    .eq("id", invite.id);

  if (updateError) {
    throw new Error(
      "workshop_invites UPDATE: " +
        (updateError.message || JSON.stringify(updateError))
    );
  }

  return invite;
}