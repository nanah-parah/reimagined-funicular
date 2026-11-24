# parah-app

파라수학 학습 성향 사전 진단(`/`), 설명회 신청(`/seminar`), 강연 소개(`/lecture`)와 관리자 화면(`/admin`).
Next.js + Supabase, Vercel 배포 (`parah-app.vercel.app`).

## 배포

이 저장소가 Vercel 프로젝트 `nanah-s-projects/parah-app`에 연결되어 있다.

- `main`에 푸시 → 운영(Production) 자동 배포
- 그 밖의 브랜치에 푸시 → 미리보기(Preview) 주소가 따로 생김. 확인 후 `main`에 합친다.
- 로컬에서 `vercel deploy`로 직접 올리지 않는다. 저장소와 운영 코드가 어긋난다.
- 되돌리기: Vercel → Deployments → 이전 배포 → Promote to Production

## 데이터베이스 (Supabase)

- 기본 스키마: `supabase/schema.sql`
- 변경분: `supabase/migrations/` — 코드 배포 **전에** Supabase SQL Editor에서 실행한다.
  (예: `2026-11_v2.sql`은 v2 진단의 칸을 추가한다.)

## 사전 진단 문항

- v1(2026-11 이전 응답): `lib/questions.ts`, 채점 `lib/scoring.ts`
- v2(현재): `lib/questionsV2.ts`, 채점 `lib/scoringV2.ts`, 결과지 `components/ReportV2.tsx`
- 응답의 `version` 칸으로 구분하며, v1 응답은 저장된 점수 그대로 결과지에 나온다.

## 개발

```bash
npm ci
cp .env.local.example .env.local   # Supabase 공개 URL·키 입력
npm run dev
npm test                           # vitest
```
