// 강의 사전조사 문항 — 원본(사전조사_문항표.xlsx / 시트 「사전조사 문항」)을 그대로 이식.
// 이 파일이 문항·선택지·분기·필수여부의 source of truth.
// 문구를 고치실 때는 이 파일만 고치면 작성폼·검증·저장·관리자 화면까지 모두 반영됩니다.

export type QType =
  | "short" // 단답
  | "long" // 장문
  | "choice" // 객관식 (하나만)
  | "multi" // 체크박스 (복수)
  | "consent"; // 체크박스 · 동의

export type Question = {
  id: string;
  label: string;
  type: QType;
  required: boolean;
  options?: string[];
  other?: boolean; // "+ 기타 직접 입력" 칸을 둔다
  max?: number; // multi 에서 최대 선택 개수
  help?: string;
  placeholder?: string;
  phone?: boolean; // 010-0000-0000 형식 검사
};

export type Track = "m3" | "h1";

export type Section = {
  id: string;
  title: string;
  intro?: string;
  only?: Track; // 해당 학년에게만 보이는 섹션 (분기)
  questions: Question[];
};

export const OTHER_LABEL = "기타 (직접 입력)";

// 강의 회차 — 새 강의를 열 때는 ROUNDS 맨 앞에 한 줄을 더하면 됩니다.
// 지난 강의는 지우지 말고 남겨 두세요. 관리자 화면에서 그 강의의 응답을 읽을 때 씁니다.
// from 은 이 강의의 응답을 받기 시작한 시각(한국 시각)입니다. 응답은 작성 시각으로 강의에 묶입니다.
export type Round = {
  id: string;
  label: string;
  from: string;
  title: string;
  tracks: Track[]; // 이 강의에서 받는 학년
  sessions: string[]; // 희망 회차 선택지 · 회차가 마감되면 해당 줄을 지우시면 됩니다
  short: Record<string, string>; // 관리자 화면에서 쓰는 짧은 회차 이름
};

export const BOTH_SESSIONS = "둘 다 가능합니다";

export const ROUNDS: Round[] = [
  {
    id: "2026-11",
    label: "11월 · 중3",
    from: "2026-11-01T00:00:00+09:00",
    title: "합격하는 생기부는 어떻게 구성되며, 어떻게 평가될까?",
    tracks: ["m3"],
    sessions: [
      "11월 22일 (일) 오후 3시부터 5시까지",
      "11월 22일 (일) 오후 6시부터 8시까지",
      BOTH_SESSIONS,
    ],
    short: {
      "11월 22일 (일) 오후 3시부터 5시까지": "오후 3시 회차",
      "11월 22일 (일) 오후 6시부터 8시까지": "오후 6시 회차",
    },
  },
  {
    id: "2026-09",
    label: "9월 · 중3 · 고1",
    from: "2026-08-01T00:00:00+09:00",
    title: "합격하는 생기부는 어떻게 구성되고 어떻게 평가될까",
    tracks: ["m3", "h1"],
    sessions: ["9월 2일 (수) 오전 11시", "9월 4일 (금) 오전 11시", BOTH_SESSIONS],
    short: {
      "9월 2일 (수) 오전 11시": "9월 2일 (수)",
      "9월 4일 (금) 오전 11시": "9월 4일 (금)",
    },
  },
];

export const CURRENT_ROUND = ROUNDS[0];
export const SEMINAR_TITLE = CURRENT_ROUND.title;
export const SESSION_OPTIONS = CURRENT_ROUND.sessions;

export function roundOf(createdAt: string): Round {
  const t = new Date(createdAt).getTime();
  return ROUNDS.find((r) => t >= new Date(r.from).getTime()) ?? ROUNDS[ROUNDS.length - 1];
}

export function roundById(id: string | undefined): Round {
  return ROUNDS.find((r) => r.id === id) ?? CURRENT_ROUND;
}

export function shortSession(session: string): string {
  for (const r of ROUNDS) if (r.short[session]) return r.short[session];
  return session;
}

const HIGH_SCHOOLS = [
  "신명여자고등학교",
  "인명여자고등학교",
  "숭덕여자고등학교",
  "문일여자고등학교",
  "동인천고등학교",
  "인천고등학교",
  "만수고등학교",
  "인제고등학교",
  "아직 없습니다",
];

