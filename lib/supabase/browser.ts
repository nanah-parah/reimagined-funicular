import { createBrowserClient } from "@supabase/ssr";

// 브라우저용 클라이언트 — 관리자 로그인 화면에서 사용.
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
