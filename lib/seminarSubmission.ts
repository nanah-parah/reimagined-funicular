// 강의 사전조사 제출 페이로드의 형태와 검증 — 클라이언트/서버 공용.

import {
  CURRENT_ROUND,
  FIXED_TRACK,
  OTHER_LABEL,
  PHONE_RE,
  Question,
  Track,
  gradeOptionFor,
  questionsFor,
  trackOf,
} from "./seminarQuestions";

export type SeminarAnswers = Record<string, string | string[]>;

export type SeminarInput = {
  consent: boolean;
  track: Track;
  answers: SeminarAnswers;
  others: Record<string, string>;
};

export type SeminarValidation =
  | { ok: true; value: SeminarInput }
  | { ok: false; error: string; questionId?: string };

const MAX_SHORT = 100;
const MAX_LONG = 2000;

// 문항 하나에 대한 검증. 화면에서도 같은 함수를 써서 첫 미완성 문항으로 스크롤한다.
export function checkQuestion(
  q: Question,
  answers: SeminarAnswers,
  others: Record<string, string>
): string | null {
  const a = answers[q.id];

  if (q.type === "short" || q.type === "long") {
    const v = typeof a === "string" ? a.trim() : "";
    if (!v) return q.required ? "답을 적어 주세요." : null;
    if (v.length > (q.type === "long" ? MAX_LONG : MAX_SHORT))
      return "입력이 너무 깁니다.";
    if (q.phone && !PHONE_RE.test(v.replace(/\s/g, "")))
      return "010-0000-0000 형식으로 적어 주세요.";
    return null;
  }

  if (q.type === "choice") {
    const v = typeof a === "string" ? a : "";
    if (!v) return q.required ? "하나를 골라 주세요." : null;
    if (v !== OTHER_LABEL && !(q.options ?? []).includes(v))
      return "선택지에 없는 값입니다.";
    if (v === OTHER_LABEL) {
      if (!q.other) return "선택지에 없는 값입니다.";
      if (!(others[q.id] ?? "").trim()) return "기타 내용을 적어 주세요.";
    }
    return null;
  }

  if (q.type === "multi") {
    const v = Array.isArray(a) ? a : [];
    if (v.length === 0) return q.required ? "하나 이상 골라 주세요." : null;
    for (const item of v) {
      if (item === OTHER_LABEL) {
        if (!q.other) return "선택지에 없는 값입니다.";
        if (!(others[q.id] ?? "").trim()) return "기타 내용을 적어 주세요.";
        continue;
      }
      if (!(q.options ?? []).includes(item)) return "선택지에 없는 값입니다.";
    }
    if (q.max && v.length > q.max) return `최대 ${q.max}개까지 고를 수 있습니다.`;
    return null;
  }

  return null;
}

// 외부(공개 링크)에서 들어오는 입력이므로 경계에서 엄격히 검증한다.
export function validateSeminar(raw: unknown): SeminarValidation {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "잘못된 요청 형식입니다." };
  }
  const r = raw as Record<string, unknown>;

  if (r.consent !== true) {
    return { ok: false, error: "개인정보 수집·이용 동의가 필요합니다." };
  }

  const rawAnswers: Record<string, unknown> = {
    ...(typeof r.answers === "object" && r.answers !== null
      ? (r.answers as Record<string, unknown>)
      : {}),
    ...(FIXED_TRACK ? { grade: gradeOptionFor(FIXED_TRACK) } : {}),
  };
  const rawOthers =
    typeof r.others === "object" && r.others !== null
      ? (r.others as Record<string, unknown>)
      : {};

  const gradeRaw = rawAnswers.grade;
  const track = trackOf(typeof gradeRaw === "string" ? gradeRaw : undefined);
  if (!track || !CURRENT_ROUND.tracks.includes(track))
    return { ok: false, error: "자녀 학년을 골라 주세요.", questionId: "grade" };

  const visible = questionsFor(track);

  // 알려진 문항만 통과시킨다 (모르는 키는 버림)
  const answers: SeminarAnswers = {};
  const others: Record<string, string> = {};
  for (const q of visible) {
    const a = rawAnswers[q.id];
    if (q.type === "multi") {
      answers[q.id] = Array.isArray(a)
        ? a.filter((x): x is string => typeof x === "string").slice(0, 20)
        : [];
    } else {
      answers[q.id] =
        typeof a === "string"
          ? a.slice(0, q.type === "long" ? MAX_LONG : MAX_SHORT).trim()
          : "";
    }
    if (q.other) {
      const o = rawOthers[q.id];
      if (typeof o === "string" && o.trim()) others[q.id] = o.slice(0, MAX_SHORT).trim();
    }
  }

  for (const q of visible) {
    const err = checkQuestion(q, answers, others);
    if (err) return { ok: false, error: `「${q.label}」 ${err}`, questionId: q.id };
  }

  return { ok: true, value: { consent: true, track, answers, others } };
}
