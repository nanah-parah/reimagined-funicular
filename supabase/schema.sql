-- 파라수학 사전 진단 — 데이터베이스 스키마 (v1 기준)
-- v2 칸은 supabase/migrations/2026-11_v2.sql 에서 추가한다.
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
-- 수집 항목은 이름·학교·학년으로 한정한다. 민감·식별 정보는 저장하지 않는다.

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- 인적사항 (수집 최소화)
  student_name text not null,
  school text not null,
  grade text not null,

  -- 원시 응답 { "d0_i0": 1~5, ... }
  answers jsonb not null,

  -- 서버에서 권위 있게 재계산한 채점 결과
  dimension_scores jsonb not null,   -- [{ name, en, idx, cnt, band }, ...]
  reliability jsonb not null,        -- { level, conflicts, pairsChecked, text }
  top_strengths jsonb not null,      -- ["학습 동기", ...]  상위 2
  top_gaps jsonb not null,           -- [...]               하위 2
  open_answers jsonb not null,       -- ["...", "...", "...", "..."]
  answered int not null,
  total int not null,

  -- 원장 입력 (5단계에서 사용)
  admin_memo text not null default '',
  recommendation text not null default ''
);

create index if not exists submissions_created_at_idx
  on public.submissions (created_at desc);

-- 행 단위 보안: 기본은 모두 차단, 아래 정책만 허용
alter table public.submissions enable row level security;

-- 공개 작성 링크(익명)는 제출(INSERT)만 가능. 조회는 불가.
drop policy if exists "anon can insert submissions" on public.submissions;
create policy "anon can insert submissions"
  on public.submissions for insert
  to anon
  with check (true);

-- 로그인한 관리자만 조회/수정/삭제 (4단계에서 인증 연결)
drop policy if exists "authenticated can read submissions" on public.submissions;
create policy "authenticated can read submissions"
  on public.submissions for select
  to authenticated
  using (true);

drop policy if exists "authenticated can update submissions" on public.submissions;
create policy "authenticated can update submissions"
  on public.submissions for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete submissions" on public.submissions;
create policy "authenticated can delete submissions"
  on public.submissions for delete
  to authenticated
  using (true);
