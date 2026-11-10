"use client";

import { useMemo, useState } from "react";
import {
  DIMS_V2,
  GRADES,
  MODULES,
  OPEN_V2,
  REF_AFTER_DIM,
  REF_ITEMS,
  ROMAN_V2,
  SECTION_NO,
  SITUATION,
  TOTAL_SCALE_V2,
  YOUNG_GRADE_NOTE,
  isGrade,
  needsGuardian,
  schoolLevelOf,
  situationApplies,
  type AnswerValue,
  type ScaleItemV2,
} from "@/lib/questionsV2";

const SCALE = [
  { lines: ["전혀", "아니다"], label: "전혀 아니다" },
  { lines: ["별로", "아니다"], label: "별로 아니다" },
  { lines: ["보통", "이다"], label: "보통이다" },
  { lines: ["그런", "편이다"], label: "그런 편이다" },
  { lines: ["매우", "그렇다"], label: "매우 그렇다" },
];

function SectionHead({ no, title, en }: { no: number; title: string; en: string }) {
  return (
    <div className="dim-head">
      <div className="dim-num">{ROMAN_V2[no]}</div>
      <div className="dim-title">{title}</div>
      <div className="dim-en">{en}</div>
      <div className="dim-line" />
    </div>
  );
}

function ScaleQuestion({
  item,
  value,
  onChange,
}: {
  item: ScaleItemV2;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
}) {
  return (
    <div className={item.na ? "q has-na" : "q"}>
      <div className="qt">{item.t}</div>
      <div className="opts">
        {SCALE.map((s, vi) => {
          const v = vi + 1;
          return (
            <label key={v}>
              <input
                type="radio"
                name={item.id}
                value={v}
                checked={value === v}
                onChange={() => onChange(v)}
                aria-label={s.label}
              />
              <span className="opt-label">
                {s.lines[0]}
                <br />
                {s.lines[1]}
              </span>
            </label>
          );
        })}
        {item.na && (
          <label className="na-opt">
            <input
              type="radio"
              name={item.id}
              value="na"
              checked={value === "na"}
              onChange={() => onChange("na")}
              aria-label="아직 해당 없음"
            />
            <span className="opt-label">
              아직
              <br />
              해당 없음
            </span>
          </label>
        )}
      </div>
    </div>
  );
}

