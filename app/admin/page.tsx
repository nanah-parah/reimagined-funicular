import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { SubmissionRow } from "@/lib/types";
import DashboardTable from "@/components/DashboardTable";
import ShareLink from "@/components/ShareLink";
import { signOutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, created_at, student_name, school, grade, reliability, top_strengths, top_gaps, answered, total"
    )
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as SubmissionRow[];

  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="brand">
          <div className="mark">Parah Mathematics</div>
          <h1>제출 목록</h1>
          <div className="sub">Submissions Dashboard</div>
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
        <span className="admin-tab-on">학습 성향 진단</span>
        <Link href="/admin/seminar">강의 사전조사</Link>
      </nav>

      <ShareLink />

      {error ? (
        <div className="notice" style={{ marginTop: 20 }}>
          목록을 불러오지 못했습니다: {error.message}
        </div>
      ) : (
        <DashboardTable rows={rows} />
      )}
    </div>
  );
}
