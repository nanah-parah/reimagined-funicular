import type { DimensionScore, Reliability, ReliabilityLevel } from "./scoring";

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

// 상세 화면용 (전체 컬럼)
export type SubmissionDetail = SubmissionRow & {
  answers: Record<string, number>;
  dimension_scores: DimensionScore[];
  open_answers: string[];
  admin_memo: string;
  recommendation: string;
};

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
