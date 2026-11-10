import { NextResponse } from "next/server";
import { validateSubmission } from "@/lib/submission";
import { score } from "@/lib/scoring";
import { scoreV2 } from "@/lib/scoringV2";
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

  const input = v.value;
  // DB 행 (v2 칸은 supabase/migrations/2026-11_v2.sql 로 추가)
  let row: Record<string, unknown>;
  if ("version" in input) {
    const result = scoreV2(input.answers);
    row = {
      version: "v2",
      student_name: input.name,
      school: input.school,
      grade: input.grade,
      school_level: input.schoolLevel,
      guardian_name: input.guardianName,
      guardian_confirmed: input.guardianConfirmed,
      answers: input.answers,
      dimension_scores: result.scores,
      aux_scores: result.aux,
      reliability: result.reliability,
      top_strengths: result.top2,
      top_gaps: result.low2,
      situation: input.situation,
      open_answers: input.open,
      answered: result.answered,
      total: result.total,
    };
  } else {
    const result = score(input.answers);
    row = {
      student_name: input.name,
      school: input.school,
      grade: input.grade,
      answers: input.answers,
      dimension_scores: result.scores,
      reliability: result.reliability,
      top_strengths: result.top2,
      top_gaps: result.low2,
      open_answers: input.open,
      answered: result.answered,
      total: result.total,
    };
  }

  try {
    const supabase = getSupabaseAnon();
    const { error } = await supabase.from("submissions").insert(row);
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
