# Claude 연결 진입 문서

이 파일은 사용자가 요청한 `readme.mk` 이름에 맞춘 전달용 문서다. 실제 상세 조립서는 `CLAUDE_CONNECT_README.md`다.

Claude에게는 이 파일과 `CLAUDE_CONNECT_README.md`, `docs/supabase-schema.sql`을 함께 읽게 한다.

## 한 줄 목표

`축제쿨비티아이` 앱을 Vercel에 배포하고, Supabase DB를 새로 구성해서 결과 저장까지 실제로 동작하게 만든다.

## 절대 수정 금지

- `kuapps_relay`
- `coolbti`
- 이 디렉터리 밖의 다른 앱

## 작업 대상

- 디렉터리: `축제쿨비티아이`
- GitHub: `https://github.com/KUCaver/KUflower_2026`
- 브랜치: `codex/festival-coolbti`

## Claude가 해야 할 일

1. `npm install`
2. `npm run build`
3. Vercel 프로젝트 생성/연결
4. Supabase 프로젝트 생성
5. Supabase SQL Editor에서 `docs/supabase-schema.sql` 실행
6. Vercel 환경변수 등록
7. `@supabase/supabase-js` 설치
8. 결과 페이지에서 `coolbti_results` insert 구현
9. DB 실패 시에도 앱이 계속 동작하게 처리
10. 배포 URL, DB 연결 여부, RLS 확인 결과 보고

## 환경변수

프론트/Vercel에 넣을 값:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

절대 프론트에 넣지 말 것:

```bash
SUPABASE_SERVICE_ROLE_KEY=
DB_PASSWORD=
PURCHASE_CODE_PEPPER=
```

## DB 보안 기준

- `coolbti_results`: anon insert 가능
- `coolbti_results`: anon select는 구매 인증된 공개 row만 가능
- `purchase_codes`: anon 접근 불가
- 구매 인증은 Edge Function + service role로 처리

상세 구현은 반드시 `CLAUDE_CONNECT_README.md`를 따른다.
