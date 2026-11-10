"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BOTH_SESSIONS,
  OTHER_LABEL,
  Round,
  SECTIONS,
  Track,
  shortSession,
} from "@/lib/seminarQuestions";
import { TRACK_LABEL, type SeminarRow } from "@/lib/seminarTypes";

const dateFmt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(iso: string): string {
  try {
    return dateFmt.format(new Date(iso));
  } catch {
    return iso.slice(5, 10);
  }
}

type TrackFilter = "all" | Track;

export default function SeminarDashboard({
  rows,
  round,
}: {
  rows: SeminarRow[];
  round: Round;
}) {
  const sessions = round.sessions;
  const multiTrack = round.tracks.length > 1;
  const sections = SECTIONS.filter((s) => !s.only || round.tracks.includes(s.only));
  const [query, setQuery] = useState("");
  const [trackF, setTrackF] = useState<TrackFilter>("all");
  const [sessionF, setSessionF] = useState("all");

  const view = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (trackF !== "all" && r.track !== trackF) return false;
      if (sessionF !== "all" && r.session !== sessionF) return false;
      if (!q) return true;
      return (
        r.parent_name.toLowerCase().includes(q) ||
        r.child_name.toLowerCase().includes(q) ||
        r.school.toLowerCase().includes(q) ||
        r.phone.includes(q)
      );
    });
  }, [rows, query, trackF, sessionF]);

  const counts = useMemo(() => {
    const m3 = view.filter((r) => r.track === "m3").length;
    const bySession: Record<string, number> = {};
    for (const o of sessions) bySession[o] = 0;
    for (const r of view) {
      if (r.session in bySession) bySession[r.session] += 1;
    }
    return { m3, h1: view.length - m3, bySession };
  }, [view, sessions]);

  // 사전 질문(장문) 모아보기
  const openQuestions = useMemo(
    () =>
      view
        .map((r) => ({
          id: r.id,
          who: `${r.child_name} · ${TRACK_LABEL[r.track]}`,
          text: String(r.answers.f_question ?? "").trim(),
        }))
        .filter((x) => x.text),
    [view]
  );

  return (
    <div className="dash">
      <div className="dash-controls">
        <input
          className="dash-search"
          placeholder="학부모 · 자녀 · 학교 · 연락처로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {multiTrack && (
          <select
            className="dash-sort"
            value={trackF}
            onChange={(e) => setTrackF(e.target.value as TrackFilter)}
          >
            <option value="all">학년 전체</option>
            <option value="m3">중3만</option>
            <option value="h1">고1만</option>
          </select>
        )}
        <select
          className="dash-sort"
          value={sessionF}
          onChange={(e) => setSessionF(e.target.value)}
        >
          <option value="all">회차 전체</option>
          {sessions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <span className="dash-count">{view.length}명</span>
      </div>

      <div className="sum-cards">
        <div className="sum-card">
          <div className="sum-k">신청 인원</div>
          <div className="sum-v">{view.length}</div>
        </div>
        {multiTrack && (
          <div className="sum-card">
            <div className="sum-k">중3 / 고1</div>
            <div className="sum-v">
              {counts.m3} <span className="sum-slash">/</span> {counts.h1}
            </div>
          </div>
        )}
        {sessions.filter((o) => o !== BOTH_SESSIONS).map((o) => (
          <div className="sum-card" key={o}>
            <div className="sum-k">{shortSession(o)}</div>
            <div className="sum-v">
              {counts.bySession[o] + (counts.bySession[BOTH_SESSIONS] ?? 0)}
              <span className="sum-note">
                (확정 {counts.bySession[o]} + 양쪽가능{" "}
                {counts.bySession[BOTH_SESSIONS] ?? 0})
              </span>
            </div>
          </div>
        ))}
      </div>

      {view.length === 0 ? (
        <div className="dash-empty">
          {rows.length === 0
            ? "아직 들어온 응답이 없습니다."
            : "조건에 맞는 응답이 없습니다."}
        </div>
      ) : (
        <>
          {openQuestions.length > 0 && (
            <section className="tally-block">
              <div className="dim-head">
                <div className="dim-num">·</div>
                <div className="dim-title">미리 보내 주신 질문</div>
                <div className="dim-en">{openQuestions.length}건</div>
                <div className="dim-line" />
              </div>
              {openQuestions.map((q) => (
                <div className="preq" key={q.id}>
                  <div className="preq-who">{q.who}</div>
                  <div className="preq-text">{q.text}</div>
                </div>
              ))}
            </section>
          )}

          {sections.map((sec, si) => {
            // 분기 섹션은 해당 학년 응답자만 모수로 잡는다
            const pool = sec.only
              ? view.filter((r) => r.track === sec.only)
              : view;
            const tallyQs = sec.questions.filter(
              (q) => q.type === "choice" || q.type === "multi"
            );
            if (pool.length === 0 || tallyQs.length === 0) return null;

            return (
              <section className="tally-block" key={sec.id}>
                <div className="dim-head">
                  <div className="dim-num">·</div>
                  <div className="dim-title">
                    섹션 {si + 1} · {sec.title}
                  </div>
                  <div className="dim-en">{pool.length}명 기준</div>
                  <div className="dim-line" />
                </div>

                {tallyQs.map((q) => {
                  const opts = [...(q.options ?? [])];
                  if (q.other) opts.push(OTHER_LABEL);
                  const tally = opts.map((o) => {
                    const n = pool.filter((r) => {
                      const a = r.answers[q.id];
                      return Array.isArray(a) ? a.includes(o) : a === o;
                    }).length;
                    return { o, n };
                  });
                  const top = Math.max(1, ...tally.map((t) => t.n));
                  const sorted = [...tally].sort((a, b) => b.n - a.n);

                  return (
                    <div className="tally" key={q.id}>
                      <div className="tally-q">{q.label}</div>
                      {sorted.map((t) => (
                        <div
                          className={`tally-row${t.n === 0 ? " tally-zero" : ""}`}
                          key={t.o}
                        >
                          <div className="tally-o">
                            {t.o === OTHER_LABEL ? "기타" : t.o}
                          </div>
                          <div className="tally-bar">
                            <span style={{ width: `${(t.n / top) * 100}%` }} />
                          </div>
                          <div className="tally-n">{t.n}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </section>
            );
          })}

          <section className="tally-block">
            <div className="dim-head">
              <div className="dim-num">·</div>
              <div className="dim-title">신청자 명단</div>
              <div className="dim-en">{view.length}명</div>
              <div className="dim-line" />
            </div>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>작성</th>
                    <th>학부모</th>
                    <th>자녀</th>
                    <th>학년</th>
                    <th>학교</th>
                    <th>희망 회차</th>
                    <th>연락처</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {view.map((r) => (
                    <tr key={r.id}>
                      <td className="num">{formatDate(r.created_at)}</td>
                      <td className="strong">{r.parent_name}</td>
                      <td>{r.child_name}</td>
                      <td>{TRACK_LABEL[r.track]}</td>
                      <td className="soft">{r.school}</td>
                      <td className="soft">
                        {shortSession(r.session)}
                      </td>
                      <td className="num">{r.phone}</td>
                      <td>
                        <Link className="view-link" href={`/admin/seminar/${r.id}`}>
                          보기
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
