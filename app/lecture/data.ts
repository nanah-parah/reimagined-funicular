// 11월 중3 학부모 강의 안내 페이지의 원고 · 수치.
// A는 교육청이 공개한 자료, B는 파라수학의 강의 안내입니다. 두 부분을 섞지 않습니다.
// 그래프의 학교 순서는 교육청 표의 순서 그대로이며, 응답 순으로 정렬하지 않습니다.

export type BarRow = {
  group?: string;
  name: string;
  cap: number; // 세로 표식 (배정 예정 · 모집 정원 · 중점과정 정원)
  value: number; // 막대 (1지망 · 0지망 응답 인원)
};

export type StackRow = {
  group: string;
  name: string;
  fixed: number; // 학교 지정
  choice: number; // 학생 선택
};

export const SCHEDULE: { date: string; item: string; desc: string; hi?: boolean }[] = [
  { date: "11. 9. ~ 11. 12.", item: "고입 선호도 조사 3차", desc: "중학교에서 1지망 학교만 다시 조사합니다" },
  { date: "11. 17. (화)", item: "중학교 석차연명부 작성 기준일", desc: "고입에 반영되는 중학교 성적이 이 날짜로 확정됩니다" },
  { date: "12. 4. ~ 12. 8.", item: "인천포스코고 원서 접수", desc: "" },
  { date: "12. 7. ~ 12. 9.", item: "미추홀외고 · 인천외고 · 인천국제고 원서 접수", desc: "" },
  { date: "12. 7. ~ 12. 11.", item: "평준화지역 일반고 원서 접수", desc: "지망 순서를 적어 제출합니다", hi: true },
  { date: "12. 8. ~ 12. 11.", item: "인천하늘고 원서 접수", desc: "" },
  { date: "1. 6. (수)", item: "평준화 일반고 배정예정자 발표", desc: "" },
  { date: "1. 15. (금)", item: "배정학교 발표", desc: "" },
  { date: "1. 18. (월)", item: "후기고 예비소집", desc: "" },
];

export const ASSIGN_STEPS: { head: string; text: string }[] = [
  { head: "1지망 지원자가 정원 안이면", text: "지원자 전원을 1지망 학교에 배정합니다." },
  {
    head: "1지망 지원자가 정원을 넘으면",
    text: "지망자를 중학교 성적순으로 배열한 뒤 일정한 간격을 두고 배정합니다. 배정되지 않은 학생은 2지망 학교의 배정으로 넘어갑니다.",
  },
  {
    head: "외고 · 국제고 · 자사고를 함께 지원하면",
    text: "1지망 칸에 그 학교를 적고, 불합격하면 2지망부터 배정합니다.",
  },
  {
    head: "남동구 거주 학생의 지망 칸",
    text: "남학생은 필수 지원 7개교와 선택 지원 3개교, 여학생은 필수 지원 6개교와 선택 지원 1개교입니다.",
  },
];

export const ASSIGN_RATES = [
  { v: "85.9%", k: "1지망 학교 배정 비율 · 2024학년도 · 인천 전체" },
  { v: "87.4%", k: "1지망 학교 배정 비율 · 2025학년도 · 인천 전체" },
];

export const BOYS: BarRow[] = [
  { group: "3학교군", name: "도림고", cap: 250, value: 255 },
  { group: "3학교군", name: "동인천고", cap: 222, value: 163 },
  { group: "3학교군", name: "인제고", cap: 278, value: 178 },
  { group: "3학교군", name: "인천남동고", cap: 250, value: 291 },
  { group: "3학교군", name: "인천만수고", cap: 250, value: 252 },
  { group: "3학교군", name: "인천송천고", cap: 222, value: 226 },
  { group: "공동학교군 필수 지원", name: "인천남고", cap: 222, value: 272 },
  { group: "공동학교군 선택 지원", name: "인천고", cap: 220, value: 382 },
  { group: "공동학교군 선택 지원", name: "제물포고", cap: 154, value: 88 },
  { group: "공동학교군 선택 지원", name: "제일고", cap: 175, value: 37 },
];

export const GIRLS: BarRow[] = [
  { group: "3학교군", name: "문일여고", cap: 361, value: 411 },
  { group: "3학교군", name: "숭덕여고", cap: 306, value: 145 },
  { group: "3학교군", name: "인천고잔고", cap: 278, value: 216 },
  { group: "3학교군", name: "인천논현고", cap: 278, value: 352 },
  { group: "공동학교군 필수 지원", name: "석정여고", cap: 222, value: 285 },
  { group: "공동학교군 필수 지원", name: "신명여고", cap: 306, value: 222 },
  { group: "공동학교군 선택 지원", name: "인명여고", cap: 300, value: 131 },
];

export const SPECIAL: BarRow[] = [
  { name: "미추홀외고", cap: 192, value: 360 },
  { name: "인천국제고", cap: 138, value: 269 },
  { name: "인천외고", cap: 225, value: 252 },
  { name: "인천포스코고", cap: 240, value: 312 },
  { name: "인천하늘고", cap: 225, value: 287 },
];

