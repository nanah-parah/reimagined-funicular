// 사전 진단 v2 문항 은행 — v2 응답의 문항·역채점·소속의 source of truth.
// v1 정의(lib/questions.ts)는 기존 응답의 결과지를 위해 그대로 둔다.
//
// 응답 키 규칙
//   8차원: v1과 같은 위치 키 d{차원}_i{문항}. 메타인지 7번만 새 키 d4_i6.
//          (끈기 4번·학습 전략 4번·시험 1번은 키는 같고 문장이 바뀌었으므로
//           v1/v2 응답은 version 필드로 구분해 읽는다.)
//   참고 문항: ref_1 / 보조 지표 모듈: m{모듈}_{번호} — 위치가 아닌 고정 ID.

export type AnswerValue = number | "na"; // 1~5, 또는 "아직 해당 없음"
export type AnswersV2 = Record<string, AnswerValue>;

export type ScaleItemV2 = {
  id: string;
  t: string;
  rev?: boolean; // 역채점 (v = 6 - v)
  key?: string; // 응답 일관성 점검 키 (v1과 같은 4쌍)
  na?: boolean; // "아직 해당 없음" 선택지 허용
};

export type DimensionV2 = { name: string; en: string; items: ScaleItemV2[] };

export const ROMAN_V2 = [
  "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV",
];

