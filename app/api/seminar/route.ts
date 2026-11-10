import { NextResponse } from "next/server";
import { validateSeminar } from "@/lib/seminarSubmission";
import { getSupabaseAnon } from "@/lib/supabase/anon";

// 학부모 강의 사전조사 제출 처리.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "요청 본문을 읽을 수 없습니다." }, { status: 400 });
  }

  const v = validateSeminar(body);
  if (!v.ok) {
    return NextResponse.json({ ok: false, error: v.error }, { status: 400 });
  }

  const a = v.value.answers;
  const str = (id: string) => (typeof a[id] === "string" ? (a[id] as string) : "");

  try {
    const supabase = getSupabaseAnon();
    const { error } = await supabase.from("seminar_responses").insert({
      parent_name: str("parent_name"),
      phone: str("phone"),
      child_name: str("child_name"),
      cafe_nick: str("cafe_nick"),
      track: v.value.track,
      session: str("session"),
      school: v.value.track === "m3" ? str("m3_school") : str("h1_school"),
      answers: v.value.answers,
      others: v.value.others,
    });
    if (error) {
      console.error("[seminar] DB 저장 실패", error);
      return NextResponse.json(
        { ok: false, error: "제출 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("[seminar] Supabase 설정/연결 오류", e);
    return NextResponse.json(
      { ok: false, error: "서버 설정 문제로 제출하지 못했습니다. 관리자에게 문의해 주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
