import { notFound, redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { INTERP, OPEN_QUESTIONS } from "@/lib/questions";
import { bandLabel, reliabilityText, type Band } from "@/lib/scoring";
import { levelAverage } from "@/lib/scoringV2";
import { RELIABILITY_COLOR, type SubmissionDetail } from "@/lib/types";
import MemoForm from "@/components/MemoForm";
import DetailActions from "@/components/DetailActions";
import ReportV2, { type LevelAverage } from "@/components/ReportV2";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const bandColor: Record<Band, string> = {
  high: "var(--high)",
  mid: "var(--mid)",
  low: "var(--low)",
};
const interpKey: Record<Band, "hi" | "mid" | "lo"> = {
  high: "hi",
  mid: "mid",
  low: "lo",
};

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  const sub = data as SubmissionDetail;
  const relColor = RELIABILITY_COLOR[sub.reliability.level];

  if (sub.version === "v2") {
    // 학교급별 평균: 같은 학교급 v2 응답만 (v1과 섞지 않는다)
    let avg: LevelAverage = null;
    const { data: peers } = await supabase
      .from("submissions")
      .select("dimension_scores")
      .eq("version", "v2")
      .eq("school_level", sub.school_level);
    if (peers) avg = levelAverage(peers);

    return (
      <>
        <DetailActions id={sub.id} />
        <div className="sheet report">
          <div className="inner">
            <ReportV2 sub={sub} dateText={dateFmt.format(new Date(sub.created_at))} avg={avg} />
            <MemoForm id={sub.id} memo={sub.admin_memo} recommendation={sub.recommendation} />
            <footer className="foot">
              <span className="fw">Parah Mathematics</span>
              <span>학습 성향 사전 진단 · 대외비</span>
            </footer>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DetailActions id={sub.id} />

      <div className="sheet report">
        <div className="inner">
          <header className="masthead">
            <div className="brand">
              <div className="mark">Parah Mathematics</div>
              <h1>학습 성향 사전 진단</h1>
              <div className="sub">Pre-Consultation Learning Profile</div>
            </div>
            <div className="meta">
              <div className="row">
                <span className="k">DATE</span>
                <span className="v">{dateFmt.format(new Date(sub.created_at))}</span>
              </div>
              <div className="row">
                <span className="k">성명</span>
                <span className="v">{sub.student_name}</span>
              </div>
              <div className="row">
                <span className="k">학교/학년</span>
                <span className="v">
                  {sub.school} / {sub.grade}
                </span>
              </div>
            </div>
          </header>

          <section className="results show" style={{ borderTop: "none", marginTop: 0, paddingTop: 24 }}>
            <div className="r-head">
              <div className="mk">Learning Profile</div>
              <h2>성향 프로파일</h2>
              <p>
                본 도구 내부 기준에 따른 차원별 상대 프로파일 — 보완 0–40 · 보통 40–65 ·
                강점 65–100 (응답 {sub.answered}/{sub.total})
              </p>
            </div>

            <div className="profile">
              {sub.dimension_scores.map((s, i) => {
                const color = bandColor[s.band];
                const interp = INTERP[s.name]?.[interpKey[s.band]] ?? "";
                return (
                  <div className="bar-row" key={i}>
                    <div className="bar-top">
                      <div className="bar-name">
                        {s.name}
                        <span className="en">{s.en}</span>
                      </div>
                      <div className="bar-band" style={{ color }}>
                        {bandLabel(s.band)} · {s.idx}
                      </div>
                    </div>
                    <div className="track">
                      <div className="m40" />
                      <div className="m65" />
                      <div className="fill" style={{ background: color, width: `${s.idx}%` }} />
                    </div>
                    <div className="bar-interp">{interp}</div>
                  </div>
                );
              })}
            </div>

            <div className="synth">
              <h3>요약 소견 — 상담 활용</h3>
              <div className="ln">
                <b>두드러진 강점</b>　{sub.top_strengths.join(" · ")} — 수업 설계의 출발점으로
                삼을 수 있습니다.
              </div>
              <div className="ln">
                <b>우선 보완점</b>　{sub.top_gaps.join(" · ")} — 초기 수업 설계에서 이 영역을
                먼저 다루면 안정적입니다.
              </div>
              <div className="ln">
                <b>응답 신뢰도</b>　<span style={{ color: relColor }}>{reliabilityText(sub.reliability)}</span>
              </div>
              <div className="ln" style={{ marginTop: 11, color: "var(--ink-faint)", fontSize: 11.5 }}>
                위 프로파일은 상담의 출발점입니다. 가져온 교재의 풀이식과 대화를 통해
                검증·보완하시기 바랍니다.
              </div>
            </div>

            <div className="method">
              <div className="mt">방법론 · 한계</div>
              <p>
                본 진단은 자기조절학습(MSLQ, Pintrich 외), 성장 마인드셋(Dweck),
                끈기(Duckworth), 자기조절학습 단계 모형(Zimmerman) 등 검증된 학습심리
                이론의 구성개념을 바탕으로 설계된 자기보고식 선별 도구입니다. 제시되는
                점수는 본 도구의 내부 기준에 따른 상대적 프로파일이며, 전국 또래 집단 대비
                백분위·T점수와 같은 표준화 규준을 제공하지 않습니다. 공인된 규준 점수가
                필요하신 경우 학지사 인싸이트 MLST-II 학습전략검사(청소년용, T점수 평균
                50·표준편차 10) 등 표준화 검사 병행을 권합니다.
              </p>
            </div>

            {/* 자유 서술 원문 */}
            <section className="open" style={{ marginTop: 30 }}>
              <div className="dim-head">
                <div className="dim-num">IX</div>
                <div className="dim-title">자유 서술</div>
                <div className="dim-en">In your own words</div>
                <div className="dim-line" />
              </div>
              {OPEN_QUESTIONS.map((q, i) => {
                const ans = sub.open_answers?.[i]?.trim();
                return (
                  <div className="oq" key={i}>
                    <div className="ol">{q}</div>
                    <div className="open-answer">{ans ? ans : <span className="muted">(미작성)</span>}</div>
                  </div>
                );
              })}
            </section>

            {/* 인쇄 시 메모/권장방향 (화면에선 아래 편집 폼으로 보임) */}
            <div className="print-only memo-print">
              <div className="synth" style={{ marginTop: 24 }}>
                <h3>권장 수업 방향</h3>
                <div className="ln">{sub.recommendation?.trim() || "—"}</div>
              </div>
              <div className="synth" style={{ marginTop: 16 }}>
                <h3>원장 메모</h3>
                <div className="ln" style={{ whiteSpace: "pre-wrap" }}>
                  {sub.admin_memo?.trim() || "—"}
                </div>
              </div>
            </div>
          </section>

          <MemoForm id={sub.id} memo={sub.admin_memo} recommendation={sub.recommendation} />

          <footer className="foot">
            <span className="fw">Parah Mathematics</span>
            <span>학습 성향 사전 진단 · 대외비</span>
          </footer>
        </div>
      </div>
    </>
  );
}
