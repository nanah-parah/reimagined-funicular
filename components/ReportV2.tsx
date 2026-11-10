// v2 결과지 본문 (원장용, A4 인쇄). 데이터 조회 없이 props만으로 그리는 순수 컴포넌트.
// v1 결과지는 app/admin/submissions/[id]/page.tsx 에 그대로 있다 — v1과 v2 점수는 한 결과지에서 비교하지 않는다.

import { INTERP } from "@/lib/questions";
import {
  DIMS_V2,
  MODULES,
  OPEN_V2,
  REF_AFTER_DIM,
  REF_ITEMS,
  ROMAN_V2,
  SCHOOL_LEVEL_LABEL,
  SECTION_NO,
  SITUATION,
  situationApplies,
  type AnswerValue,
} from "@/lib/questionsV2";
import { bandLabel, reliabilityText, type Band } from "@/lib/scoring";
import type { CellScore } from "@/lib/scoringV2";
import { RELIABILITY_COLOR, type SubmissionDetailV2 } from "@/lib/types";

export type LevelAverage = { n: number; byDim: Record<string, number> } | null;

const bandColor: Record<Band, string> = {
  high: "var(--high)",
  mid: "var(--mid)",
  low: "var(--low)",
};
const interpKey: Record<Band, "hi" | "mid" | "lo"> = { high: "hi", mid: "mid", low: "lo" };

function answerText(a: AnswerValue | undefined): { text: string; muted: boolean } {
  if (a === "na") return { text: "해당 없음", muted: true };
  if (typeof a === "number") return { text: String(a), muted: false };
  return { text: "미응답", muted: true };
}

function CellBar({ c }: { c: CellScore }) {
  return (
    <div className="cell-row">
      <div className="cell-k">{c.label}</div>
      <div className="track">
        {c.idx !== null && <div className="fill" style={{ width: `${c.idx}%` }} />}
      </div>
      <div className="cell-v">
        {c.idx === null ? <small>응답 없음</small> : c.idx}
        <small>
          {c.cnt}/{c.total}
        </small>
      </div>
    </div>
  );
}