export const DIMS_V2: DimensionV2[] = [
  {
    name: "학습 동기",
    en: "Motivation",
    items: [
      { id: "d0_i0", t: "새로운 수학 개념을 배우면 더 알고 싶어진다." },
      { id: "d0_i1", t: "어려운 문제라도 풀어내는 과정 자체가 재미있다." },
      { id: "d0_i2", t: "수학은 다른 공부나 생활에 쓸모가 있다고 생각한다." },
      { id: "d0_i3", t: "누가 시키지 않아도 수학 공부를 스스로 챙기는 편이다." },
      { id: "d0_i4", t: "수학 문제를 풀 때 시간 가는 줄 모를 때가 있다.", key: "mot_pos" },
      { id: "d0_i5", t: "수학은 그저 시험 때문에 어쩔 수 없이 한다.", rev: true, key: "mot_neg" },
    ],
  },
  {
    name: "자기효능감",
    en: "Self-efficacy",
    items: [
      { id: "d1_i0", t: "노력하면 어려운 단원도 결국 이해할 수 있다고 믿는다.", key: "eff_pos" },
      { id: "d1_i1", t: "처음 보는 유형의 문제도 도전해 볼 만하다고 느낀다." },
      { id: "d1_i2", t: "시험에서 좋은 결과를 낼 수 있다고 생각한다." },
      { id: "d1_i3", t: "어려운 문제를 만나도 결국 방법을 찾아낼 수 있다고 느낀다." },
      { id: "d1_i4", t: "나는 수학에 소질이 없는 편이라고 생각한다.", rev: true },
      { id: "d1_i5", t: "조금만 어려워져도 내 힘으로는 못 할 것 같다는 생각이 든다.", rev: true, key: "eff_neg" },
    ],
  },
  {
    name: "성장 마인드셋",
    en: "Growth mindset",
    items: [
      { id: "d2_i0", t: "수학 실력은 연습할수록 늘어난다고 생각한다.", key: "mind_pos" },
      { id: "d2_i1", t: "틀린 문제는 내가 성장할 기회라고 여긴다." },
      { id: "d2_i2", t: "수학을 잘하고 못하고는 타고나는 것이라고 생각한다.", rev: true, key: "mind_neg" },
      { id: "d2_i3", t: "아무리 노력해도 안 되는 건 안 된다고 느낄 때가 많다.", rev: true },
    ],
  },
  {
    name: "끈기 · 인내",
    en: "Perseverance",
    items: [
      { id: "d3_i0", t: "한번 시작한 문제는 웬만하면 끝까지 풀어본다.", key: "grit_pos" },
      { id: "d3_i1", t: "답이 막혀도 쉽게 포기하지 않는다." },
      { id: "d3_i2", t: "조금 어려우면 금방 다른 걸 하고 싶어진다.", rev: true, key: "grit_neg" },
      { id: "d3_i3", t: "풀리지 않은 문제를 다음 날 다시 꺼내 본다." }, // v2 교체 (정채점)
    ],
  },
  {
    name: "메타인지 · 자기점검",
    en: "Metacognition",
    items: [
      { id: "d4_i0", t: "공부를 시작하기 전에 무엇을 어떻게 할지 먼저 정한다." },
      { id: "d4_i1", t: "문제를 풀고 나면 제대로 이해했는지 스스로 점검한다." },
      { id: "d4_i2", t: "시험 후에 어디서 왜 틀렸는지 따져보는 편이다.", na: true },
      { id: "d4_i3", t: "모르는 부분이 생기면 그냥 넘기지 않고 표시해 둔다." },
      { id: "d4_i4", t: "내가 무엇을 알고 무엇을 모르는지 비교적 잘 안다." },
      { id: "d4_i5", t: "풀이가 막히면 다른 방법으로 바꿔서 시도해 본다." },
      { id: "d4_i6", t: "틀린 문제는 답만 확인하고 넘어가는 편이다.", rev: true }, // v2 추가
    ],
  },
  {
    name: "학습 전략",
    en: "Strategy",
    items: [
      { id: "d5_i0", t: "새로 배운 내용을 내 말로 다시 정리해 본다." },
      { id: "d5_i1", t: "공식을 외울 때 왜 그런지 이유까지 이해하려 한다." },
      { id: "d5_i2", t: "비슷한 문제끼리 묶거나 틀린 문제를 모아 정리한다." },
      { id: "d5_i3", t: "틀린 문제를 따로 정리하지 않고 넘어가는 편이다.", rev: true }, // v2 교체
    ],
  },
  {
    name: "시간 · 환경 관리",
    en: "Self-regulation",
    items: [
      { id: "d6_i0", t: "정해진 공부 시간이나 계획을 지키려고 노력한다." },
      { id: "d6_i1", t: "공부할 때 휴대폰 등 방해되는 것을 멀리 둔다." },
      { id: "d6_i2", t: "하기 싫은 날에도 해야 할 분량은 하려고 한다." },
      { id: "d6_i3", t: "기분이나 컨디션에 따라 공부량이 들쑥날쑥하다.", rev: true },
    ],
  },
  {
    name: "시험 · 평가 태도",
    en: "Test composure",
    items: [
      { id: "d7_i0", t: "시험을 볼 때 긴장해서 아는 것도 틀리는 일이 종종 있다.", rev: true, na: true }, // v2 교체
      { id: "d7_i1", t: "시험 점수가 떨어지면 한동안 많이 힘들다.", rev: true, na: true },
      { id: "d7_i2", t: "시험 전날 불안해서 집중이 안 될 때가 있다.", rev: true, na: true },
      { id: "d7_i3", t: "시험은 내 실력을 확인하는 기회라고 편하게 생각한다.", na: true },
    ],
  },
];

// 메타인지 세 묶음 (8차원 점수와 별도로 평균만 계산)
export const METACOG_GROUPS: { label: string; ids: string[] }[] = [
  { label: "계획", ids: ["d4_i0"] },
  { label: "알아채기", ids: ["d4_i1", "d4_i3", "d4_i4"] },
  { label: "고치기", ids: ["d4_i2", "d4_i5", "d4_i6"] },
];

// 참고 문항 — 점수에 넣지 않고 결과지에만 표시. 화면에서는 VI 학습 전략 끝에 둔다.
export const REF_ITEMS: ScaleItemV2[] = [
  { id: "ref_1", t: "수학은 결국 문제를 많이 풀어야 잘하게 된다고 생각한다." },
];
export const REF_AFTER_DIM = 5; // 학습 전략(d5) 섹션 끝

// ---- 보조 지표 모듈 (IX~XII) — 8차원에 합산하지 않음 ----

