# Claude 연결 조립서: 축제 쿨BTI

이 문서는 Claude가 `축제쿨비티아이` 앱을 실제 웹 서비스로 완성하기 위한 작업 지시서다. 단순 설명 문서가 아니라, Vercel 배포와 Supabase DB 연결까지 완료하는 조립서로 사용한다.

## 0. 최우선 원칙

- 작업 디렉터리: `축제쿨비티아이`
- GitHub repo: `https://github.com/KUCaver/KUflower_2026`
- 작업 브랜치: `codex/festival-coolbti`
- Claude는 기존 로컬 앱 폴더 위에서 덧붙여 작업하지 않는다.
- Claude는 완전히 새로운 작업 공간을 파서 이 브랜치를 새로 clone한 뒤 작업한다.
- Vercel도 기존 프로젝트에 연결하지 말고, 축제 쿨BTI 전용 새 프로젝트를 만든다.
- Supabase도 기존 프로젝트를 재사용하지 말고, 축제 쿨BTI 전용 새 프로젝트를 만든다.
- 기존 `kuapps_relay` 수정 금지
- 기존 `coolbti` 수정 금지
- 비밀키, DB password, Supabase `service_role` key 커밋 금지
- 프론트엔드에는 Supabase anon key만 사용한다.
- 구매 인증, 코드 검증, 공개 갤러리 승인처럼 권한이 필요한 작업은 Supabase Edge Function에서 `service_role`로 처리한다.
- Render는 기본 선택지가 아니다. 현재 구조는 Vercel + Supabase로 완성한다.

## 1. 현재 앱 상태

- Vite + React + TypeScript
- 모바일 QR 유입 우선 UI
- 7문항, 4결과, 로딩/가챠, 결과 카드 구현
- 콘텐츠 고정 스펙은 `src/data/coolbti.ts`와 `AI_WORKFLOW_PROMPTS.md`를 기준으로 한다.
- 메인 타이틀은 `네 화분 찾아가라`, 부제는 `녹색지대 화분 관상소`다.
- 결과 유형 이름, 질문 문구, 답변 문구, 점수 매핑은 임의 변경 금지다.
- DB 없이도 퀴즈 전체 흐름 동작
- `vercel.json`에 SPA rewrite 설정 있음
- `npm run build` 성공 확인됨

## 1-1. 작업 공간 분리 규칙

Claude는 사용자의 기존 로컬 디렉터리에서 바로 작업하지 않는다. 특히 `kuapps_relay`, `coolbti`, 기존 `똥아리` 작업공간 안의 다른 앱을 열어 수정하면 안 된다.

권장 시작 방식:

```bash
mkdir festival-coolbti-workspace
cd festival-coolbti-workspace
git clone --branch codex/festival-coolbti https://github.com/KUCaver/KUflower_2026.git .
npm install
npm run build
```

금지:

- 기존 `kuapps_relay` 안에 `/coolbti`를 추가하거나 수정
- 기존 `coolbti` Streamlit 앱 수정
- 다른 로컬 앱의 설정, env, package 파일 재사용
- 기존 Vercel 프로젝트에 root directory만 바꿔서 억지 연결
- 기존 Supabase 프로젝트의 테이블에 끼워 넣기

필수:

- 새 clone workspace
- 새 Vercel project
- 새 Supabase project
- 이 앱 전용 env
- 이 앱 전용 DB schema

실행:

```bash
npm install
npm run dev
```

빌드:

```bash
npm run build
```

## 2. Claude의 목표

Claude는 다음 상태까지 완성해야 한다.

