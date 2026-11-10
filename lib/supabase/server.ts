import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 서버용 클라이언트 — 쿠키 기반 세션. 관리자 서버 컴포넌트/서버 액션에서 사용.
// 로그인한 관리자는 authenticated 역할이 되어 RLS의 읽기/수정/삭제 정책이 허용된다.
export async function createSupabaseServer() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // 서버 컴포넌트에서는 쿠키 쓰기가 막혀 예외가 날 수 있다. 세션 갱신은 proxy.ts가 담당하므로 무시.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {}
      },
    },
  });
}
