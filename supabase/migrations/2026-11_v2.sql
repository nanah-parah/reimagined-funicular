-- 파라수학 사전 진단 v2 — submissions 테이블에 v2 칸 추가
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 한 번 실행하세요. (여러 번 실행해도 안전)
-- ※ 반드시 v2 코드를 배포하기 "전"에 실행해야 합니다. 순서가 바뀌면 그 사이 제출이 실패합니다.

alter table public.submissions
  add column if not exists version text not null default 'v1',  -- 기존 행은 모두 v1
  add column if not exists school_level text,                   -- 초 / 중 / 고 (v2)
  add column if not exists guardian_name text,                  -- 보호자 성함 (초4~중2, v2)
  add column if not exists guardian_confirmed boolean,          -- 보호자 확인 체크 (v2)
  add column if not exists situation jsonb,                     -- XIII 공부 상황 { s_hours: "3–7시간", ... }
  add column if not exists aux_scores jsonb;                    -- 보조 지표·메타인지 세 묶음

-- 학교급별 평균(같은 학교급 v2 응답 10명 이상) 조회용
create index if not exists submissions_version_level_idx
  on public.submissions (version, school_level);