1. Vercel에 실제 배포된 URL이 있다.
2. Supabase 프로젝트가 이 앱 전용으로 구성되어 있다.
3. `docs/supabase-schema.sql`이 Supabase SQL Editor에서 실행되어 있다.
4. Vercel 환경변수에 Supabase 공개 키가 등록되어 있다.
5. 앱 결과 페이지 진입 시 `coolbti_results`에 결과가 저장된다.
6. DB 저장 실패해도 퀴즈/결과 UI는 깨지지 않는다.
7. 구매 인증/사이버 화원은 프론트 직접 DB update가 아니라 Edge Function으로 확장 가능한 구조로 남긴다.
8. 마지막에 배포 URL, Supabase 테이블 생성 여부, 환경변수 등록 여부, 빌드 결과를 보고한다.

## 3. Vercel 조립 순서

GitHub 브랜치:

```text
KUCaver/KUflower_2026
codex/festival-coolbti
```

Vercel 프로젝트 설정:

- Project Name 예: `festival-coolbti`
- Framework Preset: `Vite`
- Root Directory: repo root
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

환경변수:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

주의:

- 기존 Vercel 프로젝트를 재사용하지 않는다.
- 새 Vercel dashboard/project를 만들어 이 브랜치에 연결한다.
- `SUPABASE_SERVICE_ROLE_KEY`는 Vercel 프론트 환경변수로 넣지 않는다.
- Vercel에서 preview와 production 둘 다 같은 이름의 환경변수를 등록한다.
- 배포 후 `/` 직접 접속, 새로고침, 모바일 화면을 확인한다.

## 4. Supabase 조립 순서

Supabase 프로젝트를 새로 만든다. 이름 예:

```text
festival-coolbti
```

주의:

- 기존 Supabase 프로젝트를 재사용하지 않는다.
- 기존 앱의 테이블, RLS, Edge Function에 이 기능을 섞지 않는다.
- 이 앱 전용 프로젝트에서 `docs/supabase-schema.sql`을 실행한다.

SQL 실행:

```text
docs/supabase-schema.sql
```

이 스키마는 다음을 만든다.

- `coolbti_results`
  - 결과 저장
  - 공유용 `public_slug`
  - `result_key`, `answers`, `scores`, `card_payload`
  - 구매 인증 여부 `is_purchased`
- `purchase_codes`
  - 구매 인증 코드 해시 저장
  - anon 접근 금지
- `coolbti_public_stats`
  - 공개 갤러리 통계용 view
  - `security_invoker = true`
- RLS
  - anon insert 허용
  - anon select는 `is_purchased = true`인 공개 row만 허용
  - anon update/delete 금지

SQL 실행 후 Supabase Table Editor에서 확인할 것:

- `coolbti_results` exists
- `purchase_codes` exists
- RLS enabled on both tables
- anon으로 `purchase_codes` select 불가
- anon으로 미구매 `coolbti_results` select 불가
- anon으로 `coolbti_results` insert 가능

## 5. 프론트 DB 연결 구현

의존성:

```bash
npm install @supabase/supabase-js
```

파일 생성:

```text
src/lib/supabase.ts
```