export const IB: BarRow[] = [
  { name: "인제고", cap: 50, value: 8 },
  { name: "대인고", cap: 50, value: 9 },
  { name: "계산여고", cap: 50, value: 5 },
  { name: "연수여고", cap: 50, value: 23 },
];

export const CURRICULUM: StackRow[] = [
  { group: "여자고등학교", name: "신명여고", fixed: 32, choice: 81 },
  { group: "여자고등학교", name: "인명여고", fixed: 35, choice: 73 },
  { group: "여자고등학교", name: "숭덕여고", fixed: 32, choice: 68 },
  { group: "여자고등학교", name: "문일여고", fixed: 38, choice: 56 },
  { group: "남자고등학교", name: "동인천고", fixed: 34, choice: 64 },
  { group: "남자고등학교", name: "인천고", fixed: 34, choice: 59 },
  { group: "남자고등학교", name: "인천만수고", fixed: 37, choice: 56 },
  { group: "남자고등학교", name: "인제고", fixed: 36, choice: 62 },
];

export const PREFERENCE_NOTE = [
  "선호도 응답이며 실제 원서 지원 현황이 아닙니다.",
  "공동학교군 학교의 응답에는 다른 학교군 학생이 포함됩니다.",
];
export const PREFERENCE_SOURCE =
  "인천광역시교육청 「2027학년도 고입 선호도 조사(2차) 결과」 · 조사기준일 2026. 10. 15.";

export const QUESTIONS: { no: string; tag: string; q: string }[] = [
  { no: "01", tag: "지도", q: "전국에서 가장 많이 뽑는 전형이, 서울 상위권에서는 왜 가장 적을까?" },
  { no: "02", tag: "유형", q: "특목고 · 자사고에 가면 수시에 유리할까?" },
  { no: "03", tag: "오해", q: "활동을 많이 하면 정말 생기부가 좋아질까?" },
  { no: "04", tag: "구조", q: "같은 활동을 한 두 기록은 왜 다르게 읽힐까?" },
  { no: "05", tag: "관찰", q: "선생님이 쓰실 수 있는 문장은 어디에서 나올까?" },
  { no: "06", tag: "실행", q: "그래서 우리 아이는 고1 첫 학기에 무엇을 하면 될까?" },
];

export const SENTENCE_A =
  "‘카오스 이론과 프랙탈 차원’을 주제로 복소평면 위의 만델브로 집합을 탐구하고, 하우스도르프 차원과 자기유사성의 개념을 정리하여 해안선 길이 측정 문제에 적용함. 파이썬으로 프랙탈 이미지를 구현해 발표하였으며, 고교 수준을 넘어서는 수학적 개념을 폭넓게 이해하고 있어 수학적 역량이 매우 탁월함.";

export const SENTENCE_B =
  "이차함수의 최댓값을 구하는 수행평가에서, 정의역이 주어진 문제를 꼭짓점의 값으로 답했다가 채점 후 그 이유를 스스로 찾음. 꼭짓점이 정의역 밖에 놓이는 경우를 나누어 다시 풀고, 축의 위치에 따라 최댓값이 달라지는 세 경우를 그래프로 정리해 모둠원에게 설명함. 이후 조건을 바꾼 문제를 직접 만들어 같은 방법이 성립하는지 확인함.";

export const PROFILE: { k: string; v: string; sub: string[] }[] = [
  { k: "경력", v: "前 부천 상동 · 인천 지역 특목고 입시 수학전문학원 전임강사", sub: [] },
  {
    k: "출강",
    v: "인천 · 경기 · 세종 · 대구 · 부산",
    sub: [
      "자사고와 일반고에서 탐구보고서 및 심화탐구보고서, 생활기록부 관리",
      "대입 제시문 면접, MMI 면접 강의",
    ],
  },
  {
    k: "자격",
    v: "진로진학 상담사 1 · 2 · 3급",
    sub: ["한국교육컨설턴트협의회 1급 회원", "사단법인 한국진로진학정보원 1급 회원"],
  },
  { k: "저술", v: "『결정적 코치 14 · 15 대입실전편』 공동 저자", sub: [] },
  { k: "학력", v: "홍익대학교 건축학과 학사", sub: ["홍익대학교 대학원 도시설계공학 석사"] },
];

// 강의 회차 (JSON-LD · 표지 · 신청 표가 함께 씁니다)
export const SESSIONS = [
  { start: "2026-11-22T15:00:00+09:00", end: "2026-11-22T17:00:00+09:00" },
  { start: "2026-11-22T18:00:00+09:00", end: "2026-11-22T20:00:00+09:00" },
];
export const LECTURE_TITLE = "합격하는 생기부는 어떻게 구성되며, 어떻게 평가될까?";
export const PLACE = "1단지 내 파라수학";
export const SMS = "010-3975-4975";
export const TEL = "032-466-2289";
