"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f-]{36}$/i;

export async function updateProfile(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 40);
  const initialsRaw = String(formData.get("initials") ?? "").trim().slice(0, 2);
  const initials = initialsRaw ? initialsRaw.toUpperCase() : null;
  const emojiRaw = String(formData.get("emoji") ?? "").trim();
  const emoji = emojiRaw ? emojiRaw.slice(0, 4) : null;
  const profileIdRaw = String(formData.get("profile_id") ?? "").trim();
  const profileId = UUID_RE.test(profileIdRaw) ? profileIdRaw : null;

  if (!name) {
    redirect(
      `/m/perfil?error=nome-obrigatorio${profileId ? `&profile_id=${profileId}` : ""}`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/m/login");

  // Resolve target: explicit profile_id OR fall back to self
  let targetId = profileId;
  if (!targetId) {
    const { data: self } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    targetId = self?.id ?? null;
  }
  if (!targetId) redirect("/m/perfil?error=perfil-nao-encontrado");

  // Defense in depth — RLS also enforces is_profile_managed_by_uid
  const { data: allowed } = await supabase.rpc("is_profile_managed_by_uid", {
    profile_id: targetId,
  });
  if (!allowed) redirect("/m/perfil?error=acesso-negado");

  const { error } = await supabase
    .from("profiles")
    .update({ name, initials, emoji })
    .eq("id", targetId);

  if (error) {
    console.error("updateProfile failed", error);
    redirect(
      `/m/perfil?error=nao-foi-possivel-salvar${profileId ? `&profile_id=${profileId}` : ""}`,
    );
  }

  revalidatePath("/m/perfil");
  revalidatePath("/m/familia");
  revalidatePath("/ranking");
  revalidatePath(`/${targetId}`);
  redirect(`/m/perfil?saved=1${profileId ? `&profile_id=${profileId}` : ""}`);
}