기본 구현:

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
```

결과 저장 위치:

- `src/App.tsx`
- `Result` 컴포넌트에서 `calculateResult(answers)` 이후
- `useEffect`로 최초 1회만 insert
- StrictMode 개발 환경에서 중복 insert가 생기지 않게 guard 필요

저장 payload:

```ts
{
  result_key: result.key,
  answers,
  scores: result.scores,
  card_payload: {
    resultName: result.profile.name,
    plant: result.profile.plant,
    headline: result.profile.headline,
    summary: result.profile.summary,
    festivalFlaw: result.profile.festivalFlaw,
    prescription: result.profile.prescription,
    recommendation: result.profile.recommendation,
    studentId: result.profile.studentId,
    scorePercent: result.scorePercent
  }
}
```

저장 성공 시:

- 반환된 `id`, `public_slug`를 local state에 저장한다.
- 화면에는 저장 성공 여부를 과하게 노출하지 않아도 된다.
- 공유 URL 기능을 붙이면 `public_slug`를 사용한다.

저장 실패 시:

- 결과 UI는 계속 보여준다.
- 사용자에게 에러 화면을 띄우지 않는다.
- 개발 중에는 `console.warn` 정도만 허용한다.

## 6. 구매 인증 / 사이버 화원 확장 설계

이 단계는 기본 결과 저장 이후 붙인다. 미완성으로 둘 경우에도 잘못된 구조를 만들면 안 된다.

금지:

- 프론트에서 `purchase_codes` select 금지
- 프론트에서 `purchase_codes` update 금지
- 프론트에서 `coolbti_results.is_purchased` 직접 update 금지
- service role key를 Vercel client env에 저장 금지

권장:

1. 운영진이 구매 코드 원문을 만든다.
2. 서버/Edge Function이 `code_hash`를 만들어 `purchase_codes`에 넣는다.
3. 사용자가 부스에서 받은 코드를 입력한다.
4. 프론트는 Edge Function `verify-purchase`를 호출한다.
5. Edge Function은 `service_role`로 검증하고 update한다.

코드 해시 규칙:

```text
sha256(PURCHASE_CODE_PEPPER + ":" + normalizedCode)
```

`normalizedCode`:

- trim
- uppercase
- spaces removed

Edge Function 환경변수:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PURCHASE_CODE_PEPPER=
```

성공 시 update:

- `purchase_codes.is_used = true`
- `purchase_codes.used_at = now()`
- `purchase_codes.used_registration_id = coolbti_results.id`
- `coolbti_results.is_purchased = true`
- `coolbti_results.purchased_at = now()`

## 7. 공유 URL 정책

현재 RLS는 미구매 결과를 공개 select하지 않는다. 따라서 공유 URL 정책은 둘 중 하나로 정해야 한다.

권장 기본값:

- 미구매 결과 공유 URL은 만들지 않는다.
- 구매 인증된 결과만 사이버 화원/공개 페이지에 노출한다.

만약 미구매 결과도 개인 공유 URL로 보여줘야 한다면:

- anon select를 전체 공개로 풀지 않는다.
- Edge Function `get-result-by-slug`를 만들고 rate limit 또는 slug 검증을 둔다.
- 공개 페이지에서 필요한 최소 payload만 반환한다.

## 8. 완료 검증 체크리스트

Claude는 끝내기 전에 아래를 실제로 확인하고 보고한다.

```bash
npm run build
```

Vercel:

- 배포 URL 접속 성공
- 모바일 폭에서 랜딩/퀴즈/로딩/결과 확인
- 새로고침 후 앱이 깨지지 않음
- 환경변수 등록 완료

Supabase:

- `docs/supabase-schema.sql` 실행 완료
- `coolbti_results` insert 성공
- `purchase_codes` anon select 실패 확인
- 미구매 `coolbti_results` anon select 실패 확인
- 구매 인증 row만 공개 select 가능

프론트:

- 결과 저장 성공 시 `id`, `public_slug` 확보
- DB 장애/환경변수 누락 시에도 결과 화면 정상 동작
- 비밀값 커밋 없음

보고 형식:

```text
완료한 것:
- ...

배포 URL:
- ...

Supabase:
- 프로젝트명:
- 실행한 SQL:
- 생성된 테이블:
- RLS 확인:

환경변수:
- VITE_SUPABASE_URL 등록 여부:
- VITE_SUPABASE_ANON_KEY 등록 여부:

검증:
- npm run build:
- 배포 페이지 접속:
- 결과 insert:
- RLS 테스트:

남은 수동 작업:
- ...
```

## 9. Claude가 사용자에게 물어봐야 하는 경우

다음 값이 없으면 Claude는 추측하지 말고 사용자에게 받아야 한다.

- Vercel 계정/팀 선택
- Supabase 프로젝트 생성 권한
- 실제 production domain
- 구매 인증 코드를 실제로 운영할지 여부
- 사이버 화원 공개 범위

그 외 구현 판단은 이 문서 기준으로 진행한다.
