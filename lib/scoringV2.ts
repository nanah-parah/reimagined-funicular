// v2 채점 — 8차원 계산 방식은 v1(lib/scoring.ts)과 같다:
//   역채점 v = 6 - v, 응답한 문항 평균을 round((mean-1)/4*100)으로 환산.
// 달라진 점
//   - "해당 없음"과 빈 응답은 평균에서 제외한다.
//   - 차원마다 응답 수/전체 수를 기록하고, 절반 미만이면 "응답 부족"으로 표시한다.
//   - 보조 지표(모듈 1~4)와 메타인지 세 묶음은 8차원과 따로 계산한다(라벨 없음).

import { PAIRS } from "./questions";
import { bandOf, reliabilityOf, type DimensionScore, type ScoreResult } from "./scoring";
import {
  ALL_SCALE_ITEMS_V2,
  DIMS_V2,
  METACOG_GROUPS,
  MODULES,
  TOTAL_SCALE_V2,
  type AnswersV2,
  type AnswerValue,
} from "./questionsV2";

export type CellScore = {
  key: string;
  label: string;
  idx: number | null; // 응답이 하나도 없으면 null
  cnt: number;
  total: number;
};

export type ModuleScore = { id: string; name: string; cells: CellScore[] };

export type AuxScores = {
  modules: ModuleScore[];
  metacog: CellScore[]; // 계획 / 알아채기 / 고치기
};

export type ScoreResultV2 = ScoreResult & { aux: AuxScores };

function numeric(v: AnswerValue | undefined): number | null {
  return typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5 ? v : null;
}

function toIdx(sum: number, cnt: number): number {
  return Math.round(((sum / cnt - 1) / 4) * 100);
}

function cellScore(
  key: string,
  label: string,
  members: { id: string; rev?: boolean }[],
  answers: AnswersV2
): CellScore {
  let sum = 0;
  let cnt = 0;
  for (const m of members) {
    const raw = numeric(answers[m.id]);
    if (raw === null) continue;
    sum += m.rev ? 6 - raw : raw;
    cnt++;
  }
  return { key, label, idx: cnt ? toIdx(sum, cnt) : null, cnt, total: members.length };
}

export function scoreV2(answers: AnswersV2): ScoreResultV2 {
  const keyVal: Record<string, number> = {};

  const scores: DimensionScore[] = DIMS_V2.map((d) => {
    let sum = 0;
    let cnt = 0;
    let na = 0;
    for (const it of d.items) {
      const a = answers[it.id];
      if (a === "na") {
        na++;
        continue;
      }
      const raw = numeric(a);
      if (raw === null) continue;
      const v = it.rev ? 6 - raw : raw;
      sum += v;
      cnt++;
      if (it.key) keyVal[it.key] = v;
    }
    const total = d.items.length;
    const idx = cnt ? toIdx(sum, cnt) : 0;
    return {
      name: d.name,
      en: d.en,
      idx,
      cnt,
      band: bandOf(idx),
      total,
      na,
      insufficient: cnt * 2 < total,
    };
  });

  const reliability = reliabilityOf(keyVal, PAIRS);

  // 요약: "응답 부족" 차원은 강점·보완 후보에서 뺀다.
  const usable = scores.filter((s) => !s.insufficient).sort((a, b) => b.idx - a.idx);
  const top2 = usable.slice(0, 2).map((s) => s.name);
  const low2 = usable.length > 2 ? usable.slice(-2).map((s) => s.name) : [];

  // 척도 응답 수: "해당 없음"도 응답한 것으로 센다 (화면 하단 안내와 같은 기준)
  const answered = ALL_SCALE_ITEMS_V2.filter((it) => {
    const a = answers[it.id];
    return a === "na" || numeric(a) !== null;
  }).length;

  const modules: ModuleScore[] = MODULES.map((m) => ({
    id: m.id,
    name: m.name,
    cells: m.cells.map((c) =>
      cellScore(
        c.key,
        c.label,
        [
          ...m.items.filter((it) => it.cell === c.key),
          ...m.borrowed.filter((b) => b.cell === c.key),
        ],
        answers
      )
    ),
  }));

  const metaItems = DIMS_V2[4].items;
  const metacog = METACOG_GROUPS.map((g) =>
    cellScore(
      g.label,
      g.label,
      g.ids.map((id) => ({ id, rev: metaItems.find((it) => it.id === id)?.rev })),
      answers
    )
  );

  return {
    scores,
    top2,
    low2,
    reliability,
    answered,
    total: TOTAL_SCALE_V2,
    aux: { modules, metacog },
  };
}

// 학교급별 평균 — 같은 학교급 v2 응답이 minN명 이상일 때만 (그 미만이면 null).
// "응답 부족" 차원은 그 학생의 값을 평균에서 뺀다.
export const LEVEL_AVG_MIN_N = 10;

export function levelAverage(
  rows: { dimension_scores: DimensionScore[] }[],
  minN = LEVEL_AVG_MIN_N
): { n: number; byDim: Record<string, number> } | null {
  if (rows.length < minN) return null;
  const sum: Record<string, number> = {};
  const cnt: Record<string, number> = {};
  for (const r of rows) {
    for (const s of r.dimension_scores ?? []) {
      if (s.insufficient) continue;
      sum[s.name] = (sum[s.name] ?? 0) + s.idx;
      cnt[s.name] = (cnt[s.name] ?? 0) + 1;
    }
  }
  const byDim: Record<string, number> = {};
  for (const k of Object.keys(sum)) byDim[k] = Math.round(sum[k] / cnt[k]);
  return { n: rows.length, byDim };
}
