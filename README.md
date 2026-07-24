# Japanese Study + Boardgame Score

Netlify 및 OCI 전용 구성을 제거하고 Cloudflare Pages와 Supabase를 기준으로
정리한 모노레포입니다. 일본어 PWA와 보드게임 점수 앱은 서로 독립적으로
빌드하고 배포할 수 있습니다.

## 프로젝트 구조

```text
.
├─ japanese-study/
│  ├─ src/
│  │  ├─ auth/                 # Supabase Auth provider
│  │  ├─ lib/                  # Supabase REST/Auth client
│  │  ├─ services/             # 일본어 데이터 접근 계층
│  │  ├─ app.js                # 기존 일본어 PWA 기능
│  │  ├─ index.html
│  │  └─ style.css
│  ├─ public/                  # manifest, service worker, Pages 설정
│  ├─ scripts/                 # 독립 build/dev 스크립트
│  └─ package.json
├─ boardgame-score/
│  ├─ src/
│  │  ├─ auth/
│  │  ├─ lib/
│  │  ├─ services/
│  │  └─ app.js
│  ├─ public/
│  ├─ scripts/
│  └─ package.json
├─ shared/                     # 프레임워크 독립 공통 유틸리티
├─ supabase/
│  ├─ migrations/              # PostgreSQL schema + RLS
│  └─ functions/               # Gemini 호출 Edge Function
├─ .env.example
└─ package.json
```

두 앱 모두 프레임워크 없이 HTML, CSS, ES6 JavaScript로 동작합니다. 빌드
스크립트도 외부 npm 패키지가 필요하지 않습니다.

## 환경변수

`.env.example`의 아래 두 값만 Cloudflare Pages의 빌드 환경변수로
등록합니다.

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

`SUPABASE_SERVICE_ROLE_KEY`, DB 비밀번호, Gemini API 키는 브라우저 빌드에
절대 넣지 않습니다. anon/publishable key는 RLS와 함께 브라우저에서
사용하도록 설계된 공개 키이며, 사용자 데이터 접근은 로그인 JWT와 RLS로
제한됩니다.

## 로컬 실행

저장소 루트에서 다음 중 하나를 실행합니다.

```bash
npm run dev:japanese
npm run dev:boardgame
```

기본 주소:

```text
Japanese Study: http://localhost:4173
Boardgame Score: http://localhost:4174
```

개발 서버는 환경변수가 없는 상태에서도 열립니다. 이 경우 기존 일본어
PWA의 localStorage 및 오프라인 기능은 그대로 사용할 수 있지만 Supabase
동기화와 AI Edge Function은 비활성화됩니다.

## 빌드

전체 빌드:

```bash
npm run build
```

개별 빌드:

```bash
npm run build:japanese
npm run build:boardgame
```

결과 디렉터리:

```text
japanese-study/dist
boardgame-score/dist
```

각 빌드는 Cloudflare 환경변수를 읽어 `dist/config.js`를 생성합니다.

## Cloudflare Pages 배포

같은 Git 저장소를 사용하여 Pages 프로젝트를 두 개 만듭니다.

Japanese Study:

```text
Project name: japanese-study
Root directory: japanese-study
Build command: npm run build
Build output directory: dist
```

Boardgame Score:

```text
Project name: boardgame-score
Root directory: boardgame-score
Build command: npm run build
Build output directory: dist
```

각 프로젝트의 Settings > Variables and Secrets에
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 등록합니다. 저장소는
같아도 Root directory가 다르므로 두 서비스를 독립 배포할 수 있습니다.

## Supabase 설정

1. Supabase 프로젝트를 생성합니다.
2. SQL Editor에서 아래 migration을 실행합니다.

```text
supabase/migrations/202607240001_initial_schema.sql
```

3. Authentication에서 사용할 로그인 방식을 활성화합니다.
4. Project URL과 publishable/anon key를 Cloudflare Pages에 등록합니다.

Migration에는 다음이 포함됩니다.

```text
jp_words
jp_sentences
jp_history
bg_games
bg_users
bg_matches
bg_scores
```

모든 테이블은 Row Level Security가 활성화되며 로그인한 사용자는 자신의
행만 읽고 변경할 수 있습니다.

## Gemini AI 문장 생성

Gemini 키는 프런트엔드가 아니라 Supabase Edge Function secret으로
저장합니다.

```bash
supabase secrets set GEMINI_API_KEY=YOUR_KEY
supabase secrets set GEMINI_MODEL=gemini-2.5-flash
supabase functions deploy generate-japanese-sentences
```

일본어 앱의 기존 `with AI` 기능은
`generate-japanese-sentences` Edge Function을 호출합니다. 무료 할당량
소진, 키 오류, 모델 혼잡 오류는 기존 앱의 상태 메시지에 표시됩니다.

## 데이터 접근 원칙

화면 코드에서 `supabase.from()` 같은 직접 호출을 하지 않습니다.

```text
UI
  -> JapaneseService / BoardgameService
  -> SupabaseClient
  -> Supabase REST, Auth, Edge Functions
```

`localStorage`는 일본어 PWA의 오프라인 사용과 기존 데이터 보존을 위해
유지됩니다. Supabase는 로그인 사용자 간 기기 동기화를 위한 운영 저장소로
준비되어 있습니다. 향후 자동 동기화를 추가하더라도 UI 코드는 서비스
계층만 호출하면 됩니다.

## PWA 확인

일본어 앱 빌드에는 다음 파일이 포함됩니다.

```text
manifest.json
sw.js
_headers
_redirects
```

서비스 워커는 앱 셸, Supabase 연결 모듈, 기존 CSS/JavaScript를 캐시합니다.
`config.js`와 `sw.js`는 Cloudflare `_headers`에서 재검증되도록 설정해
배포 후 이전 설정이 오래 남지 않게 했습니다.

## 기존 데이터 이동

기존 단어와 문장은 삭제되지 않습니다. 브라우저의 localStorage 데이터는
그대로 유지되며 기존 JSON 내보내기/가져오기도 계속 사용할 수 있습니다.
Supabase 로그인을 연결한 뒤 서비스 계층을 이용해 원격 DB로 순차 동기화할
수 있는 구조입니다.