export default function DiagnosisForm() {
  const [consent, setConsent] = useState(false);
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianConfirmed, setGuardianConfirmed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [situation, setSituation] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Record<string, string | boolean>>({});

  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState(false);

  const validGrade = isGrade(grade) ? grade : null;
  const level = validGrade ? schoolLevelOf(validGrade) : null;
  const guardianNeeded = validGrade ? needsGuardian(validGrade) : false;

  // 아직 고르지 않은 필수 항목 (버튼이 꺼진 이유를 그대로 보여 준다)
  const missing = !consent
    ? "보호자 개인정보 수집·이용 동의에 체크해 주세요."
    : !name.trim() || !school.trim() || !validGrade
      ? "이름 · 학교 · 학년을 모두 입력해 주세요."
      : guardianNeeded && (!guardianName.trim() || !guardianConfirmed)
        ? "동의 블록의 보호자 성함과 보호자 확인 칸을 채워 주세요."
        : "";
  const canSubmit = !missing && !submitting;

  // "해당 없음"도 응답한 것으로 센다
  const unanswered = useMemo(
    () => TOTAL_SCALE_V2 - Object.keys(answers).length,
    [answers]
  );

  function setAnswer(key: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (missing) {
      setNotice(missing);
      return;
    }
    setSubmitting(true);
    setNotice("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: "v2",
          consent,
          name: name.trim(),
          school: school.trim(),
          grade: validGrade,
          guardianName: guardianNeeded ? guardianName.trim() : null,
          guardianConfirmed: guardianNeeded ? guardianConfirmed : null,
          answers,
          situation,
          open,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setNotice(data.error || "제출 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setNotice("네트워크 오류로 제출하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="sheet">
        <div className="inner">
          <div className="thanks">
            <div className="mk">Thank you</div>
            <h2>작성해 주셔서 감사합니다</h2>
            <p>
              제출이 완료되었습니다. 작성해 주신 내용을 기반으로 학생에게 꼭 맞는
              수업을 설계하는 데 소중히 쓰입니다.
            </p>
          </div>
          <footer className="foot">
            <span className="fw">Parah Mathematics</span>
            <span>학습 성향 사전 진단 · 대외비</span>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="sheet">
      <div className="inner">
        <header className="masthead">
          <div className="brand">
            <div className="mark">Parah Mathematics</div>
            <h1>학습 성향 사전 진단</h1>
            <div className="sub">Pre-Consultation Learning Profile</div>
          </div>
        </header>

        <div className="lead">
          아래 문항은 <b>정답이 없습니다.</b> 평소 자신의 모습에 가장 가깝다고 느끼는
          곳에 솔직하게 표시해 주세요. 이 진단은 점수를 매기기 위한 것이 아니라,
          상담에서 학생에게 꼭 맞는 수업을 설계하기 위한 자료입니다. 가능하면 혼자
          있을 때, 한 번에 이어서 작성해 주세요.
        </div>

        {/* 개인정보 동의 */}
        <section className="consent">
          <h3>개인정보 수집·이용 동의 (보호자)</h3>
          <p>
            파라수학은 상담 자료 작성을 위해 <b>이름 · 학교 · 학년</b>과 진단 응답(학습
            습관, 공부 상황, 진로 방향에 대한 답 포함), 그리고 초등 4학년~중학교
            2학년의 경우 <b>보호자 성함</b>만을 수집합니다. 주민번호 · 연락처 등
            민감하거나 식별되는 정보는 수집하지 않습니다. 수집한 정보는 학습 상담
            목적에만 이용하며, 상담 종료 후 6개월이 지나거나 요청 시 삭제합니다.
          </p>
          <p>
            작성 대상이 미성년자인 경우 본 동의는 법정대리인(보호자)의 동의를
            의미합니다.
          </p>
          <label className="check">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>위 내용을 확인했으며, 개인정보 수집·이용에 동의합니다. (필수)</span>
          </label>
          {guardianNeeded && (
            <div className="guardian">
              <div className="field">
                <label htmlFor="f-guardian">보호자 성함</label>
                <input
                  id="f-guardian"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  maxLength={100}
                />
              </div>
              <label className="check">
                <input
                  type="checkbox"
                  checked={guardianConfirmed}
                  onChange={(e) => setGuardianConfirmed(e.target.checked)}
                />
                <span>보호자가 위 내용을 확인하고 동의했습니다. (필수)</span>
              </label>
            </div>
          )}
        </section>

        {/* 인적사항 */}
        <section className="dim" aria-label="인적사항">
          <div className="dim-head">
            <div className="dim-num">·</div>
            <div className="dim-title">인적사항</div>
            <div className="dim-en">Student</div>
            <div className="dim-line" />
          </div>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="f-name">성명</label>
              <input
                id="f-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                maxLength={100}
              />
            </div>
            <div className="field">
              <label htmlFor="f-school">학교</label>
              <input
                id="f-school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                maxLength={100}
                placeholder="예) 파라중학교"
              />
            </div>
            <div className="field">
              <label htmlFor="f-grade">학년</label>
              <select id="f-grade" value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="" disabled>
                  선택
                </option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {validGrade === "초4" && <div className="lead-note">{YOUNG_GRADE_NOTE}</div>}
          {guardianNeeded && (
            <div className="lead-note">
              위 동의 블록에 보호자 성함과 보호자 확인 칸이 함께 열렸습니다.
            </div>
          )}
        </section>

        {/* I~VIII 8차원 */}
        {DIMS_V2.map((d, di) => (
          <section className="dim" key={d.name}>
            <SectionHead no={SECTION_NO.dims + di} title={d.name} en={d.en} />
            {[...d.items, ...(di === REF_AFTER_DIM ? REF_ITEMS : [])].map((it) => (
              <ScaleQuestion
                key={it.id}
                item={it}
                value={answers[it.id]}
                onChange={(v) => setAnswer(it.id, v)}
              />
            ))}
          </section>
        ))}

        {/* IX~XII 보조 지표 */}
        {MODULES.map((m, mi) => (
          <section className="dim" key={m.id}>
            <SectionHead no={SECTION_NO.modules + mi} title={m.name} en={m.en} />
            {m.items.map((it) => (
              <ScaleQuestion
                key={it.id}
                item={it}
                value={answers[it.id]}
                onChange={(v) => setAnswer(it.id, v)}
              />
            ))}
          </section>
        ))}

        {/* XIII 공부 상황 */}
        <section className="dim sq-section">
          <SectionHead no={SECTION_NO.situation} title="공부 상황" en="My situation" />
          {SITUATION.filter((q) => situationApplies(q, level)).map((q, qi) => (
            <div className="sq" key={q.id}>
              <div className="sq-label">
                <span className="sq-no">{qi + 1}</span>
                {q.label}
              </div>
              <div className="sq-opts">
                {q.options.map((o) => (
                  <label className="sq-o" key={o}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={situation[q.id] === o}
                      onChange={() => setSituation((p) => ({ ...p, [q.id]: o }))}
                    />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* XIV 자유 서술 */}
        <section className="open">
          <SectionHead no={SECTION_NO.open} title="자유 서술" en="In your own words" />
          {OPEN_V2.map((b) => {
            const none = b.none ? open[b.none.id] === true : false;
            return (
              <div className="oq" key={b.fields[0].id}>
                <div className="ol">{b.label}</div>
                {b.fields.map((f) => (
                  <div className="of" key={f.id}>
                    {f.label && <div className="ol-sub">{f.label}</div>}
                    <textarea
                      value={typeof open[f.id] === "string" ? (open[f.id] as string) : ""}
                      onChange={(e) => setOpen((p) => ({ ...p, [f.id]: e.target.value }))}
                      maxLength={2000}
                      rows={f.label ? 2 : 3}
                      disabled={none}
                    />
                  </div>
                ))}
                {b.none && (
                  <label className="sq-o none-opt">
                    <input
                      type="checkbox"
                      checked={none}
                      onChange={(e) =>
                        setOpen((p) => ({ ...p, [b.none!.id]: e.target.checked }))
                      }
                    />
                    <span>{b.none.label}</span>
                  </label>
                )}
              </div>
            );
          })}
        </section>

        {/* 제출 */}
        <div className="action">
          <button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? "제출 중…" : "제출하기"}
          </button>
          <div className="notice">
            {notice || (
              <>
                {missing}
                {missing && unanswered > 0 && <br />}
                {unanswered > 0 &&
                  `아직 ${unanswered}문항이 비어 있습니다. 비운 채로도 제출되지만, 모두 답하면 더 정확합니다.`}
              </>
            )}
          </div>
        </div>

        <footer className="foot">
          <span className="fw">Parah Mathematics</span>
          <span>학습 성향 사전 진단 · 대외비</span>
        </footer>
      </div>
    </div>
  );
}
