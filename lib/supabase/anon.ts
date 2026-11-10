import { createClient } from "@supabase/supabase-js";

// 공개(익명) 클라이언트 — 세션 없음. 학생/학부모 제출(INSERT)에만 사용.
// 접근 권한은 DB의 RLS 정책이 통제한다.
export function getSupabaseAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase 환경변수가 없습니다. parah-app/.env.local에 NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_ANON_KEY 를 설정해 주세요."
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
