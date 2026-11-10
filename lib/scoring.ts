// 채점·분석 로직 — 빌드설계서 7번 규칙과 정확히 일치.
// 원본(파라수학_학습성향_사전진단.html)의 analyzeBtn 로직을 그대로 이식한다.
// 채점은 항상 이 모듈로 서버에서 권위 있게 재계산한다.

import { DIMS, PAIRS, itemName } from "./questions";

export type Band = "high" | "mid" | "low";
export type ReliabilityLevel = "none" | "good" | "minor" | "warn";

export type DimensionScore = {
  name: string;
  en: string;
  idx: number; // 0~100
  cnt: number; // 응답한 문항 수
  band: Band;
};

export type Reliability = {
  level: ReliabilityLevel;
  conflicts: number;
  pairsChecked: number;
  text: string;
};

export type ScoreResult = {
  scores: DimensionScore[];
  top2: string[]; // 강점 상위 2
  low2: string[]; // 우선 보완점 하위 2
  reliability: Reliability;
  answered: number;
  total: number;
};

// 객관식 응답: { "d0_i0": 1~5, ... } (역채점 전 원시 선택값)
export type Answers = Record<string, number>;

export function bandOf(x: number): Band {
  return x >= 65 ? "high" : x >= 40 ? "mid" : "low";
}

export function bandLabel(b: Band): string {
  return b === "high" ? "강점" : b === "mid" ? "보통" : "보완";
}

function isValid(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 1 && v <= 5;
}

export function score(answers: Answers): ScoreResult {
  let answered = 0;
  let total = 0;
  const scores: DimensionScore[] = [];
  const keyVal: Record<string, number> = {};

  DIMS.forEach((d, di) => {
    let sum = 0;
    let cnt = 0;
    d.items.forEach((it, ii) => {
      total++;
      const raw = answers[itemName(di, ii)];
      if (isValid(raw)) {
        answered++;
        let v = raw;
        if (it.rev) v = 6 - v; // 역채점 변환
        sum += v;
        cnt++;
        if (it.key) keyVal[it.key] = v;
      }
    });
    const mean = cnt ? sum / cnt : 0;
    const idx = cnt ? Math.round(((mean - 1) / 4) * 100) : 0;
    scores.push({ name: d.name, en: d.en, idx, cnt, band: bandOf(idx) });
  });

  // 응답 신뢰도 점검
  let pairsChecked = 0;
  let conflicts = 0;
  for (const [a, b] of PAIRS) {
    if (keyVal[a] !== undefined && keyVal[b] !== undefined) {
      pairsChecked++;
      if (Math.abs(keyVal[a] - keyVal[b]) >= 3) conflicts++;
    }
  }

  let reliability: Reliability;
  if (pairsChecked === 0) {
    reliability = { level: "none", conflicts, pairsChecked, text: "신뢰도 점검 문항 미응답" };
  } else if (conflicts === 0) {
    reliability = {
      level: "good",
      conflicts,
      pairsChecked,
      text: "응답 일관성 양호 — 결과를 신뢰할 수 있습니다.",
    };
  } else if (conflicts === 1) {
    reliability = {
      level: "minor",
      conflicts,
      pairsChecked,
      text: "경미한 응답 불일치 1건 — 대체로 신뢰할 수 있으나 참고 바랍니다.",
    };
  } else {
    reliability = {
      level: "warn",
      conflicts,
      pairsChecked,
      text: `응답 불일치 ${conflicts}건 — 문항을 반대로 이해했거나 성의 없이 답했을 수 있어, 결과 해석에 주의가 필요합니다.`,
    };
  }

  // 요약: index 내림차순 → 상위 2 강점, 하위 2 보완
  const sorted = [...scores].sort((a, b) => b.idx - a.idx);
  const top2 = sorted.slice(0, 2).map((s) => s.name);
  const low2 = sorted.slice(-2).map((s) => s.name);

  return { scores, top2, low2, reliability, answered, total };
}
