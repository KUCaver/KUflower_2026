# Claude 연결 지시서

이 파일은 사용자가 말한 `readme.mk` 이름에 맞춘 Claude 전달용 진입 문서다. 상세 연결 지시서는 같은 디렉터리의 `CLAUDE_CONNECT_README.md`에 있다.

Claude에게 전달할 때는 이 디렉터리 전체와 함께 `CLAUDE_CONNECT_README.md`를 기준 문서로 읽게 하면 된다.

## 핵심 지시

- 작업 디렉터리: `축제쿨비티아이`
- GitHub repo: `https://github.com/KUCaver/KUflower_2026`
- 작업 브랜치: `codex/festival-coolbti`
- 기존 `kuapps_relay` 수정 금지
- 기존 `coolbti` 수정 금지
- 비밀키, DB password, Supabase `service_role` key 커밋 금지

## 현재 상태

- 앱은 Vite + React + TypeScript로 이미 구성됨.
- `npm run build` 성공 확인됨.
- MVP는 DB 없이 동작함.
- Vercel 배포 설정은 `vercel.json`에 있음.
- Supabase 연결 준비 스키마는 `docs/supabase-schema.sql`에 있음.

## Supabase 연결 순서

1. Supabase 프로젝트를 만든다.
2. Supabase SQL Editor에서 `docs/supabase-schema.sql`을 실행한다.
3. 앱에 `@supabase/supabase-js`를 설치한다.
4. Vercel 환경변수에 아래 값을 넣는다.

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

5. 프론트에서는 결과 저장 insert만 anon key로 처리한다.
6. 구매 인증은 Supabase Edge Function으로 처리한다.
7. `purchase_codes`는 프론트에서 직접 조회하거나 업데이트하지 않는다.

## DB 보안 기준

- `coolbti_results`: anon insert 허용, 구매 인증된 공개 row만 select 허용
- `purchase_codes`: anon 접근 금지
- 구매 인증: Edge Function + service_role 사용
- service_role key는 Vercel 클라이언트 환경변수에 넣지 않는다.

자세한 구현 지시는 `CLAUDE_CONNECT_README.md`를 따른다.
