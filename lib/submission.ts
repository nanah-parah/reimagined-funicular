// 학생 제출 페이로드의 형태와 검증 — 클라이언트/서버 공용.

import { DIMS, OPEN_QUESTIONS, itemName } from "./questions";
import type { Answers } from "./scoring";
import {
  ALL_SCALE_ITEMS_V2,
  OPEN_V2,
  SITUATION,
  isGrade,
  needsGuardian,
  schoolLevelOf,
  situationApplies,
  type AnswersV2,
  type Grade,
  type OpenAnswersV2,
  type SchoolLevel,
} from "./questionsV2";

export type SubmissionInput = {
  consent: boolean; // 보호자 개인정보 수집·이용 동의
  name: string;
  school: string;
  grade: string;
  answers: Answers; // { "d0_i0": 1~5, ... }
  open: string[]; // 자유 서술 4문항 (원문)
};

export type SubmissionInputV2 = {
  version: "v2";
  consent: boolean;
  name: string;
  school: string;
  grade: Grade;
  schoolLevel: SchoolLevel;
  guardianName: string | null; // 초4~중2만
  guardianConfirmed: boolean | null;
  answers: AnswersV2; // { "d0_i0": 1~5 | "na", "m1_1": ..., "ref_1": ... }
  situation: Record<string, string>; // XIII 공부 상황 (선택지 원문)
  open: OpenAnswersV2; // XIV 자유 서술
};

export type ValidationResult =
  | { ok: true; value: SubmissionInput }
  | { ok: true; value: SubmissionInputV2 }
  | { ok: false; error: string };

const MAX_TEXT = 100; // 이름/학교/학년 길이 제한
const MAX_OPEN = 2000; // 서술형 길이 제한

// 외부(공개 링크)에서 들어오는 입력이므로 경계에서 엄격히 검증한다.
// version: "v2"가 없으면 v1 형식으로 읽는다 (배포 직후 열려 있던 옛 화면의 제출 대비).
export function validateSubmission(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "잘못된 요청 형식입니다." };
  }
  const r = raw as Record<string, unknown>;
  if (r.version === "v2") return validateV2(r);

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

function validateV2(r: Record<string, unknown>): ValidationResult {
  if (r.consent !== true) {
    return { ok: false, error: "보호자 개인정보 수집·이용 동의가 필요합니다." };
  }

  const name = typeof r.name === "string" ? r.name.trim() : "";
  const school = typeof r.school === "string" ? r.school.trim() : "";
  if (!name) return { ok: false, error: "이름을 입력해 주세요." };
  if (!school) return { ok: false, error: "학교를 입력해 주세요." };
  if (name.length > MAX_TEXT || school.length > MAX_TEXT) {
    return { ok: false, error: "입력이 너무 깁니다." };
  }
  if (!isGrade(r.grade)) return { ok: false, error: "학년을 선택해 주세요." };
  const grade = r.grade;
  const schoolLevel = schoolLevelOf(grade);

  let guardianName: string | null = null;
  let guardianConfirmed: boolean | null = null;
  if (needsGuardian(grade)) {
    guardianName = typeof r.guardianName === "string" ? r.guardianName.trim() : "";
    if (!guardianName) return { ok: false, error: "보호자 성함을 입력해 주세요." };
    if (guardianName.length > MAX_TEXT) return { ok: false, error: "입력이 너무 깁니다." };
    if (r.guardianConfirmed !== true) {
      return { ok: false, error: "보호자 확인 칸에 체크해 주세요." };
    }
    guardianConfirmed = true;
  }

  // answers: 화면에 있는 척도 문항만, 값은 1~5 정수 또는 (허용 문항만) "na"
  const answersRaw = r.answers;
  if (typeof answersRaw !== "object" || answersRaw === null) {
    return { ok: false, error: "응답 형식이 올바르지 않습니다." };
  }
  const itemById = new Map(ALL_SCALE_ITEMS_V2.map((it) => [it.id, it]));
  const answers: AnswersV2 = {};
  for (const [k, v] of Object.entries(answersRaw as Record<string, unknown>)) {
    const it = itemById.get(k);
    if (!it) continue; // 모르는 키는 무시
    if (v === "na" && it.na) {
      answers[k] = "na";
      continue;
    }
    if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 5) {
      return { ok: false, error: "응답 값이 올바르지 않습니다." };
    }
    answers[k] = v;
  }

  // situation: 학년에 해당하는 문항만, 선택지 원문 중 하나
  const sitRaw = (typeof r.situation === "object" && r.situation) || {};
  const situation: Record<string, string> = {};
  for (const q of SITUATION) {
    if (!situationApplies(q, schoolLevel)) continue;
    const v = (sitRaw as Record<string, unknown>)[q.id];
    if (typeof v === "string" && q.options.includes(v)) situation[q.id] = v;
  }

  // open: 텍스트 칸은 길이 제한, "없다" 칸은 boolean. "없다"를 고른 블록의 텍스트는 버린다.
  const openRaw = ((typeof r.open === "object" && r.open) || {}) as Record<string, unknown>;
  const open: OpenAnswersV2 = {};
  for (const b of OPEN_V2) {
    const none = b.none ? openRaw[b.none.id] === true : false;
    if (b.none) open[b.none.id] = none;
    for (const f of b.fields) {
      const v = openRaw[f.id];
      open[f.id] = !none && typeof v === "string" ? v.slice(0, MAX_OPEN) : "";
    }
  }

  return {
    ok: true,
    value: {
      version: "v2",
      consent: true,
      name,
      school,
      grade,
      schoolLevel,
      guardianName,
      guardianConfirmed,
      answers,
      situation,
      open,
    },
  };
}
