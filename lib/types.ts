import type { DimensionScore, Reliability, ReliabilityLevel } from "./scoring";
import type { AuxScores } from "./scoringV2";
import type { AnswersV2, OpenAnswersV2, SchoolLevel } from "./questionsV2";

// 대시보드 목록용 (요약 컬럼만)
export type SubmissionRow = {
  id: string;
  created_at: string;
  student_name: string;
  school: string;
  grade: string;
  reliability: Reliability;
  top_strengths: string[];
  top_gaps: string[];
  answered: number;
  total: number;
};

// 상세 화면용 (전체 컬럼). version 칸이 없던 행(마이그레이션 전)은 v1로 읽는다.
type DetailCommon = SubmissionRow & {
  dimension_scores: DimensionScore[];
  admin_memo: string;
  recommendation: string;
};

export type SubmissionDetailV1 = DetailCommon & {
  version?: "v1" | null;
  answers: Record<string, number>;
  open_answers: string[];
};

export type SubmissionDetailV2 = DetailCommon & {
  version: "v2";
  school_level: SchoolLevel;
  guardian_name: string | null;
  guardian_confirmed: boolean | null;
  answers: AnswersV2;
  aux_scores: AuxScores;
  situation: Record<string, string>;
  open_answers: OpenAnswersV2;
};

export type SubmissionDetail = SubmissionDetailV1 | SubmissionDetailV2;

export const RELIABILITY_LABEL: Record<ReliabilityLevel, string> = {
  good: "양호",
  minor: "경미",
  warn: "주의",
  none: "미점검",
};

// 신뢰도 → 색 토큰 (high=양호, mid=경미, low=주의, faint=미점검)
export const RELIABILITY_COLOR: Record<ReliabilityLevel, string> = {
  good: "var(--high)",
  minor: "var(--mid)",
  warn: "var(--low)",
  none: "var(--ink-faint)",
};
