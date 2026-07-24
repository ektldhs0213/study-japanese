# Japanese Study + Boardgame Score

Netlify 및 OCI 전용 구성을 제거하고 Cloudflare Pages와 Supabase를 기준으로
정리한 모노레포입니다. 일본어 PWA와 보드게임 점수 앱은 서로 독립적으로
빌드하고 배포할 수 있습니다.

## 프로젝트 구조

```text
.
├─ japanese-study/
│  ├─ src/
│  │  ├─ lib/                  # Supabase anon REST client
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
│  └─ functions/               # 기존 Supabase 함수 참고 코드
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
절대 넣지 않습니다. 일본어 단어장은 로그인 없는 공용 데이터이므로
anon/publishable key와 공개 단어장 전용 RLS 정책을 사용합니다.

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

개발 서버는 환경변수가 없는 상태에서도 열립니다. 다만 단어 데이터는
Supabase만 사용하므로 환경변수가 없으면 단어 조회와 저장 및 AI Pages
Function이 비활성화됩니다.

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

3. 기존 Auth 기반 DB라면 `202607240003_public_japanese_schema.sql`을 실행합니다.
4. 기존 단어의 입력 날짜와 내용을 갱신하려면 `202607240004_public_jp_word_updates.sql`을 실행합니다.
5. `202607250002_jp_word_canonical_identity.sql`을 실행해 중복을 `정규화된 일본어 + pos` 기준으로 통합합니다. 같은 단어의 뜻과 태그는 합쳐지고 최신 입력 날짜가 유지됩니다.
6. Project URL과 publishable/anon key를 Cloudflare Pages에 등록합니다.

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

모든 테이블은 Row Level Security가 활성화됩니다. 일본어 서비스의
`jp_words`, `jp_sentences`, `jp_history`는 로그인 없는 운영을 위해 anon
조회와 추가를 허용합니다. 보드게임 테이블은 기존 authenticated 정책을
유지합니다.

일반 사용자의 UPDATE/DELETE 권한은 없습니다. 일본어 데이터 삭제가
필요하면 관리자가 Supabase Table Editor 또는 SQL Editor에서 직접
처리합니다. 앱의 캐시 초기화 버튼은 현재 기기의 localStorage만 비우며
Supabase 데이터는 삭제하지 않습니다.

일본어 테이블의 운영 컬럼:

```text
jp_words: id, japanese, reading, meaning, pos, semantic_tags, created_at
jp_sentences: id, japanese, reading, meaning, created_at
jp_history: id, japanese, action, created_at
```

## Gemini AI 문장 생성

Gemini 키는 프런트엔드가 아니라 Cloudflare Pages Function secret으로
저장합니다. Cloudflare Pages의 `Settings > Variables and Secrets`에서
Production과 Preview 환경에 각각 등록합니다.

```text
GEMINI_API_KEY=YOUR_KEY
```

모델을 바꿀 때만 `GEMINI_MODEL`을 선택적으로 등록합니다. 기본값은
`gemini-2.5-flash`입니다.

일본어 앱의 기존 `with AI` 기능은 같은 도메인의
`/api/generate-japanese-sentences` Cloudflare Pages Function을 호출합니다. 무료 할당량
소진, 키 오류, 모델 혼잡 오류는 기존 앱의 상태 메시지에 표시됩니다.

## 데이터 접근 원칙

화면 코드에서 `supabase.from()` 같은 직접 호출을 하지 않습니다.

```text
UI
  -> JapaneseService / BoardgameService
  -> SupabaseClient
  -> Supabase REST / Cloudflare Pages Functions
```

단어 데이터는 Supabase `jp_words`만 단일 원본으로 사용합니다.
localStorage에 남아 있던 단어는 앱 시작 시 제거하며, Supabase 조회 실패
시 오래된 로컬 단어를 대신 표시하거나 자동 재업로드하지 않습니다.
문장 표시 설정과 학습 표시는 localStorage에 계속 저장됩니다.

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

공용 단어는 Supabase에서만 관리합니다. 기존 localStorage 단어는 화면이나
연결 테스트 결과에 포함되지 않습니다.
처음 온라인으로 실행하면 기존 localStorage 단어도 Supabase 공용 단어장에
순차 동기화됩니다.
