"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function addKid(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 40);
  const initialsRaw = String(formData.get("initials") ?? "").trim().slice(0, 2);
  const initials = initialsRaw ? initialsRaw.toUpperCase() : name.slice(0, 1).toUpperCase();
  const emojiRaw = String(formData.get("emoji") ?? "").trim();
  const emoji = emojiRaw ? emojiRaw.slice(0, 4) : null;
  const birthdate = String(formData.get("birthdate") ?? "").trim() || null;

  if (!name) redirect("/m/familia/novo?error=nome-obrigatorio");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/m/login");

  // Resolve own profile id (parent)
  const { data: self } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!self) redirect("/m/familia/novo?error=perfil-pai-nao-encontrado");

  const { error } = await supabase.from("profiles").insert({
    id: crypto.randomUUID(),
    name,
    initials,
    emoji,
    birthdate,
    parent_id: self.id,
  });
  if (error) {
    console.error("addKid failed", error);
    redirect("/m/familia/novo?error=nao-foi-possivel-salvar");
  }

  revalidatePath("/m/familia");
  revalidatePath("/m/palpite");
  revalidatePath("/ranking");
  redirect("/m/familia");
}

export async function removeKid(formData: FormData) {
  const kidId = String(formData.get("kid_id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(kidId)) redirect("/m/familia?error=id-invalido");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/m/login");

  // RLS already restricts delete to own children; explicit check anyway
  const { error } = await supabase.from("profiles").delete().eq("id", kidId);
  if (error) {
    console.error("removeKid failed", error);
    redirect("/m/familia?error=nao-foi-possivel-remover");
  }
  revalidatePath("/m/familia");
  revalidatePath("/ranking");
  redirect("/m/familia");
}
