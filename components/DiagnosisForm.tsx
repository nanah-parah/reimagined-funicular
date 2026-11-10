"use client";

import { useMemo, useState } from "react";
import {
  DIMS,
  ROMAN,
  OPEN_QUESTIONS,
  TOTAL_QUESTIONS,
  itemName,
} from "@/lib/questions";

const SCALE = [
  { lines: ["전혀", "아니다"], label: "전혀 아니다" },
  { lines: ["별로", "아니다"], label: "별로 아니다" },
  { lines: ["보통", "이다"], label: "보통이다" },
  { lines: ["그런", "편이다"], label: "그런 편이다" },
  { lines: ["매우", "그렇다"], label: "매우 그렇다" },
];

export default function DiagnosisForm() {
  const [consent, setConsent] = useState(false);
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [open, setOpen] = useState<string[]>(() => OPEN_QUESTIONS.map(() => ""));

  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const canSubmit =
    consent && name.trim() && school.trim() && grade.trim() && !submitting;

  const unanswered = useMemo(
    () => TOTAL_QUESTIONS - answeredCount,
    [answeredCount]
  );

  function setAnswer(key: string, value: number) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function setOpenAt(i: number, value: string) {
    setOpen((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  async function handleSubmit() {
    if (!consent) {
      setNotice("보호자 개인정보 수집·이용 동의에 체크해 주세요.");
      return;
    }
    if (!name.trim() || !school.trim() || !grade.trim()) {
      setNotice("이름 · 학교 · 학년을 모두 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    setNotice("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent,
          name: name.trim(),
          school: school.trim(),
          grade: grade.trim(),
          answers,
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
          상담에서 학생에게 꼭 맞는 수업을 설계하기 위한 자료입니다.
        </div>

        {/* 개인정보 동의 */}
        <section className="consent">
          <h3>개인정보 수집·이용 동의 (보호자)</h3>
          <p>
            파라수학은 상담 자료 작성을 위해 <b>이름 · 학교 · 학년</b>과 진단 응답만을
            수집합니다. 주민번호 · 연락처 등 민감하거나 식별되는 정보는 수집하지
            않습니다. 수집한 정보는 학습 상담 목적에만 이용하며, 보관 기간이 지나거나
            요청 시 삭제합니다.
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
              <input
                id="f-grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                maxLength={100}
                placeholder="예) 중2"
              />
            </div>
          </div>
        </section>

        {/* 문항 */}
        {DIMS.map((d, di) => (
          <section className="dim" key={di}>
            <div className="dim-head">
              <div className="dim-num">{ROMAN[di + 1]}</div>
              <div className="dim-title">{d.name}</div>
              <div className="dim-en">{d.en}</div>
              <div className="dim-line" />
            </div>
            {d.items.map((it, ii) => {
              const nm = itemName(di, ii);
              return (
                <div className="q" key={ii}>
                  <div className="qt">{it.t}</div>
                  <div className="opts">
                    {SCALE.map((s, vi) => {
                      const value = vi + 1;
                      return (
                        <label key={value}>
                          <input
                            type="radio"
                            name={nm}
                            value={value}
                            checked={answers[nm] === value}
                            onChange={() => setAnswer(nm, value)}
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
                  </div>
                </div>
              );
            })}
          </section>
        ))}

        {/* 자유 서술 */}
        <section className="open">
          <div className="dim-head">
            <div className="dim-num">IX</div>
            <div className="dim-title">자유 서술</div>
            <div className="dim-en">In your own words</div>
            <div className="dim-line" />
          </div>
          {OPEN_QUESTIONS.map((q, i) => (
            <div className="oq" key={i}>
              <div className="ol">{q}</div>
              <textarea
                value={open[i]}
                onChange={(e) => setOpenAt(i, e.target.value)}
                maxLength={2000}
                rows={3}
              />
            </div>
          ))}
        </section>

        {/* 제출 */}
        <div className="action">
          <button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? "제출 중…" : "제출하기"}
          </button>
          <div className="notice">
            {notice ||
              (unanswered > 0
                ? `아직 ${unanswered}문항이 비어 있습니다. 비운 채로도 제출되지만, 모두 답하면 더 정확합니다.`
                : "")}
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
