"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 40);
  const initialsRaw = String(formData.get("initials") ?? "").trim().slice(0, 2);
  const initials = initialsRaw ? initialsRaw.toUpperCase() : null;
  const emojiRaw = String(formData.get("emoji") ?? "").trim();
  const emoji = emojiRaw ? emojiRaw.slice(0, 4) : null;

  if (!name) redirect("/m/perfil?error=nome-obrigatorio");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/m/login");

  const { error } = await supabase
    .from("profiles")
    .update({ name, initials, emoji })
    .eq("id", user.id);

  if (error) {
    console.error("updateProfile failed", error);
    redirect("/m/perfil?error=nao-foi-possivel-salvar");
  }

  revalidatePath("/ranking");
  revalidatePath(`/${user.id}`);
  redirect("/m/perfil?saved=1");
}