export type ModuleItem = ScaleItemV2 & { cell: string };
// 화면에 다시 보이지 않고 채점에서만 함께 쓰는 기존 문항
export type BorrowedItem = { id: string; cell: string; rev?: boolean };

export type ModuleDef = {
  id: string;
  name: string;
  en: string;
  note: string; // 결과지의 한 줄 설명
  cells: { key: string; label: string }[];
  items: ModuleItem[]; // 화면 표시 순서 (칸별로 몰리지 않게 섞음)
  borrowed: BorrowedItem[];
};

export const MODULES: ModuleDef[] = [
  {
    id: "m1",
    name: "공부하는 이유",
    en: "Why I study",
    note: "높고 낮음보다 칸 사이의 모양을 봅니다.",
    cells: [
      { key: "ext", label: "외적" },
      { key: "intro", label: "내사" },
      { key: "ident", label: "확인" },
      { key: "intr", label: "내적" },
      { key: "amot", label: "무동기" },
    ],
    items: [
      { id: "m1_1", cell: "ext", t: "부모님이나 선생님이 시키니까 수학 공부를 한다." },
      { id: "m1_2", cell: "ident", t: "수학이 내가 하고 싶은 일에 필요하다고 생각해서 공부한다." },
      { id: "m1_3", cell: "intro", t: "공부를 하지 않으면 마음이 불편해서 하게 된다." },
      { id: "m1_4", cell: "amot", t: "왜 수학을 공부해야 하는지 잘 모르겠다." },
      { id: "m1_5", cell: "intro", t: "다른 친구들보다 뒤처질까 봐 걱정되어 공부한다." },
    ],
    borrowed: [
      { id: "d0_i5", cell: "ext" }, // I-6: 동기 차원에서는 역채점, 여기서는 정채점
      { id: "d0_i2", cell: "ident" }, // I-3
      { id: "d0_i0", cell: "intr" }, // I-1
      { id: "d0_i4", cell: "intr" }, // I-5
    ],
  },
  {
    id: "m2",
    name: "어려움을 만났을 때",
    en: "When it goes wrong",
    note: "실패 뒤의 마음, 행동, 어려운 과제를 대하는 쪽을 따로 봅니다.",
    cells: [
      { key: "emo", label: "마음" },
      { key: "act", label: "행동" },
      { key: "chal", label: "난이도" },
    ],
    items: [
      { id: "m2_1", cell: "emo", t: "틀린 문제가 많아도 금방 마음을 추스른다." },
      { id: "m2_2", cell: "chal", t: "쉬운 문제 여러 개보다 어려운 문제 하나를 오래 붙잡는 것이 좋다." },
      { id: "m2_3", cell: "act", t: "시험을 못 본 뒤에는 무엇이 문제였는지 찾아 공부 방법을 바꿔 본다.", na: true },
      { id: "m2_4", cell: "chal", t: "틀릴 것 같은 어려운 문제는 되도록 피하고 싶다.", rev: true },
      { id: "m2_5", cell: "act", t: "결과가 나빴던 단원은 다시 보고 싶지 않다.", rev: true },
    ],
    borrowed: [{ id: "d7_i1", cell: "emo", rev: true }], // VIII-2
  },
  {
    id: "m3",
    name: "공부의 목표",
    en: "What I aim for",
    note: "고등학교는 상대평가 환경이라 수행접근이 높게 나오기 쉽습니다. 학교급을 함께 보고 읽습니다.",
    cells: [
      { key: "map", label: "숙달접근" },
      { key: "mav", label: "숙달회피" },
      { key: "pap", label: "수행접근" },
      { key: "pav", label: "수행회피" },
    ],
    items: [
      { id: "m3_1", cell: "map", t: "점수보다 개념을 정말로 이해하게 되는 것이 더 중요하다." },
      { id: "m3_2", cell: "pap", t: "친구들보다 수학을 잘한다는 것을 보여 주고 싶다." },
      { id: "m3_3", cell: "mav", t: "배운 것 중 하나라도 놓칠까 봐 걱정된다." },
      { id: "m3_4", cell: "pav", t: "다른 사람 앞에서 문제를 틀리는 것이 창피하다." },
      { id: "m3_5", cell: "pap", t: "다른 친구들보다 높은 성적을 받는 것이 나에게 중요하다." },
      { id: "m3_6", cell: "map", t: "어려운 개념을 완전히 내 것으로 만들고 싶다." },
      { id: "m3_7", cell: "pav", t: "모르는 것을 질문하면 못하는 것처럼 보일까 봐 망설인다." },
      { id: "m3_8", cell: "mav", t: "완벽하게 이해하지 못한 채 다음으로 넘어가는 것이 불안하다." },
    ],
    borrowed: [],
  },
  {
    id: "m4",
    name: "수학을 배울 때",
    en: "Learning math",
    note: "시험 태도와 함께 읽어, 시험 상황의 긴장인지 과목에 대한 불안인지를 가릅니다.",
    cells: [
      { key: "anx", label: "학습 불안" },
      { key: "cmp", label: "비교" },
    ],
    items: [
      { id: "m4_1", cell: "anx", t: "새 단원을 시작할 때 걱정부터 된다." },
      { id: "m4_2", cell: "cmp", t: "수학 시험은 다른 과목 시험보다 더 긴장된다.", na: true },
      { id: "m4_3", cell: "anx", t: "선생님이 새 공식을 설명할 때 따라가지 못할까 봐 불안하다." },
      { id: "m4_4", cell: "anx", t: "수학 숙제를 펼치면 막막한 기분이 든다." },
    ],
    borrowed: [],
  },
];