export default function ReportV2({
  sub,
  dateText,
  avg,
}: {
  sub: SubmissionDetailV2;
  dateText: string;
  avg: LevelAverage;
}) {
  const relColor = RELIABILITY_COLOR[sub.reliability.level];
  const level = sub.school_level;
  const aux = sub.aux_scores;

  // 모듈에서 함께 쓰는 기존 문항: id → ["공부하는 이유·외적(정채점)", ...]
  const borrowedBy = new Map<string, { where: string; rev: boolean }[]>();
  for (const m of MODULES) {
    for (const b of m.borrowed) {
      const cell = m.cells.find((c) => c.key === b.cell)!.label;
      const list = borrowedBy.get(b.id) ?? [];
      list.push({ where: `${m.name} · ${cell}`, rev: !!b.rev });
      borrowedBy.set(b.id, list);
    }
  }

  // 문항별 응답 표
  type Row = { sec: string; t: string; a: AnswerValue | undefined; rev: string; belong: string };
  const rows: Row[] = [];
  DIMS_V2.forEach((d, di) => {
    const sec = `${ROMAN_V2[SECTION_NO.dims + di]} ${d.name}`;
    d.items.forEach((it) => {
      const extra = borrowedBy.get(it.id) ?? [];
      rows.push({
        sec,
        t: it.t,
        a: sub.answers[it.id],
        rev: [it.rev ? "역" : "정", ...extra.map((e) => (e.rev ? "역" : "정"))].join(" / "),
        belong: [d.name, ...extra.map((e) => e.where)].join(" / "),
      });
    });
    if (di === REF_AFTER_DIM) {
      for (const r of REF_ITEMS) {
        rows.push({ sec, t: r.t, a: sub.answers[r.id], rev: "—", belong: "참고 문항 (점수 미포함)" });
      }
    }
  });
  MODULES.forEach((m, mi) => {
    const sec = `${ROMAN_V2[SECTION_NO.modules + mi]} ${m.name}`;
    m.items.forEach((it) => {
      rows.push({
        sec,
        t: it.t,
        a: sub.answers[it.id],
        rev: it.rev ? "역" : "정",
        belong: `${m.name} · ${m.cells.find((c) => c.key === it.cell)!.label}`,
      });
    });
  });

  return (
    <>
      <header className="masthead">
        <div className="brand">
          <div className="mark">Parah Mathematics</div>
          <h1>학습 성향 사전 진단</h1>
          <div className="sub">Pre-Consultation Learning Profile</div>
        </div>
        <div className="meta">
          <div className="row">
            <span className="k">DATE</span>
            <span className="v">{dateText}</span>
          </div>
          <div className="row">
            <span className="k">성명</span>
            <span className="v">{sub.student_name}</span>
          </div>
          <div className="row">
            <span className="k">학교</span>
            <span className="v">{sub.school}</span>
          </div>
          <div className="row">
            <span className="k">학교급/학년</span>
            <span className="v">
              {SCHOOL_LEVEL_LABEL[level]} · {sub.grade}
            </span>
          </div>
          {sub.guardian_name && (
            <div className="row">
              <span className="k">보호자</span>
              <span className="v">{sub.guardian_name}</span>
            </div>
          )}
        </div>
      </header>

      <section className="results show" style={{ borderTop: "none", marginTop: 0, paddingTop: 24 }}>
        <div className="r-head">
          <div className="mk">Learning Profile</div>
          <h2>성향 프로파일</h2>
          <p>
            본 도구 내부 기준에 따른 차원별 상대 프로파일 — 보완 0–40 · 보통 40–65 · 강점
            65–100 (척도 응답 {sub.answered}/{sub.total} · 설문 v2)
          </p>
          {avg && (
            <p className="avg-legend">
              <i />
              가는 세로선: 같은 학교급({level}) v2 응답 {avg.n}명의 차원 평균
            </p>
          )}
        </div>

        <div className="profile">
          {sub.dimension_scores.map((s, i) => {
            const color = s.insufficient ? "var(--ink-faint)" : bandColor[s.band];
            const interp = s.insufficient
              ? "응답한 문항이 절반에 못 미쳐 이 차원은 점수로 읽지 않습니다."
              : (INTERP[s.name]?.[interpKey[s.band]] ?? "");
            const avgX = avg?.byDim[s.name];
            return (
              <div className="bar-row" key={i}>
                <div className="bar-top">
                  <div className="bar-name">
                    {s.name}
                    <span className="en">{s.en}</span>
                    <span className="bar-cnt">
                      응답 {s.cnt}/{s.total}
                      {s.na ? ` · 해당 없음 ${s.na}` : ""}
                    </span>
                  </div>
                  <div className="bar-band" style={{ color }}>
                    {s.insufficient ? "응답 부족" : `${bandLabel(s.band)} · ${s.idx}`}
                  </div>
                </div>
                <div className="track">
                  <div className="m40" />
                  <div className="m65" />
                  {!s.insufficient && (
                    <div className="fill" style={{ background: color, width: `${s.idx}%` }} />
                  )}
                  {avgX !== undefined && <div className="avg" style={{ left: `${avgX}%` }} />}
                </div>
                {i === 4 && aux?.metacog && (
                  <div className="subgroups">
                    {aux.metacog.map((g) => (
                      <span key={g.key}>
                        {g.label} <b>{g.idx === null ? "—" : g.idx}</b>
                      </span>
                    ))}
                  </div>
                )}
                <div className="bar-interp">{interp}</div>
              </div>
            );
          })}
        </div>

        {/* 보조 지표 — 8차원에 합산하지 않고, 라벨 없이 막대만 */}
        <section className="aux">
          <div className="r-head">
            <div className="mk">Supplementary</div>
            <h2>보조 지표</h2>
            <p>8개 차원에 합산하지 않습니다. 칸별 평균을 0–100으로 환산했고, 보완·보통·강점 라벨은 붙이지 않습니다.</p>
          </div>
          {MODULES.map((m, mi) => {
            const ms = aux?.modules.find((x) => x.id === m.id);
            return (
              <div className="aux-mod" key={m.id}>
                <div className="aux-title">
                  <span className="no">{ROMAN_V2[SECTION_NO.modules + mi]}</span>
                  {m.name}
                  <span className="en">{m.en}</span>
                </div>
                <div className="aux-note">{m.note}</div>
                {ms?.cells.map((c) => <CellBar key={c.key} c={c} />)}
              </div>
            );
          })}
        </section>

        <div className="synth">
          <h3>요약 소견 — 상담 활용</h3>
          <div className="ln">
            <b>두드러진 강점</b>　{sub.top_strengths.join(" · ") || "—"} — 수업 설계의
            출발점으로 삼을 수 있습니다.
          </div>
          <div className="ln">
            <b>우선 보완점</b>　{sub.top_gaps.join(" · ") || "—"} — 초기 수업 설계에서 이
            영역을 먼저 다루면 안정적입니다.
          </div>
          <div className="ln">
            <b>응답 신뢰도</b>　<span style={{ color: relColor }}>{reliabilityText(sub.reliability)}</span>
          </div>
          <div className="ln" style={{ marginTop: 11, color: "var(--ink-faint)", fontSize: 11.5 }}>
            위 프로파일은 상담의 출발점입니다. 가져온 교재의 풀이식과 대화를 통해
            검증·보완하시기 바랍니다.
          </div>
        </div>

        {/* 공부 상황 + 참고 문항 */}
        <div className="synth">
          <h3>공부 상황 · 참고 문항</h3>
          <div className="kv">
            {SITUATION.filter((q) => situationApplies(q, level)).map((q) => {
              const v = sub.situation?.[q.id];
              return (
                <div key={q.id}>
                  <div className="k">{q.label}</div>
                  <div className={v ? "v" : "v muted"}>{v || "미응답"}</div>
                </div>
              );
            })}
            {REF_ITEMS.map((r) => {
              const a = answerText(sub.answers[r.id]);
              return (
                <div key={r.id}>
                  <div className="k">참고 · {r.t}</div>
                  <div className={a.muted ? "v muted" : "v"}>
                    {a.muted ? a.text : `${a.text} / 5`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="method">
          <div className="mt">방법론 · 한계</div>
          <p>
            본 진단은 자기조절학습(MSLQ, Pintrich 외), 성장 마인드셋(Dweck),
            끈기(Duckworth), 자기조절학습 단계 모형(Zimmerman) 등 검증된 학습심리 이론의
            구성개념을 바탕으로 설계된 자기보고식 선별 도구입니다. 제시되는 점수는 본
            도구의 내부 기준에 따른 상대적 프로파일이며, 전국 또래 집단 대비 백분위·T점수와
            같은 표준화 규준을 제공하지 않습니다. 공인된 규준 점수가 필요하신 경우 학지사
            인싸이트 MLST-II 학습전략검사(청소년용, T점수 평균 50·표준편차 10) 등 표준화
            검사 병행을 권합니다.
          </p>
        </div>

        {/* XIV 자유 서술 */}
        <section className="open" style={{ marginTop: 30 }}>
          <div className="dim-head">
            <div className="dim-num">{ROMAN_V2[SECTION_NO.open]}</div>
            <div className="dim-title">자유 서술</div>
            <div className="dim-en">In your own words</div>
            <div className="dim-line" />
          </div>
          {OPEN_V2.map((b) => {
            const none = b.none ? sub.open_answers?.[b.none.id] === true : false;
            return (
              <div className="oq" key={b.fields[0].id}>
                <div className="ol">{b.label}</div>
                {none ? (
                  <div className="open-answer">
                    <span className="muted">없다고 답함 — “{b.none!.label}”</span>
                  </div>
                ) : (
                  b.fields.map((f) => {
                    const v = sub.open_answers?.[f.id];
                    const text = typeof v === "string" ? v.trim() : "";
                    return (
                      <div key={f.id}>
                        {f.label && <div className="ol-sub">{f.label}</div>}
                        <div className="open-answer">
                          {text ? text : <span className="muted">(미작성)</span>}
                        </div>
                      </div>
                    );
                  })
                )}
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

        {/* 마지막 페이지: 문항별 응답 */}
        <section className="item-table-sec">
          <div className="r-head">
            <div className="mk">Item Responses</div>
            <h2>문항별 응답</h2>
            <p>응답은 학생이 고른 원래 값(1–5)입니다. 역채점 문항은 채점할 때 6에서 뺀 값을 씁니다.</p>
          </div>
          <table className="it-table">
            <thead>
              <tr>
                <th>섹션</th>
                <th>문항</th>
                <th>응답</th>
                <th>역채점</th>
                <th>소속</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const a = answerText(r.a);
                return (
                  <tr key={i}>
                    <td className="sec">{r.sec}</td>
                    <td>{r.t}</td>
                    <td className={a.muted ? "ans muted" : "ans"}>{a.text}</td>
                    <td className="rev">{r.rev}</td>
                    <td>{r.belong}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </section>
    </>
  );
}
