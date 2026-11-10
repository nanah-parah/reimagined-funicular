import { describe, it, expect } from "vitest";
import { scoreV2, levelAverage } from "./scoringV2";
import { score } from "./scoring";
import { validateSubmission } from "./submission";
import {
  ALL_SCALE_ITEMS_V2,
  DIMS_V2,
  MODULES,
  SITUATION,
  TOTAL_SCALE_V2,
  situationApplies,
  type AnswersV2,
} from "./questionsV2";

function fillAll(value: number, reverseAware = false): AnswersV2 {
  const a: AnswersV2 = {};
  for (const it of ALL_SCALE_ITEMS_V2) a[it.id] = reverseAware && it.rev ? 6 - value : value;
  return a;
}

describe("v2 문항 수", () => {
  it("척도 문항은 62개 (8차원 39 + 참고 1 + 보조 지표 22)", () => {
    expect(TOTAL_SCALE_V2).toBe(62);
    expect(DIMS_V2.reduce((n, d) => n + d.items.length, 0)).toBe(39);
    expect(MODULES.reduce((n, m) => n + m.items.length, 0)).toBe(22);
    expect(new Set(ALL_SCALE_ITEMS_V2.map((i) => i.id)).size).toBe(62); // 키 중복 없음
  });
});

describe("검증 1 — 모든 척도 문항 3", () => {
  const r = scoreV2(fillAll(3));
  it("8차원 모두 50", () => {
    for (const s of r.scores) {
      expect(s.idx).toBe(50);
      expect(s.insufficient).toBe(false);
    }
  });
  it("보조 지표 칸과 메타인지 세 묶음 모두 50", () => {
    for (const m of r.aux.modules) for (const c of m.cells) expect(c.idx).toBe(50);
    for (const g of r.aux.metacog) expect(g.idx).toBe(50);
  });
  it("척도 응답 62/62", () => {
    expect(r.answered).toBe(62);
    expect(r.total).toBe(62);
  });
});

describe("검증 2 — 모두 5, 역채점 문항은 1", () => {
  it("8차원 모두 100", () => {
    const r = scoreV2(fillAll(5, true));
    for (const s of r.scores) expect(s.idx).toBe(100);
  });
});

describe("검증 3 — 시험 관련 문항을 모두 '해당 없음'으로 한 중1", () => {
  const a = fillAll(3);
  for (const it of ALL_SCALE_ITEMS_V2) if (it.na) a[it.id] = "na";
  const r = scoreV2(a);
  const test = r.scores.find((s) => s.name === "시험 · 평가 태도")!;
  it("시험 태도는 응답 0/4 → 응답 부족", () => {
    expect(test.cnt).toBe(0);
    expect(test.na).toBe(4);
    expect(test.insufficient).toBe(true);
  });
  it("응답 부족 차원은 요약 소견 후보에서 빠진다", () => {
    expect(r.top2).not.toContain("시험 · 평가 태도");
    expect(r.low2).not.toContain("시험 · 평가 태도");
  });
  it("메타인지는 3번만 해당 없음 → 6/7, 평균에서 제외", () => {
    const meta = r.scores[4];
    expect(meta.cnt).toBe(6);
    expect(meta.idx).toBe(50);
    expect(meta.insufficient).toBe(false);
  });
  it("'해당 없음'은 하단 안내에서 응답한 것으로 센다", () => {
    expect(r.answered).toBe(62);
  });
  it("2/4 응답은 절반이므로 응답 부족이 아니다", () => {
    const b: AnswersV2 = { d7_i0: 3, d7_i1: 3, d7_i2: "na" };
    expect(scoreV2(b).scores[7].insufficient).toBe(false);
    expect(scoreV2({ d7_i0: 3 }).scores[7].insufficient).toBe(true);
  });
});

describe("검증 5 — I-6은 동기에서는 역채점, 모듈 1 [외적]에서는 정채점", () => {
  it("I-6만 5로 답하면 동기 0, 외적 100", () => {
    const r = scoreV2({ d0_i5: 5 });
    expect(r.scores[0].idx).toBe(0); // 6-5=1 → 0
    const ext = r.aux.modules[0].cells.find((c) => c.key === "ext")!;
    expect(ext.idx).toBe(100); // 5 그대로 → 100
    expect(ext.cnt).toBe(1);
  });
  it("VIII-2는 모듈 2 [마음]에서 역채점", () => {
    const r = scoreV2({ d7_i1: 5 });
    expect(r.aux.modules[1].cells.find((c) => c.key === "emo")!.idx).toBe(0);
  });
});

describe("메타인지 세 묶음", () => {
  it("계획(1) / 알아채기(2·4·5) / 고치기(3·6·7, 7번 역채점)", () => {
    const r = scoreV2({ d4_i0: 5, d4_i1: 1, d4_i3: 1, d4_i4: 1, d4_i2: 5, d4_i5: 5, d4_i6: 1 });
    expect(r.aux.metacog.map((g) => g.idx)).toEqual([100, 0, 100]);
  });
});

