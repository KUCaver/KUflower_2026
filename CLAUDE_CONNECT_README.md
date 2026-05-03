# Claude 연결 지시서: 축제 쿨BTI

이 문서만 Claude에게 넘기면 된다. 목적은 이미 만들어진 `축제쿨비티아이` 앱에 Vercel/Supabase 연결을 붙이는 것이다.

## 절대 범위

- 작업 디렉터리: `축제쿨비티아이`
- GitHub: `https://github.com/KUCaver/KUflower_2026`
- 작업 브랜치: `codex/festival-coolbti`
- 기존 `kuapps_relay` 수정 금지
- 기존 `coolbti` 수정 금지
- 비밀키, DB password, Supabase `service_role` key 커밋 금지

## 현재 앱 상태

- Vite + React + TypeScript 앱
- 모바일 QR 유입 우선 UI
- DB 없이도 퀴즈 전체 흐름 동작
- `npm run build` 성공 확인됨
- 결과 구조: 7문항, 4결과, 로딩/가챠, 결과 카드
- Vercel SPA rewrite 설정 있음: `vercel.json`

## 로컬 실행

```bash
npm install
npm run dev
```

빌드:

```bash
npm run build
```

Vercel:

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

## Supabase 연결 판단

MVP만 배포하면 DB는 없어도 된다. 다음 기능이 필요할 때만 Supabase를 붙인다.

- 결과 저장
- 공유 URL
- 구매 인증 후 사이버 화원 등록
- 결과 통계

DB 연결을 붙일 경우 먼저 `docs/supabase-schema.sql`을 Supabase SQL Editor에서 실행한다.

## 환경변수

Vite 앱이므로 변수명은 반드시 `VITE_` prefix를 쓴다.

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Vercel Project Settings → Environment Variables에 같은 이름으로 등록한다.

프론트엔드에 넣으면 안 되는 값:

- `SUPABASE_SERVICE_ROLE_KEY`
- DB password
- purchase code 원문 리스트

## DB 스키마

준비된 파일:

```text
docs/supabase-schema.sql
```

포함 내용:

- `coolbti_results`
  - 결과 저장
  - 공유용 `public_slug`
  - 결과 key, answers, scores, card payload
  - 구매 인증 여부 `is_purchased`
- `purchase_codes`
  - 구매 인증 코드 해시 저장
  - anon 접근 금지
- RLS
  - anon insert 허용
  - anon select는 `is_purchased = true`인 공개 갤러리 row만 허용
  - anon update/delete 금지
- `coolbti_public_stats` view
  - 구매 인증된 공개 결과 통계

중요: 공유 URL에서 미구매 row를 보여주고 싶다면 프론트에서 Supabase select를 직접 열지 말고 Edge Function으로 slug 조회를 처리한다. anon select를 전체 공개로 열면 모든 결과 row가 노출된다.

## 프론트 연결 작업

1. 의존성 추가

```bash
npm install @supabase/supabase-js
```

2. `src/lib/supabase.ts` 생성

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
```

3. 결과 생성 시 insert

`src/App.tsx`의 `Result` 진입 시점에서 `calculateResult(answers)` 결과를 저장한다.

저장 payload 예시:

```ts
{
  result_key: result.key,
  answers,
  scores: result.scores,
  card_payload: {
    resultName: result.profile.name,
    plant: result.profile.plant,
    headline: result.profile.headline,
    summary: result.profile.summary
  }
}
```

4. 저장 실패 처리

DB가 없어도 앱은 계속 돌아가야 한다. insert 실패는 화면을 막지 말고 콘솔 경고 또는 조용한 실패로 처리한다.

## 구매 인증 / 사이버 화원

구매 인증은 프론트에서 직접 `purchase_codes`를 조회하거나 update하면 안 된다.

권장 구조:

1. 운영진이 Supabase dashboard나 서버 스크립트로 `purchase_codes.code_hash`를 미리 넣는다.
2. 사용자가 부스에서 받은 코드를 입력한다.
3. 프론트는 Supabase Edge Function `verify-purchase`를 호출한다.
4. Edge Function이 `service_role`로:
   - 코드 해시 조회
   - 미사용 여부 확인
   - `purchase_codes.is_used = true`
   - `coolbti_results.is_purchased = true`
   - `purchased_at = now()`
5. 프론트는 성공 시 공개 갤러리 등록 완료 UI를 보여준다.

Edge Function에만 들어갈 값:

```bash
SUPABASE_SERVICE_ROLE_KEY=
PURCHASE_CODE_PEPPER=
```

`PURCHASE_CODE_PEPPER`는 코드 해시 보강용 secret이다. 프론트에 절대 넣지 않는다.

## Render 사용 여부

현재 구조에서는 Render가 필요 없다. Vercel + Supabase로 충분하다. Render는 별도 백엔드나 장기 실행 서버가 필요해질 때만 고려한다.

## Claude가 끝나기 전에 확인할 것

- `npm run build` 성공
- Vercel 환경변수 이름이 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`인지 확인
- Supabase SQL Editor에서 `docs/supabase-schema.sql` 실행 완료
- RLS가 켜져 있는지 확인
- anon으로 `purchase_codes` 조회가 안 되는지 확인
- anon으로 미구매 `coolbti_results` row가 조회되지 않는지 확인
- DB 연결 실패 시에도 퀴즈/결과가 정상 동작하는지 확인
