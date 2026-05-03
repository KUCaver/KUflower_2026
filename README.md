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
- `.env.example`: Supabase 연결이 필요해질 때 사용할 공개 환경 변수 예시
- `CLAUDE_CONNECT_README.md`: Claude에게 넘길 Vercel/Supabase 연결 지시서
- `readme.mk`: 사용자가 요청한 파일명에 맞춘 Claude 전달용 진입 문서
- `docs/supabase-schema.sql`: 선택 기능용 Supabase DB 스키마

## 배포 방향

MVP는 DB 없이 동작합니다. 결과 저장, 공유 URL, 사이버 화원 같은 기능이 필요해질 때만 Supabase를 붙입니다.

Vercel 권장 설정:

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: MVP 기준 없음

Supabase를 붙일 경우:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

`service_role` key, DB password는 절대 프론트엔드에 넣지 않습니다.

## DB 준비 상태

Supabase 연결을 붙일 수 있도록 `docs/supabase-schema.sql`을 준비했습니다.

- `coolbti_results`: 결과 저장, 공유 slug, 구매 인증 여부
- `purchase_codes`: 구매 인증 코드 해시 저장
- RLS: anon insert 허용, 공개 갤러리는 구매 인증 row만 select 허용
- 구매 인증은 프론트 직접 update가 아니라 Supabase Edge Function으로 처리해야 합니다.

Claude에게 연결 작업을 맡길 때는 `CLAUDE_CONNECT_README.md`를 전달하세요.