describe("검증 6 — v1 응답은 이전과 같은 점수", () => {
  // v1 샘플 (38문항). 기대값은 개정 전 원본 score()로 계산한 값.
  const v1: Record<string, number> = {
    d0_i0: 4, d0_i1: 3, d0_i2: 4, d0_i3: 2, d0_i4: 3, d0_i5: 2,
    d1_i0: 4, d1_i1: 3, d1_i2: 3, d1_i3: 3, d1_i4: 2, d1_i5: 3,
    d2_i0: 5, d2_i1: 4, d2_i2: 2, d2_i3: 3,
    d3_i0: 4, d3_i1: 3, d3_i2: 3, d3_i3: 3,
    d4_i0: 2, d4_i1: 3, d4_i2: 4, d4_i3: 3, d4_i4: 3, d4_i5: 3,
    d5_i0: 2, d5_i1: 3, d5_i2: 2, d5_i3: 4,
    d6_i0: 3, d6_i1: 2, d6_i2: 3, d6_i3: 4,
    d7_i0: 4, d7_i1: 3, d7_i2: 4,
  };
  it("차원 점수·신뢰도·요약이 원본과 같다", () => {
    const r = score(v1);
    expect(r.scores.map((s) => s.idx)).toEqual([58, 58, 75, 56, 50, 31, 38, 33]);
    expect(r.scores.map((s) => s.band)).toEqual(["mid", "mid", "high", "mid", "mid", "low", "low", "low"]);
    expect(r.reliability.level).toBe("good");
    expect(r.top2).toEqual(["성장 마인드셋", "학습 동기"]);
    expect(r.low2).toEqual(["시험 · 평가 태도", "학습 전략"]);
    expect(r.answered).toBe(37);
    expect(r.total).toBe(38);
  });
});

describe("학교급별 평균", () => {
  const row = { dimension_scores: scoreV2(fillAll(3)).scores };
  it("10명 미만이면 표시하지 않는다", () => {
    expect(levelAverage(Array(9).fill(row))).toBeNull();
  });
  it("10명 이상이면 차원별 평균", () => {
    const avg = levelAverage(Array(10).fill(row))!;
    expect(avg.n).toBe(10);
    expect(avg.byDim["학습 동기"]).toBe(50);
  });
});

describe("검증 4 — 학년에 따른 분기와 보호자 확인", () => {
  const base = {
    version: "v2",
    consent: true,
    name: "테스트",
    school: "파라중",
    answers: {},
    situation: {},
    open: {},
  };
  it("중1: 보호자 성함·확인 없이는 거절", () => {
    const r = validateSubmission({ ...base, grade: "중1" });
    expect(r.ok).toBe(false);
  });
  it("중1: 보호자 정보가 있으면 통과, 학교급 중", () => {
    const r = validateSubmission({ ...base, grade: "중1", guardianName: "보호자", guardianConfirmed: true });
    expect(r.ok && "version" in r.value && r.value.schoolLevel).toBe("중");
  });
  it("고2: 보호자 칸 없이 통과", () => {
    const r = validateSubmission({ ...base, grade: "고2" });
    expect(r.ok).toBe(true);
  });
  it("자유 입력 학년은 v2에서 거절", () => {
    expect(validateSubmission({ ...base, grade: "중학교 2학년" }).ok).toBe(false);
  });
  it("분기 문항: 중1은 지필 시험 횟수, 고2는 모의고사·입시 방향", () => {
    const ids = (lv: "중" | "고") => SITUATION.filter((q) => situationApplies(q, lv)).map((q) => q.id);
    expect(ids("중")).toContain("s_exams");
    expect(ids("중")).not.toContain("s_path");
    expect(ids("고")).toEqual(expect.arrayContaining(["s_harder", "s_path"]));
    expect(ids("고")).not.toContain("s_exams");
  });
  it("학년에 맞지 않는 분기 응답과 허용되지 않은 '해당 없음'은 버리거나 거절", () => {
    const ok = validateSubmission({
      ...base,
      grade: "중3",
      situation: { s_path: "수시", s_exams: "1–2번" },
      answers: { d7_i0: "na" },
    });
    expect(ok.ok && "version" in ok.value && ok.value.situation).toEqual({ s_exams: "1–2번" });
    expect(validateSubmission({ ...base, grade: "중3", answers: { d0_i0: "na" } }).ok).toBe(false);
  });
  it("'없다'를 고른 자유 서술 블록의 텍스트는 버린다", () => {
    const r = validateSubmission({ ...base, grade: "고1", open: { o4_none: true, o4_what: "x", o1: "도형" } });
    expect(r.ok && "version" in r.value && r.value.open).toMatchObject({ o4_none: true, o4_what: "", o1: "도형" });
  });
  it("version이 없으면 v1 형식으로 읽는다", () => {
    const r = validateSubmission({ consent: true, name: "a", school: "b", grade: "중2", answers: { d0_i0: 3 }, open: [] });
    expect(r.ok && !("version" in r.value)).toBe(true);
  });
});
