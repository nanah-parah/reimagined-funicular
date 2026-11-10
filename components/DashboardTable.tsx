"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SubmissionRow } from "@/lib/types";
import { RELIABILITY_LABEL, RELIABILITY_COLOR } from "@/lib/types";

const dateFmt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(iso: string): string {
  try {
    return dateFmt.format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

type SortKey = "new" | "old" | "name";

export default function DashboardTable({ rows }: { rows: SubmissionRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("new");

  const view = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = rows.filter(
        (r) =>
          r.student_name.toLowerCase().includes(q) ||
          r.school.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === "name") {
      sorted.sort((a, b) => a.student_name.localeCompare(b.student_name, "ko"));
    } else if (sort === "old") {
      sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
    } else {
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return sorted;
  }, [rows, query, sort]);

  return (
    <div className="dash">
      <div className="dash-controls">
        <input
          className="dash-search"
          placeholder="이름 또는 학교로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="dash-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          <option value="new">최신순</option>
          <option value="old">오래된순</option>
          <option value="name">이름순</option>
        </select>
        <span className="dash-count">{view.length}건</span>
      </div>

      {view.length === 0 ? (
        <div className="dash-empty">
          {rows.length === 0
            ? "아직 제출된 응답이 없습니다."
            : "검색 결과가 없습니다."}
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>작성일</th>
                <th>성명</th>
                <th>학교</th>
                <th>학년</th>
                <th>신뢰도</th>
                <th>강점</th>
                <th>보완</th>
                <th>응답</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {view.map((r) => (
                <tr key={r.id}>
                  <td className="num">{formatDate(r.created_at)}</td>
                  <td className="strong">{r.student_name}</td>
                  <td>{r.school}</td>
                  <td>{r.grade}</td>
                  <td>
                    <span
                      className="badge"
                      style={{ color: RELIABILITY_COLOR[r.reliability.level] }}
                    >
                      {RELIABILITY_LABEL[r.reliability.level]}
                    </span>
                  </td>
                  <td className="soft">{r.top_strengths.join(" · ")}</td>
                  <td className="soft">{r.top_gaps.join(" · ")}</td>
                  <td className="num">
                    {r.answered}/{r.total}
                  </td>
                  <td>
                    <Link className="view-link" href={`/admin/submissions/${r.id}`}>
                      보기
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
