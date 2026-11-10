import type { Metadata } from "next";
import SeminarForm from "@/components/SeminarForm";

export const metadata: Metadata = {
  title: "파라수학 학부모 강의 사전조사",
  description:
    "합격하는 생기부는 어떻게 구성되며, 어떻게 평가될까? 강의에 앞서 여쭙는 사전조사입니다.",
};

// 공개 작성 링크의 진입 화면 (학부모, 인증 없음)
export default function SeminarPage() {
  return <SeminarForm />;
}
