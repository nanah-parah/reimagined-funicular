import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ROUNDS, roundById, roundOf } from "@/lib/seminarQuestions";
import type { SeminarRow } from "@/lib/seminarTypes";
import SeminarDashboard from "@/components/SeminarDashboard";
import SeminarShareLink from "@/components/SeminarShareLink";
import { signOutAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function SeminarAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const r = (await searchParams).round;
  const round = roundById(typeof r === "string" ? r : undefined);

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data, error } = await supabase
    .from("seminar_responses")
    .select("*")
    .order("created_at", { ascending: false });

  const all = (data ?? []) as SeminarRow[];
  const rows = all.filter((x) => roundOf(x.created_at).id === round.id);

  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="brand">
          <div className="mark">Parah Mathematics</div>
          <h1>강의 사전조사</h1>
          <div className="sub">{round.title}</div>
        </div>
        <div className="admin-bar-right">
          <span className="admin-who">{user.email}</span>
          <form action={signOutAction}>
            <button type="submit" className="logout-btn">
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <nav className="admin-tabs">
        <Link href="/admin">학습 성향 진단</Link>
        <span className="admin-tab-on">강의 사전조사</span>
      </nav>

      <nav className="round-tabs">
        {ROUNDS.map((x) => {
          const n = all.filter((y) => roundOf(y.created_at).id === x.id).length;
          return x.id === round.id ? (
            <span key={x.id} className="round-on">
              {x.label} · {n}명
            </span>
          ) : (
            <Link key={x.id} href={`/admin/seminar?round=${x.id}`}>
              {x.label} · {n}명
            </Link>
          );
        })}
      </nav>

      {round.id === ROUNDS[0].id && <SeminarShareLink />}

      {error ? (
        <div className="notice" style={{ marginTop: 20 }}>
          목록을 불러오지 못했습니다: {error.message}
        </div>
      ) : (
        <SeminarDashboard key={round.id} rows={rows} round={round} />
      )}
    </div>
  );
}