// 화면에 보이는 척도 문항 전체 (8차원 39 + 참고 1 + 모듈 22 = 62)
export const ALL_SCALE_ITEMS_V2: ScaleItemV2[] = [
  ...DIMS_V2.flatMap((d) => d.items),
  ...REF_ITEMS,
  ...MODULES.flatMap((m) => m.items),
];
export const TOTAL_SCALE_V2 = ALL_SCALE_ITEMS_V2.length; // 62

// ---- 학년 / 학교급 ----

export const GRADES = ["초4", "초5", "초6", "중1", "중2", "중3", "고1", "고2", "고3"] as const;
export type Grade = (typeof GRADES)[number];
export type SchoolLevel = "초" | "중" | "고";

export function isGrade(g: unknown): g is Grade {
  return typeof g === "string" && (GRADES as readonly string[]).includes(g);
}
export function schoolLevelOf(g: Grade): SchoolLevel {
  return g[0] as SchoolLevel;
}
export const SCHOOL_LEVEL_LABEL: Record<SchoolLevel, string> = {
  초: "초등학교",
  중: "중학교",
  고: "고등학교",
};
// 만 14세 미만일 수 있는 학년 — 보호자 성함·확인 필수
export function needsGuardian(g: Grade): boolean {
  return ["초4", "초5", "초6", "중1", "중2"].includes(g);
}
export const YOUNG_GRADE_NOTE = "초등 4학년 이하는 상담에서 함께 이야기하는 방식을 권합니다.";

// ---- XIII 공부 상황 (선택형) ----

export type SituationQ = {
  id: string;
  label: string;
  options: string[];
  only?: "elemMid" | "high"; // 초4~중3만 / 고1~고3만
};

const NO_EXAM = "아직 시험을 본 적 없다";

