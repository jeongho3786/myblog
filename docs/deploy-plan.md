# 배포 — 작업 계획 · 진행 상황

> 2026-10-04 정리. 개발 남은 항목은 [`design-concept.md` "다음 할 일"](./design-concept.md) 참고.
> 진행 방식: 단계마다 세부 항목으로 나눠 하나씩 진행 → 확인받고 다음 항목으로.

---

## 완료

- [x] Supabase **Allow new users to sign up** 끄기 (어드민 계정 생성 후)

---

## 1. 도메인 구매 여부 결정

- [x] 처음엔 Vercel 기본 도메인(`*.vercel.app`)으로 배포하고 도메인은 나중에 붙일지, 처음부터 구매한 도메인으로 갈지 결정. → 2026-10-04 **`*.vercel.app`으로 먼저 배포, 도메인은 나중에.**
- [x] Supabase 프로젝트는 개발·운영 **하나로 같이 쓴다** (개인 블로그라 분리하지 않음). 로컬에서 쓴 댓글·일기도 실제 사이트에 그대로 남는다.
- 도메인이 바뀌면 **3단계(Supabase Auth URL)를 다시 해야 한다.**

## 2. Vercel 배포

> 2026-10-04 배포 완료 — **https://jeongho-blog.vercel.app** (Vercel 프로젝트 `jeongho-blog`, Hobby 플랜, `main` push 시 자동 배포). 저장소는 같은 날 public으로 전환.

- [x] GitHub 저장소를 Vercel 프로젝트로 import. Optional Integrations의 Supabase 연동은 **추가하지 않음** (새 Supabase 프로젝트를 만들거나 쓰지 않는 환경 변수를 넣으므로, 기존 프로젝트 값을 직접 등록).
- [x] 환경 변수 등록 (코드에서 `process.env`로 읽는 값 기준) — `.env.local` 내용을 붙여넣어 5개 한 번에:
- [x] `SUPABASE_SERVICE_ROLE_KEY` · `IP_HASH_SALT`를 Sensitive(Secret)로 변경 (import 화면에선 한 묶음으로만 타입을 정할 수 있어 전부 일반으로 배포한 뒤 Settings에서 변경) — 방문자 노출과는 무관하고, 대시보드에서 값이 보이지 않게 하는 용도. `NEXT_PUBLIC_*`은 원래 공개값이라 그대로.

| 변수 | 용도 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 읽기용 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Action 쓰기용 (서버 전용, 노출 금지) |
| `IP_HASH_SALT` | 댓글 rate limit용 IP 해시 salt |
| `ADMIN_USER_ID` | 어드민 Supabase uuid — 비어 있으면 아무도 `/admin`에 못 들어감 |

- [x] **Function Region을 `iad1`(워싱턴) → `icn1`(서울)로 변경** (Settings → Functions, Hobby는 리전 1개만). 기본값 `iad1`에선 동적 페이지(`/diary`)가 요청마다 아시아의 Supabase와 태평양을 3~4번 왕복해 TTFB 0.58~0.77초(콜드 스타트 1.79초), 정적 글(`/hello-world`)은 캐시 HIT로 0.07~0.27초였다. 응답 헤더 `X-Vercel-Id: icn1::iad1::…`의 두 번째 값이 함수 리전. 리전 변경은 **다음 배포부터** 적용된다.
  - 그래도 느리면: `fetchDiaryPage`의 개수 조회 → 범위 조회(순차 2회)를 병렬로 바꿔 왕복 1회를 줄일 수 있다.
- [ ] (도메인 구매 시) Vercel에 도메인 연결.

## 3. Supabase Auth URL 설정

- [x] Site URL을 배포 도메인으로 변경 → `https://jeongho-blog.vercel.app`.
- [x] Redirect URLs에 두 주소 등록 → `https://jeongho-blog.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`.
  - 그전엔 Redirect URLs가 비어 있었는데도 로컬 로그인이 됐다 — Supabase는 **Site URL과 같은 호스트**의 주소도 허용하기 때문(당시 Site URL이 `localhost:3000`). Site URL을 바꾸면서 localhost를 명시적으로 등록해야 했다.
  - 도메인을 사서 붙이면 Site URL을 새 도메인으로 바꾸고 그 `/auth/callback`도 추가한다.
- [x] 배포 사이트에서 Google 로그인 → `/admin` 접근 확인.

## 4. 운영 데이터 정리

배포 전후 어느 시점이든 테스트 데이터를 **전부** 정리한다.

- [x] 테스트 카테고리 삭제 (`테스트`, `asd`, `자식dev`, `중복테스트`, `깊이테스트` 등 — 하위 폴더부터) — 2026-10-04 `/admin`에서 전부 삭제. 실제로 쓸 카테고리 구조는 글을 쓰면서 다시 구성.
- [x] 테스트 MDX 글 정리 (`src/content/posts/`) — 2026-10-04 데모 글 3개 삭제, 테스트용 `hello-world.mdx` 하나만 남김.
  - ⚠️ **글이 0개면 빌드 실패**: `import(\`@/content/posts/${slug}.mdx\`)`는 빌드 때 맞는 파일이 하나도 없으면 `Module not found`. 실제 글을 **먼저** 쓰고 나서 `hello-world.mdx`를 지운다.
- [x] 테스트 댓글 · `comment_rate_limits` 행 정리 — 2026-10-04 SQL로 전부 삭제.
- [x] 테스트 짧은 일기(`diary_entries`, `테스트 일기 1~7` 등) 정리 — 2026-10-04 SQL로 전부 삭제.

## 5. 배포 후 확인

- [x] 배포 직후 응답 확인 — `/`·`/hello-world`·`/diary`·`/admin`·`/icon.svg`·`/apple-icon.png` 200, `/diary?page=9` → `/diary` 307, 없는 경로 404.
- [x] Google 로그인 → `/admin` 접근 (어드민 계정으로 확인)
- [x] 댓글 작성 · rate limit 동작
- [ ] 사이드바 카테고리 트리 · 글 메타 줄 카테고리 경로 — 테스트 카테고리를 모두 지운 상태라, 실제 카테고리를 만들고 글을 쓸 때 확인
- [x] 짧은 일기 `/diary` — 비로그인 시 작성 폼·수정/삭제 버튼 없음, 어드민 작성·수정·삭제·페이지 이동. **로그인 후 1시간 이상 지나서** `/diary`만 오가도 로그인이 유지되는지 (proxy 토큰 갱신)
- [x] 홈 아스키 배너 — 모바일에서 가로 스크롤·줄바꿈 없이 보이는지, 배포 환경 폰트(D2Coding)로 정렬이 맞는지
