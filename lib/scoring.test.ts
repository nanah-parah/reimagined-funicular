import { describe, it, expect } from "vitest";
import { score, bandOf, type Answers } from "./scoring";
import { DIMS, TOTAL_QUESTIONS, itemName } from "./questions";

// 모든 문항을 같은 값으로 채운 응답 생성
function fillAll(value: number): Answers {
  const a: Answers = {};
  DIMS.forEach((d, di) => d.items.forEach((_, ii) => (a[itemName(di, ii)] = value)));
  return a;
}

describe("bandOf — 구간 경계 (7번 규칙)", () => {
  it("65 이상은 강점", () => {
    expect(bandOf(65)).toBe("high");
    expect(bandOf(100)).toBe("high");
  });
  it("40 이상 65 미만은 보통", () => {
    expect(bandOf(40)).toBe("mid");
    expect(bandOf(64)).toBe("mid");
  });
  it("40 미만은 보완", () => {
    expect(bandOf(39)).toBe("low");
    expect(bandOf(0)).toBe("low");
  });
});

describe("차원 지수 공식 index = round((mean-1)/4*100)", () => {
  it("모두 3점이면 모든 차원 50 / 보통", () => {
    const r = score(fillAll(3));
    expect(r.total).toBe(TOTAL_QUESTIONS);
    expect(r.total).toBe(38);
    expect(r.answered).toBe(38);
    for (const s of r.scores) {
      expect(s.idx).toBe(50);
      expect(s.band).toBe("mid");
    }
  });

  it("모두 1점: 역채점 문항만 반대로 환산된다", () => {
    const r = score(fillAll(1));
    // 학습 동기(d0): 비역채점 5문항 v=1, 역채점 1문항 v=5 → sum=10, mean=10/6
    // idx = round(((10/6 - 1) / 4) * 100) = round(16.67) = 17 (보완)
    expect(r.scores[0].idx).toBe(17);
    expect(r.scores[0].band).toBe("low");
    // 메타인지(d4): 역채점 없음, 모두 v=1 → mean1 → idx 0
    expect(r.scores[4].idx).toBe(0);
  });
});

describe("역채점 변환 (v = 6 - v)", () => {
  it("비역채점 문항만 1점 → 해당 차원 0", () => {
    const r = score({ [itemName(0, 0)]: 1 }); // d0_i0 (비역채점)
    expect(r.scores[0].idx).toBe(0);
    expect(r.scores[0].cnt).toBe(1);
    expect(r.answered).toBe(1);
  });
  it("역채점 문항만 1점 → 환산값 5 → 해당 차원 100", () => {
    const r = score({ [itemName(0, 5)]: 1 }); // d0_i5 (역채점, mot_neg)
    expect(r.scores[0].idx).toBe(100);
    expect(r.scores[0].cnt).toBe(1);
  });
});

describe("응답 신뢰도 점검 (4쌍, |a-b|>=3)", () => {
  // 쌍 위치: mot(d0_i4 / d0_i5 rev), eff(d1_i0 / d1_i5 rev),
  //          mind(d2_i0 / d2_i2 rev), grit(d3_i0 / d3_i2 rev)
  const consistentPairs: Answers = {
    [itemName(1, 0)]: 4, [itemName(1, 5)]: 2, // eff: 4 vs 6-2=4 → diff 0
    [itemName(2, 0)]: 4, [itemName(2, 2)]: 2, // mind: 4 vs 4 → diff 0
    [itemName(3, 0)]: 4, [itemName(3, 2)]: 2, // grit: 4 vs 4 → diff 0
  };

  it("점검 문항 미응답 → none", () => {
    const r = score({ [itemName(4, 0)]: 3 });
    expect(r.reliability.level).toBe("none");
    expect(r.reliability.pairsChecked).toBe(0);
  });

  it("4쌍 모두 일치 → good, conflicts 0", () => {
    const r = score({
      ...consistentPairs,
      [itemName(0, 4)]: 4, [itemName(0, 5)]: 2, // mot: 4 vs 4 → diff 0
    });
    expect(r.reliability.pairsChecked).toBe(4);
    expect(r.reliability.conflicts).toBe(0);
    expect(r.reliability.level).toBe("good");
  });

  it("1쌍 불일치 → minor", () => {
    const r = score({
      ...consistentPairs,
      [itemName(0, 4)]: 5, [itemName(0, 5)]: 5, // mot: 5 vs 6-5=1 → diff 4 ≥ 3
    });
    expect(r.reliability.conflicts).toBe(1);
    expect(r.reliability.level).toBe("minor");
  });

  it("2쌍 이상 불일치 → warn", () => {
    const r = score({
      [itemName(0, 4)]: 5, [itemName(0, 5)]: 5, // mot diff 4
      [itemName(1, 0)]: 5, [itemName(1, 5)]: 5, // eff: 5 vs 1 → diff 4
      [itemName(2, 0)]: 4, [itemName(2, 2)]: 2, // mind diff 0
      [itemName(3, 0)]: 4, [itemName(3, 2)]: 2, // grit diff 0
    });
    expect(r.reliability.conflicts).toBe(2);
    expect(r.reliability.level).toBe("warn");
  });
});

describe("요약 — 상위 2 강점 / 하위 2 보완", () => {
  it("특정 차원을 높이고 낮추면 top2/low2에 반영", () => {
    const a = fillAll(3);
    // 메타인지(d4, 역채점 없음) 전부 5 → idx 100
    DIMS[4].items.forEach((_, ii) => (a[itemName(4, ii)] = 5));
    // 시험·평가 태도(d7): 비역채점(d7_i3)=1, 역채점 3개=5 → 모두 v=1 → idx 0
    a[itemName(7, 0)] = 5; a[itemName(7, 1)] = 5; a[itemName(7, 2)] = 5; a[itemName(7, 3)] = 1;
    const r = score(a);
    expect(r.scores[4].idx).toBe(100);
    expect(r.scores[7].idx).toBe(0);
    expect(r.top2).toContain("메타인지 · 자기점검");
    expect(r.low2).toContain("시험 · 평가 태도");
  });
});
