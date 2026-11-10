-- 파라수학 학부모 강의 사전조사 — 데이터베이스 스키마
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요. (기존 submissions 테이블은 건드리지 않습니다)
-- 보유 기간 : 강의 종료 후 3개월 이내 파기 (동의 문구와 동일하게 운영)

create table if not exists public.seminar_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- 목록 화면에서 바로 쓰는 요약 컬럼 (answers 안의 값을 복사해 둔 것)
  parent_name text not null,
  phone text not null,
  child_name text not null,
  cafe_nick text not null default '',
  track text not null,              -- 'm3' (중3) | 'h1' (고1)
  session text not null default '', -- 희망 회차
  school text not null default '',  -- 재학 중학교 / 고등학교

  -- 전체 응답 { "문항id": "답" | ["답","답"] }
  answers jsonb not null,
  -- 「기타 직접 입력」 칸의 내용 { "문항id": "직접 적은 내용" }
  others jsonb not null default '{}'::jsonb,

  -- 원장 입력
  admin_memo text not null default ''
);

create index if not exists seminar_responses_created_at_idx
  on public.seminar_responses (created_at desc);

-- 행 단위 보안: 기본은 모두 차단, 아래 정책만 허용
alter table public.seminar_responses enable row level security;

-- 공개 작성 링크(익명)는 제출(INSERT)만 가능. 조회는 불가.
drop policy if exists "anon can insert seminar" on public.seminar_responses;
create policy "anon can insert seminar"
  on public.seminar_responses for insert
  to anon
  with check (true);

-- 로그인한 관리자만 조회/수정/삭제
drop policy if exists "authenticated can read seminar" on public.seminar_responses;
create policy "authenticated can read seminar"
  on public.seminar_responses for select
  to authenticated
  using (true);

drop policy if exists "authenticated can update seminar" on public.seminar_responses;
create policy "authenticated can update seminar"
  on public.seminar_responses for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete seminar" on public.seminar_responses;
create policy "authenticated can delete seminar"
  on public.seminar_responses for delete
  to authenticated
  using (true);
