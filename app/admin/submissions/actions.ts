"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export type MemoState = { ok: boolean; message: string };

export async function saveMemo(
  _prev: MemoState,
  formData: FormData
): Promise<MemoState> {
  const id = String(formData.get("id") ?? "");
  const admin_memo = String(formData.get("admin_memo") ?? "").slice(0, 5000);
  const recommendation = String(formData.get("recommendation") ?? "").slice(0, 5000);
  if (!id) return { ok: false, message: "잘못된 요청입니다." };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("submissions")
    .update({ admin_memo, recommendation })
    .eq("id", id);
  if (error) return { ok: false, message: "저장에 실패했습니다: " + error.message };

  revalidatePath(`/admin/submissions/${id}`);
  return { ok: true, message: "저장되었습니다." };
}

export async function deleteSubmission(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin");

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  await supabase.from("submissions").delete().eq("id", id);
  revalidatePath("/admin");
  redirect("/admin");
}
