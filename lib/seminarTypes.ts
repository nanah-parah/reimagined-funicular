import type { Track } from "./seminarQuestions";
import type { SeminarAnswers } from "./seminarSubmission";

export type SeminarRow = {
  id: string;
  created_at: string;
  parent_name: string;
  phone: string;
  child_name: string;
  cafe_nick: string;
  track: Track;
  session: string;
  school: string;
  answers: SeminarAnswers;
  others: Record<string, string>;
  admin_memo: string;
};

export const TRACK_LABEL: Record<Track, string> = {
  m3: "중3",
  h1: "고1",
};

// 답변을 화면에 보여줄 문자열로. 「기타」는 직접 적은 내용을 함께 보여준다.
export function displayAnswer(
  value: string | string[] | undefined,
  otherText: string | undefined
): string[] {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((v) =>
    v.startsWith("기타") && otherText ? `기타 — ${otherText}` : v
  );
}