export const SECTIONS: Section[] = [
  {
    id: "s1",
    title: "기본",
    questions: [
      {
        id: "parent_name",
        label: "학부모님 성함",
        type: "short",
        required: true,
        placeholder: "예) 홍길동",
      },
      {
        id: "cafe_nick",
        label: "카페 닉네임",
        type: "short",
        required: false,
        help: "네이버 카페를 통해 신청하신 경우 적어 주세요. 해당하지 않으시면 비워 두셔도 됩니다.",
      },
      {
        id: "phone",
        label: "연락처",
        type: "short",
        required: true,
        phone: true,
        placeholder: "010-0000-0000",
        help: "당일 안내와 자료 전송에만 씁니다.",
      },
      {
        id: "child_name",
        label: "자녀 이름",
        type: "short",
        required: true,
      },
      {
        id: "prev_exp",
        label: "위로 대학 입시를 치른 자녀가 있으신가요",
        type: "choice",
        required: true,
        options: [
          "있습니다 · 최근 3년 이내",
          "있습니다 · 그 이전",
          "없습니다. 이 아이가 처음입니다",
        ],
        help: "경험이 있으신 분과 처음이신 분은 이미 알고 계신 것이 다릅니다. 설명의 깊이를 맞추기 위해 여쭙습니다.",
      },
      {
        id: "session",
        label: "희망 회차",
        type: "choice",
        required: true,
        options: SESSION_OPTIONS,
        help: "문자로 알려 주셨더라도 확인차 다시 여쭙습니다. 두 회차 내용은 같습니다.",
      },
      {
        id: "grade",
        label: "자녀 학년",
        type: "choice",
        required: true,
        options: [
          "중학교 3학년 (2030학년도에 대학에 갑니다)",
          "고등학교 1학년 (2029학년도에 대학에 갑니다)",
        ],
        help: "학년에 따라 다음 질문이 갈립니다.",
      },
    ],
  },

  {
    id: "s2",
    title: "지금 고르고 계신 것",
    only: "m3",
    intro:
      "중3 학부모님께 여쭙습니다. 아직 정하지 못하셨어도 지금 상태 그대로 골라 주시면 됩니다.",
    questions: [
      {
        id: "m3_school",
        label: "현재 재학 중학교",
        type: "short",
        required: true,
        placeholder: "예) 인천서창중학교",
      },
      {
        id: "m3_hs1",
        label: "희망 고등학교 · 1지망",
        type: "choice",
        required: true,
        options: HIGH_SCHOOLS,
        other: true,
        help: "여덟 학교는 이번 강의에서 3개년 교육과정 편성표를 비교해 다루는 곳입니다. 목록에 없는 학교는 「기타」에 직접 적어 주세요. 확정된 것이 아니어도 괜찮습니다.",
      },
      {
        id: "m3_hs2",
        label: "희망 고등학교 · 2지망",
        type: "choice",
        required: true,
        options: HIGH_SCHOOLS,
        other: true,
        help: "1지망과 같아도 됩니다. 아직 없으시면 「아직 없습니다」를 골라 주세요.",
      },
      {
        id: "m3_hstype",
        label: "생각하고 계신 고교 유형",
        type: "choice",
        required: true,
        options: [
          "일반고",
          "자율형 사립고",
          "특수목적고 (외고 · 국제고 · 과학고)",
          "특성화고",
          "아직 정하지 못했습니다",
        ],
      },
      {
        id: "m3_reason",
        label: "그 학교를 지망하시는 이유는 무엇인가요",
        type: "multi",
        required: true,
        options: [
          "통학 거리",
          "내신을 받기에 유리해 보여서",
          "대학 진학 실적",
          "아이가 그 학교를 원해서",
          "아는 아이들이 그 학교에 가서",
          "그 학교의 개설 과목 · 교육과정을 보고",
          "학교 분위기 · 생활지도",
          "아직 이유를 정리해 보지 못했습니다",
        ],
        other: true,
        help: "해당하는 것을 모두 골라 주세요. 순서는 상관없습니다.",
      },
      {
        id: "m3_worry",
        label: "고등학교를 고르시면서 가장 걸리는 것은 무엇인가요",
        type: "choice",
        required: true,
        options: [
          "내신을 잘 받을 수 있을지",
          "아이가 그 학교에 적응할지",
          "통학 거리",
          "아이가 원하는 과목이 개설될지",
          "대학 진학 실적",
          "아이와 의견이 다릅니다",
          "무엇을 기준으로 골라야 할지 모르겠습니다",
        ],
        help: "하나만 골라 주세요. 가장 크게 걸리는 것입니다.",
      },
      {
        id: "m3_credit",
        label:
          "고교학점제에서 2·3학년 과목을 고등학교에 입학한 해에 신청해 확정한다는 것을, 알고 계셨나요",
        type: "choice",
        required: true,
        options: [
          "알고 있었습니다",
          "들어는 봤는데 자세히는 모릅니다",
          "오늘 처음 들었습니다",
        ],
        help: "모르셨다고 답하시는 편이 저에게는 더 유용합니다. 그 대목을 길게 설명드리면 되니까요.",
      },
    ],
  },

  {
    id: "s3",
    title: "한 학기를 보내고",
    only: "h1",
    intro:
      "고1 학부모님께 여쭙습니다. 그날 고1 대목이 이 답변들 위에 놓입니다.",
    questions: [
      {
        id: "h1_school",
        label: "재학 고등학교",
        type: "short",
        required: true,
        placeholder: "예) 인천만수고등학교",
      },
      {
        id: "h1_rank",
        label: "1학기 내신은 대략 어느 구간이었나요",
        type: "choice",
        required: false,
        options: [
          "1등급대",
          "2등급대",
          "3등급대",
          "4등급대",
          "5등급대",
          "아직 정리해 보지 않았습니다",
          "적지 않겠습니다",
        ],
        help: "전 과목 평균의 대략적인 구간입니다. 적지 않으셔도 괜찮습니다. 이 답이 강의 내용을 바꾸지는 않고, 개별 응대 때 제가 헛다리를 짚지 않기 위한 것입니다.",
      },
      {
        id: "h1_subject",
        label: "2학년 과목 선택은 어디까지 진행되었나요",
        type: "choice",
        required: true,
        options: [
          "교육과정 편성표를 받았고 대략 정했습니다",
          "편성표는 받았는데 아직 정하지 못했습니다",
          "편성표를 아직 받지 못했습니다",
          "과목을 선택해야 한다는 것을 오늘 알았습니다",
        ],
      },
      {
        id: "h1_record",
        label: "1학기 생활기록부를 열어 보신 적이 있나요",
        type: "choice",
        required: true,
        options: [
          "전체를 읽어 봤습니다",
          "성적만 봤습니다",
          "아직 못 봤습니다",
          "어디서 어떻게 보는지 모릅니다",
        ],
        help: "「아직 못 봤다」가 가장 흔한 답입니다. 그대로 골라 주세요.",
      },
      {
        id: "h1_materials",
        label:
          "1학기에 아이가 실제로 한 것 중, 지금 자료가 남아 있는 것이 있나요",
        type: "multi",
        required: true,
        options: [
          "수행평가 보고서 · 발표 자료",
          "실험 노트 · 관찰 기록",
          "읽은 책 목록이나 독서 기록",
          "동아리 활동 자료",
          "고쳐 쓴 흔적이 남은 초안",
          "남아 있는 것이 없습니다",
          "남아 있는지 모르겠습니다",
        ],
        help: "아이 방이나 노트북에 남아 있는 것을 떠올려 보시면 됩니다. 없어도 괜찮습니다.",
      },
      {
        id: "h1_reflection",
        label: "한 학기를 보내고 나서 가장 크게 남은 생각은 무엇인가요",
        type: "choice",
        required: true,
        options: [
          "성적이 생각보다 안 나왔습니다",
          "학교생활은 잘 하는 것 같은데 무엇을 하는지 모르겠습니다",
          "중학교 때와 공부하는 방식이 달라야 할 것 같습니다",
          "학교가 챙겨 주는 것과 우리가 챙길 것의 경계를 모르겠습니다",
          "생활기록부를 어떻게 관리해야 할지 모르겠습니다",
          "아직 잘 모르겠습니다",
        ],
        other: true,
        help: "하나만 골라 주세요.",
      },
      {
        id: "h1_teacher",
        label:
          "담임 선생님이나 교과 선생님과 생활기록부에 관해 이야기해 보신 적이 있나요",
        type: "choice",
        required: true,
        options: [
          "상담 때 먼저 여쭤 봤습니다",
          "선생님이 먼저 말씀해 주셨습니다",
          "성적 이야기만 했습니다",
          "상담을 아직 못 했습니다",
          "어떻게 여쭤야 할지 모르겠습니다",
        ],
        help: "학교에 무엇을 어떻게 여쭐 수 있는지가 그날 다루는 내용 중 하나입니다.",
      },
    ],
  },

  {
    id: "s4",
    title: "진로 방향",
    intro:
      "계열이 정해져 있을수록 생활기록부에 세울 주제가 좁혀집니다. 아직 없다면 없는 대로가 답입니다.",
    questions: [
      {
        id: "c_field",
        label: "아이가 관심을 보이는 계열이 있다면",
        type: "multi",
        required: true,
        options: [
          "인문 · 어문",
          "사회 · 상경",
          "자연과학",
          "공학",
          "의약 · 보건",
          "교육",
          "예술 · 체육",
          "아직 모르겠습니다",
        ],
        other: true,
        help: "둘 이상이어도 됩니다. 「아직 모르겠다」가 이 학년에서는 가장 정상적인 답입니다.",
      },
      {
        id: "c_fixed",
        label: "그 방향은 지금 어느 정도 정해진 상태인가요",
        type: "choice",
        required: true,
        options: [
          "학과까지 정했습니다",
          "계열은 정했지만 학과는 아직입니다",
          "두세 계열을 놓고 저울질하고 있습니다",
          "아이는 말이 없고 저만 생각하고 있습니다",
          "전혀 정해진 것이 없습니다",
        ],
        help: "하나만 골라 주세요.",
      },
      {
        id: "c_origin",
        label: "그 방향은 어디에서 나왔나요",
        type: "choice",
        required: true,
        options: [
          "아이가 먼저 말했습니다",
          "학교 진로 검사나 상담에서 나왔습니다",
          "성적에 맞춰 좁혀졌습니다",
          "제가 권했습니다",
          "주변에서 많이 가는 쪽이라서",
          "아직 아무도 정하지 않았습니다",
        ],
        help: "어디에서 나온 방향이냐에 따라 그 뒤에 할 일이 달라집니다.",
      },
      {
        id: "c_agree",
        label: "아이와 부모님의 생각이 같은가요",
        type: "choice",
        required: true,
        options: [
          "같습니다",
          "조금 다릅니다",
          "많이 다릅니다",
          "아이 생각을 아직 못 들었습니다",
          "둘 다 정해진 것이 없습니다",
        ],
      },
      {
        id: "c_done",
        label: "그 계열과 관련해 아이가 실제로 해 본 것이 있다면",
        type: "multi",
        required: true,
        options: [
          "관련된 책을 읽었습니다",
          "학교 수행평가 주제로 다뤄 봤습니다",
          "동아리에서 해 봤습니다",
          "영상이나 강의를 찾아봤습니다",
          "캠프나 체험 프로그램에 가 봤습니다",
          "관련된 사람을 만나 이야기해 봤습니다",
          "아직 없습니다",
          "모르겠습니다",
        ],
        help: "작은 것이라도 괜찮습니다. 여기 적힌 것들이 생활기록부에서 주제가 되는 재료입니다.",
      },
      {
        id: "c_subject_known",
        label: "아이가 그 계열에 필요한 과목이 무엇인지 알고 있나요",
        type: "choice",
        required: true,
        options: [
          "아이도 저도 알고 있습니다",
          "저는 아는데 아이는 모릅니다",
          "아이는 아는데 저는 모릅니다",
          "둘 다 모릅니다",
          "알아볼 계열이 아직 없습니다",
        ],
        help: "고교학점제에서는 이것이 과목 선택으로 바로 이어집니다.",
      },
    ],
  },

  {
    id: "s5",
    title: "마지막으로",
    questions: [
      {
        id: "f_anxiety",
        label: "지금 가장 불안한 것 하나를 고르신다면",
        type: "choice",
        required: true,
        options: [
          "성적이 안 나오는 것",
          "생활기록부를 어떻게 채울지 모르는 것",
          "아이가 스스로 하지 않는 것",
          "진로가 정해지지 않은 것",
          "정보가 없어서 뒤처지는 것 같은 것",
          "무엇이 불안한지도 모르겠는 것",
        ],
        help: "개별로 이야기 나눌 때 여기서부터 시작하겠습니다.",
      },
      {
        id: "f_infosrc",
        label: "대입 정보를 주로 어디에서 얻으시나요",
        type: "multi",
        required: true,
        options: [
          "학교 설명회와 가정통신문",
          "유튜브",
          "맘카페와 인터넷 카페",
          "학원 상담",
          "주변 학부모",
          "입시 관련 책",
          "거의 찾아보지 않습니다",
        ],
        help: "어디에서 보셨느냐에 따라 바로잡아야 할 대목이 달라집니다.",
      },
      {
        id: "f_topics",
        label: "특히 길게 듣고 싶으신 대목이 있다면",
        type: "multi",
        required: true,
        max: 2,
        options: [
          "전형 지도 · 어떤 전형이 어디서 얼마나 뽑는지",
          "생활기록부가 실제로 어떤 구조로 짜이는지",
          "아이가 선생님께 어떻게 관찰되는지",
          "과목 선택 · 무엇을 기준으로 고르는지",
          "내신 5등급제가 실제로 바꾸는 것",
          "인천에서 쓸 수 있는 자료와 기관",
        ],
        help: "최대 두 개까지 골라 주세요. 강의 순서는 그대로 두되, 시간 배분을 조금 조정합니다.",
      },
      {
        id: "f_question",
        label: "미리 보내 주실 질문이 있다면",
        type: "long",
        required: false,
        help: "질의 시간에 이름 없이 다룹니다. 자리에서 손을 들기 어려운 질문일수록 여기에 적어 주세요.",
      },
    ],
  },
];