export const SITUATION: SituationQ[] = [
  {
    id: "s_hours",
    label: "일주일에 혼자 수학을 공부하는 시간",
    options: ["3시간 미만", "3–7시간", "7–12시간", "12–20시간", "20시간 이상"],
  },
  {
    id: "s_answer_key",
    label: "답지를 보는 때",
    options: ["막히면 바로 본다", "한 번 더 풀어 보고 본다", "끝까지 안 보는 편이다"],
  },
  {
    id: "s_pace",
    label: "지금 배우는 진도",
    options: ["학교 진도와 같다", "한 학기 앞", "1년 이상 앞"],
  },
  {
    id: "s_stuck",
    label: "시험에서 풀리지 않는 문제를 만나면",
    options: [
      "표시하고 넘어갔다가 나중에 돌아온다",
      "그 자리에서 끝까지 붙잡는다",
      "번호를 하나 고르고 넘어간다",
      NO_EXAM,
    ],
  },
  {
    id: "s_time",
    label: "지난 학교 시험에서 시간은",
    options: ["남았다", "딱 맞았다", "모자라서 못 푼 문제가 있었다", NO_EXAM],
  },
  {
    id: "s_review",
    label: "다 푼 뒤 다시 보는 것은",
    options: ["대부분 다시 본다", "일부만 본다", "거의 못 본다", NO_EXAM],
  },
  {
    id: "s_where",
    label: "이 진단은 어디서 작성했나요",
    options: ["혼자", "부모님과 함께", "학원에서"],
  },
  {
    id: "s_exams",
    label: "지금까지 본 학교 지필 시험",
    options: ["없다", "1–2번", "3번 이상"],
    only: "elemMid",
  },
  {
    id: "s_harder",
    label: "학교 시험과 모의고사 중 더 어렵게 느끼는 쪽",
    options: ["학교 시험", "모의고사", "비슷하다"],
    only: "high",
  },
  {
    id: "s_path",
    label: "생각하는 입시 방향",
    options: ["정시", "수시", "아직 모름"],
    only: "high",
  },
];

export function situationApplies(q: SituationQ, level: SchoolLevel | null): boolean {
  if (!q.only) return true;
  if (!level) return false;
  return q.only === "high" ? level === "고" : level !== "고";
}

// ---- XIV 자유 서술 ----

export type OpenBlock = {
  label: string;
  fields: { id: string; label?: string }[];
  none?: { id: string; label: string }; // "없다" 체크 칸
};

export const OPEN_V2: OpenBlock[] = [
  {
    label: "지금 가장 자신 있는 단원과, 가장 자신 없는 단원은?",
    fields: [{ id: "o1" }, { id: "o1_why", label: "그렇게 생각하는 이유는?" }],
  },
  {
    label: "이전에 공부하던 방식(학원·인강 등)은 어땠나요?",
    fields: [
      { id: "o2_good", label: "이전 방식에서 좋았던 점" },
      { id: "o2_bad", label: "아쉬웠던 점" },
    ],
  },
  { label: "모르는 문제가 생기면 평소 어떻게 하나요?", fields: [{ id: "o3" }] },
  {
    label: "최근에 답지를 보거나 포기했던 문제가 있나요?",
    fields: [
      { id: "o4_what", label: "어떤 문제였나요" },
      { id: "o4_where", label: "어디서 막혔나요" },
    ],
    none: { id: "o4_none", label: "최근에 그런 문제가 없다" },
  },
  {
    label: "시간을 많이 썼는데도 결과가 잘 안 나왔던 단원이나 시험이 있나요?",
    fields: [
      { id: "o5_what", label: "어떤 단원·시험이었나요" },
      { id: "o5_why", label: "왜 그랬다고 생각하나요" },
    ],
    none: { id: "o5_none", label: "그런 적이 없다" },
  },
  { label: "앞으로 수학 공부에서 가장 바라는 점은?", fields: [{ id: "o6" }] },
  { label: "수학 말고 좋아하거나 오래 해 온 것이 있다면?", fields: [{ id: "o7" }] },
  { label: "선생님이 나에 대해 알아 주었으면 하는 것이 있다면?", fields: [{ id: "o8" }] },
];

// 자유 서술 응답: 텍스트 칸은 문자열, "없다" 칸은 boolean
export type OpenAnswersV2 = Record<string, string | boolean>;

// 섹션 번호 (화면·결과지 공용)
export const SECTION_NO = {
  dims: 1, // I~VIII
  modules: 9, // IX~XII
  situation: 13, // XIII
  open: 14, // XIV
};
