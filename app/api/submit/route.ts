import { NextResponse } from "next/server";
import { validateSubmission } from "@/lib/submission";
import { score } from "@/lib/scoring";
import { getSupabaseAnon } from "@/lib/supabase/anon";

// 학생 제출 처리. 채점은 항상 서버에서 권위 있게 재계산하고 DB에 저장한다.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "요청 본문을 읽을 수 없습니다." }, { status: 400 });
  }

  const v = validateSubmission(body);
  if (!v.ok) {
    return NextResponse.json({ ok: false, error: v.error }, { status: 400 });
  }

  const result = score(v.value.answers);

  try {
    const supabase = getSupabaseAnon();
    const { error } = await supabase.from("submissions").insert({
      student_name: v.value.name,
      school: v.value.school,
      grade: v.value.grade,
      answers: v.value.answers,
      dimension_scores: result.scores,
      reliability: result.reliability,
      top_strengths: result.top2,
      top_gaps: result.low2,
      open_answers: v.value.open,
      answered: result.answered,
      total: result.total,
    });
    if (error) {
      console.error("[submit] DB 저장 실패", error);
      return NextResponse.json(
        { ok: false, error: "제출 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("[submit] Supabase 설정/연결 오류", e);
    return NextResponse.json(
      { ok: false, error: "서버 설정 문제로 제출하지 못했습니다. 관리자에게 문의해 주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
