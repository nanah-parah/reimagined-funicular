// 학생 제출 페이로드의 형태와 검증 — 클라이언트/서버 공용.

import { DIMS, OPEN_QUESTIONS, itemName } from "./questions";
import type { Answers } from "./scoring";

export type SubmissionInput = {
  consent: boolean; // 보호자 개인정보 수집·이용 동의
  name: string;
  school: string;
  grade: string;
  answers: Answers; // { "d0_i0": 1~5, ... }
  open: string[]; // 자유 서술 4문항 (원문)
};

export type ValidationResult =
  | { ok: true; value: SubmissionInput }
  | { ok: false; error: string };

const MAX_TEXT = 100; // 이름/학교/학년 길이 제한
const MAX_OPEN = 2000; // 서술형 길이 제한

// 외부(공개 링크)에서 들어오는 입력이므로 경계에서 엄격히 검증한다.
export function validateSubmission(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "잘못된 요청 형식입니다." };
  }
  const r = raw as Record<string, unknown>;

  if (r.consent !== true) {
    return { ok: false, error: "보호자 개인정보 수집·이용 동의가 필요합니다." };
  }

  const name = typeof r.name === "string" ? r.name.trim() : "";
  const school = typeof r.school === "string" ? r.school.trim() : "";
  const grade = typeof r.grade === "string" ? r.grade.trim() : "";
  if (!name) return { ok: false, error: "이름을 입력해 주세요." };
  if (!school) return { ok: false, error: "학교를 입력해 주세요." };
  if (!grade) return { ok: false, error: "학년을 입력해 주세요." };
  if (name.length > MAX_TEXT || school.length > MAX_TEXT || grade.length > MAX_TEXT) {
    return { ok: false, error: "입력이 너무 깁니다." };
  }

  // answers: 알려진 문항 키만 허용, 값은 1~5 정수
  const answersRaw = r.answers;
  if (typeof answersRaw !== "object" || answersRaw === null) {
    return { ok: false, error: "응답 형식이 올바르지 않습니다." };
  }
  const validKeys = new Set<string>();
  DIMS.forEach((d, di) => d.items.forEach((_, ii) => validKeys.add(itemName(di, ii))));
  const answers: Answers = {};
  for (const [k, v] of Object.entries(answersRaw as Record<string, unknown>)) {
    if (!validKeys.has(k)) continue; // 모르는 키는 무시
    if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 5) {
      return { ok: false, error: "응답 값은 1~5만 가능합니다." };
    }
    answers[k] = v;
  }

  // open: 문자열 배열, 길이 제한
  const openRaw = Array.isArray(r.open) ? r.open : [];
  const open: string[] = OPEN_QUESTIONS.map((_, i) => {
    const v = openRaw[i];
    return typeof v === "string" ? v.slice(0, MAX_OPEN) : "";
  });

  return { ok: true, value: { consent: true, name, school, grade, answers, open } };
}
