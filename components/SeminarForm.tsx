"use client";

import { useMemo, useState } from "react";
import {
  CONSENT,
  FIXED_TRACK,
  OTHER_LABEL,
  Question,
  SECTIONS,
  SEMINAR_TITLE,
  gradeOptionFor,
  normalizePhone,
  questionsFor,
  sectionsFor,
  trackOf,
} from "@/lib/seminarQuestions";
import { checkQuestion, SeminarAnswers } from "@/lib/seminarSubmission";

export default function SeminarForm() {
  const [answers, setAnswers] = useState<SeminarAnswers>(
    FIXED_TRACK ? { grade: gradeOptionFor(FIXED_TRACK) } : {}
  );
  const [others, setOthers] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState(false);

  const track = trackOf(answers.grade as string | undefined);
  const visibleSections = track ? sectionsFor(track) : [SECTIONS[0]];
  const visibleQuestions = useMemo(
    () => (track ? questionsFor(track) : SECTIONS[0].questions),
    [track]
  );

  const requiredLeft = useMemo(() => {
    if (!track) return null;
    return visibleQuestions.filter(
      (q) => q.required && checkQuestion(q, answers, others)
    ).length;
  }, [track, visibleQuestions, answers, others]);

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function toggleMulti(q: Question, option: string) {
    const cur = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
    const has = cur.includes(option);
    if (!has && q.max && cur.length >= q.max) {
      setNotice(`「${q.label}」 은 최대 ${q.max}개까지 고를 수 있습니다.`);
      return;
    }
    setNotice("");
    setAnswer(
      q.id,
      has ? cur.filter((v) => v !== option) : [...cur, option]
    );
  }

  async function handleSubmit() {
    const found: Record<string, string> = {};
    for (const q of visibleQuestions) {
      const err = checkQuestion(q, answers, others);
      if (err) found[q.id] = err;
    }
    setErrors(found);

    const firstId = visibleQuestions.find((q) => found[q.id])?.id;
    if (firstId) {
      setNotice("빈 칸이 있습니다. 표시된 문항을 확인해 주세요.");
      document
        .getElementById(`q-${firstId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!consent) {
      setNotice("개인정보 수집·이용 동의에 체크해 주세요.");
      document
        .getElementById("consent-box")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setNotice("");
    try {
      const res = await fetch("/api/seminar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: true, answers, others }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setNotice(data.error || "제출 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        setSubmitting(false);
        return;
      }
      setDone(true);
      window.scrollTo({ top: 0 });
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
            <h2>보내 주셔서 감사합니다</h2>
            <p>
              접수되었습니다. 적어 주신 내용을 모두 읽고, 그날 강의의 설명 깊이와
              시간 배분에 반영하겠습니다. 회차 안내는 남겨 주신 연락처로 따로
              드리겠습니다.
            </p>
          </div>
          <footer className="foot">
            <span className="fw">Parah Mathematics</span>
            <span>학부모 강의 사전조사 · 대외비</span>
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
            <h1>학부모 강의 사전조사</h1>
            <div className="sub">Pre-Seminar Questionnaire</div>
          </div>
        </header>

        <div className="lead">
          <b>{SEMINAR_TITLE}</b>
          <br />
          강의에 앞서 몇 가지 여쭙습니다. <b>정답이 없는 질문</b>이고, 아직 정해지지
          않은 것은 정해지지 않은 대로 골라 주시면 됩니다. 답해 주신 내용은 그날
          설명의 깊이와 시간 배분을 정하는 데에만 씁니다. 3분이면 끝납니다.
          <br />
          <span className="lead-note">
            「선택」이라 표시된 문항 외에는 모두 답해 주셔야 보내집니다.
          </span>
        </div>

        {visibleSections.map((s, si) => (
          <section className="dim sq-section" key={s.id}>
            <div className="dim-head">
              <div className="dim-num">·</div>
              <div className="dim-title">
                섹션 {si + 1} · {s.title}
              </div>
              <div className="dim-line" />
            </div>
            {s.intro && <p className="sq-intro">{s.intro}</p>}

            {s.questions
              .filter((q) => !(FIXED_TRACK && q.id === "grade"))
              .map((q, qi) => (
              <div
                className={`sq${errors[q.id] ? " sq-err" : ""}`}
                id={`q-${q.id}`}
                key={q.id}
              >
                <div className="sq-label">
                  <span className="sq-no">{qi + 1}.</span>
                  {q.label}
                  {!q.required && <span className="sq-opt-mark">선택</span>}
                  {q.max && <span className="sq-hint">최대 {q.max}개</span>}
                </div>
                {q.help && <div className="sq-help">{q.help}</div>}

                {q.type === "short" && (
                  <input
                    className="sq-input"
                    value={(answers[q.id] as string) ?? ""}
                    placeholder={q.placeholder}
                    inputMode={q.phone ? "tel" : undefined}
                    maxLength={100}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    onBlur={
                      q.phone
                        ? (e) => setAnswer(q.id, normalizePhone(e.target.value))
                        : undefined
                    }
                  />
                )}

                {q.type === "long" && (
                  <textarea
                    className="sq-textarea"
                    rows={4}
                    maxLength={2000}
                    value={(answers[q.id] as string) ?? ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                  />
                )}

                {q.type === "choice" && (
                  <div className="sq-opts">
                    {(q.options ?? []).map((o) => (
                      <label className="sq-o" key={o}>
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === o}
                          onChange={() => setAnswer(q.id, o)}
                        />
                        <span>{o}</span>
                      </label>
                    ))}
                    {q.other && (
                      <label className="sq-o">
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === OTHER_LABEL}
                          onChange={() => setAnswer(q.id, OTHER_LABEL)}
                        />
                        <span className="sq-other-wrap">
                          기타
                          <input
                            className="sq-other"
                            value={others[q.id] ?? ""}
                            placeholder="직접 적어 주세요"
                            maxLength={100}
                            onFocus={() => setAnswer(q.id, OTHER_LABEL)}
                            onChange={(e) =>
                              setOthers((p) => ({ ...p, [q.id]: e.target.value }))
                            }
                          />
                        </span>
                      </label>
                    )}
                  </div>
                )}

                {q.type === "multi" && (
                  <div className="sq-opts">
                    {(q.options ?? []).map((o) => {
                      const cur = Array.isArray(answers[q.id])
                        ? (answers[q.id] as string[])
                        : [];
                      return (
                        <label className="sq-o" key={o}>
                          <input
                            type="checkbox"
                            checked={cur.includes(o)}
                            onChange={() => toggleMulti(q, o)}
                          />
                          <span>{o}</span>
                        </label>
                      );
                    })}
                    {q.other && (
                      <label className="sq-o">
                        <input
                          type="checkbox"
                          checked={
                            Array.isArray(answers[q.id]) &&
                            (answers[q.id] as string[]).includes(OTHER_LABEL)
                          }
                          onChange={() => toggleMulti(q, OTHER_LABEL)}
                        />
                        <span className="sq-other-wrap">
                          기타
                          <input
                            className="sq-other"
                            value={others[q.id] ?? ""}
                            placeholder="직접 적어 주세요"
                            maxLength={100}
                            onChange={(e) =>
                              setOthers((p) => ({ ...p, [q.id]: e.target.value }))
                            }
                          />
                        </span>
                      </label>
                    )}
                  </div>
                )}

                {errors[q.id] && <div className="sq-errmsg">{errors[q.id]}</div>}
              </div>
            ))}
          </section>
        ))}

        {!track && (
          <div className="sq-gate">
            자녀 학년을 골라 주시면 이어지는 질문이 나타납니다.
          </div>
        )}

        {track && (
          <>
            <section className="consent" id="consent-box">
              <h3>{CONSENT.title}</h3>
              {CONSENT.lines.map((l) => (
                <p key={l}>{l}</p>
              ))}
              <label className="check">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>{CONSENT.agree} (필수)</span>
              </label>
            </section>

            <div className="action sq-action">
              <button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "보내는 중…" : "보내기"}
              </button>
              <div className="notice">
                {notice ||
                  (requiredLeft
                    ? `아직 답하지 않은 필수 문항이 ${requiredLeft}개 있습니다.`
                    : "")}
              </div>
            </div>
          </>
        )}

        <footer className="foot">
          <span className="fw">Parah Mathematics</span>
          <span>학부모 강의 사전조사 · 대외비</span>
        </footer>
      </div>
    </div>
  );
}