// 개인정보 수집·이용 안내 (섹션 5의 마지막 문항)
export const CONSENT = {
  title: "개인정보 수집 · 이용 안내",
  lines: [
    "수집 항목 : 학부모님 성함, 카페 닉네임, 연락처, 자녀 이름 · 학년 · 학교, 위 응답 내용",
    "이용 목적 : 본 강의의 자료 준비와 당일 안내",
    "보유 기간 : 강의 종료 후 3개월 이내 파기",
  ],
  agree: "위 내용에 동의합니다",
};

// ── 헬퍼 ────────────────────────────────────────────────

// 자녀 학년 답변 → 분기 트랙
export function trackOf(gradeAnswer: string | undefined): Track | null {
  if (!gradeAnswer) return null;
  if (gradeAnswer.startsWith("중학교")) return "m3";
  if (gradeAnswer.startsWith("고등학교")) return "h1";
  return null;
}

// 해당 트랙에서 실제로 보이는 섹션들
export function sectionsFor(track: Track | null): Section[] {
  return SECTIONS.filter((s) => !s.only || s.only === track);
}

// 해당 트랙에서 실제로 답해야 하는 문항들
export function questionsFor(track: Track | null): Question[] {
  return sectionsFor(track).flatMap((s) => s.questions);
}

export const ALL_QUESTIONS: Question[] = SECTIONS.flatMap((s) => s.questions);

export function questionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id);
}

// 이번 강의가 한 학년만 받으면 학년 문항을 묻지 않고 그 학년으로 채운다.
export const FIXED_TRACK: Track | null =
  CURRENT_ROUND.tracks.length === 1 ? CURRENT_ROUND.tracks[0] : null;

export function gradeOptionFor(track: Track): string {
  const opts = questionById("grade")?.options ?? [];
  return opts.find((o) => trackOf(o) === track) ?? "";
}

export const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/;

export function normalizePhone(v: string): string {
  const d = v.replace(/[^0-9]/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return v.trim();
}
