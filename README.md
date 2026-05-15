# 축제 쿨BTI

`네 화분 찾아가라` 콘셉트의 축제용 독립 웹앱입니다. 기존 `kuapps_relay`, 기존 `coolbti`와 분리해서 `축제쿨비티아이` 디렉터리 안에서만 관리합니다.

## 실행

```bash
npm install
npm run dev
```

로컬 기본 주소는 `http://127.0.0.1:5173`입니다. Vercel 배포 시 `/coolbti` 같은 직접 경로 접근도 `vercel.json` rewrite로 앱에 연결됩니다.

## 구조

- `src/data/coolbti.ts`: 7문항, 4결과, 로딩 문구, 결과 계산 로직
- `src/App.tsx`: 랜딩, 퀴즈, 로딩, 결과 화면
- `src/styles.css`: 모바일 QR 유입 우선 UI 스타일
- `api/admin/results.js`: `/admin` DB 보정 화면이 호출하는 Vercel 서버리스 API
- `.env.example`: Supabase 연결이 필요해질 때 사용할 공개 환경 변수 예시
- `CLAUDE_CONNECT_README.md`: Claude에게 넘길 Vercel/Supabase 연결 지시서
- `readme.mk`: 사용자가 요청한 파일명에 맞춘 Claude 전달용 진입 문서
- `AI_WORKFLOW_PROMPTS.md`: AI 작업을 단계별로 쪼개기 위한 고정 스펙/QA 지침
- `docs/supabase-schema.sql`: 선택 기능용 Supabase DB 스키마

## 배포 방향

MVP는 DB 없이도 동작합니다. 실제 서비스 연결 단계에서는 Vercel + Supabase를 기준으로 붙입니다.

Vercel 권장 설정:

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: MVP 기준 없음

Supabase를 붙일 경우:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

`service_role` key, DB password는 절대 프론트엔드에 넣지 않습니다.

## 관리자 화면

배포 후 `/admin`으로 접속하면 `coolbti_results` row를 조회, 수정, 삭제할 수 있습니다.

Vercel 환경 변수에 아래 값을 넣어야 합니다.

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: 서버리스 API 전용 service role key
- `ADMIN_API_TOKEN`: `쿨쿨띠`

관리자 화면의 토큰 입력은 `쿨쿨띠`, 영문 자판 입력값 `znfznfEl`, `znfznfel`을 모두 허용합니다.

관리자 화면에서 가능한 작업:

- 결과 row 조회 및 검색
- 결과 유형 보정
- 닉네임/화분명 보정
- 구매 인증 여부 수정
- `answers`, `scores`, `card_payload` JSON 보정
- row 삭제

주의: `SUPABASE_SERVICE_ROLE_KEY`는 절대 `VITE_` prefix로 만들지 말고, 브라우저 코드나 `.env.local` 공개 파일에 넣지 마세요.

## DB 준비 상태

Supabase 연결을 붙일 수 있도록 `docs/supabase-schema.sql`을 준비했습니다.

- `coolbti_results`: 결과 저장, 공유 slug, 구매 인증 여부
- `purchase_codes`: 구매 인증 코드 해시 저장
- RLS: anon insert 허용, 공개 갤러리는 구매 인증 row만 select 허용
- 구매 인증은 프론트 직접 update가 아니라 Supabase Edge Function으로 처리해야 합니다.

Claude에게 연결 작업을 맡길 때는 `readme.mk`와 `CLAUDE_CONNECT_README.md`를 전달하세요.

## Claude 작업 방식

Claude는 기존 앱 위에서 덧붙여 수정하지 않도록 지시되어 있습니다.

- 새 로컬 작업 공간에서 `codex/festival-coolbti` 브랜치를 clone
- 새 Vercel project 생성
- 새 Supabase project 생성
- 기존 `kuapps_relay`, 기존 `coolbti` 수정 금지
