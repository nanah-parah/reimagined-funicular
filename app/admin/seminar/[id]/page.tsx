import { notFound, redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { roundOf, sectionsFor, shortSession } from "@/lib/seminarQuestions";
import { TRACK_LABEL, displayAnswer, type SeminarRow } from "@/lib/seminarTypes";
import SeminarDetailActions from "@/components/SeminarDetailActions";
import SeminarMemoForm from "@/components/SeminarMemoForm";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function SeminarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data, error } = await supabase
    .from("seminar_responses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();
  const row = data as SeminarRow;

  return (
    <>
      <SeminarDetailActions id={row.id} />

      <div className="sheet">
        <div className="inner">
          <header className="masthead">
            <div className="brand">
              <div className="mark">Parah Mathematics</div>
              <h1>{row.child_name} 학부모님</h1>
              <div className="sub">{roundOf(row.created_at).title}</div>
            </div>
            <div className="meta">
              <div className="row">
                <span className="k">학년</span>
                <span className="v">{TRACK_LABEL[row.track]}</span>
              </div>
              <div className="row">
                <span className="k">회차</span>
                <span className="v">{shortSession(row.session)}</span>
              </div>
              <div className="row">
                <span className="k">연락처</span>
                <span className="v">{row.phone}</span>
              </div>
            </div>
          </header>

          <div className="lead">
            {dateFmt.format(new Date(row.created_at))} 작성 · 학부모{" "}
            <b>{row.parent_name}</b>
            {row.cafe_nick && ` · 카페 닉네임 ${row.cafe_nick}`}
            {row.school && ` · ${row.school}`}
          </div>

          {sectionsFor(row.track).map((sec, si) => (
            <section className="dim" key={sec.id}>
              <div className="dim-head">
                <div className="dim-num">·</div>
                <div className="dim-title">
                  섹션 {si + 1} · {sec.title}
                </div>
                <div className="dim-line" />
              </div>
              {sec.questions.map((q) => {
                const raw = row.answers[q.id];
                const shown = displayAnswer(raw, row.others?.[q.id]);
                return (
                  <div className="da" key={q.id}>
                    <div className="da-q">{q.label}</div>
                    {q.type === "long" ? (
                      <div className="open-answer">
                        {shown[0] || <span className="muted">(미작성)</span>}
                      </div>
                    ) : shown.length === 0 ? (
                      <div className="da-a muted">(미작성)</div>
                    ) : (
                      <div className="da-a">{shown.join(" · ")}</div>
                    )}
                  </div>
                );
              })}
            </section>
          ))}

          <SeminarMemoForm id={row.id} memo={row.admin_memo} />

          <footer className="foot">
            <span className="fw">Parah Mathematics</span>
            <span>학부모 강의 사전조사 · 대외비</span>
          </footer>
        </div>
      </div>
    </>
  );
}
