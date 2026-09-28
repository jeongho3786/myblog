# 카테고리 체계 + 어드민 관리 페이지 — 작업 계획 · 진행 상황

> 2026-09-23 기준. 사이드바 카테고리를 `post.tags[0]` 임시 방식에서 DB 기반 중첩 카테고리로 옮기고, 이를 관리하는 어드민 페이지를 만드는 작업.
> 진행 방식: 단계마다 세부 항목으로 나눠 하나씩 구현 → 확인받고 다음 항목으로.

---

## 확정된 결정 사항

**데이터 구조**
- 글(MDX) `metadata`에 **`category`(단일 값)**와 **`tags`(여러 개)**를 분리. `category`는 사이드바 트리용, `tags`는 추후 검색용.
- 카테고리는 **Supabase `categories` 테이블**에 저장. `parent_id`로 부모를 가리키는 방식으로 **중첩(폴더 안의 폴더)** 지원.
- MDX에는 **글이 바로 속한 폴더의 slug 하나만** 적는다 (예: `category: "react"`). 상위 경로(`dev / frontend / react`)는 DB의 `parent_id`를 따라 올라가며 계산 → 폴더 이름 변경·이동 시 MDX 수정 불필요.
- slug는 **전체에서 유일**, 소문자·숫자·하이픈만 허용.
- 중첩은 **최대 3단계**. 글은 어느 단계의 폴더에든 속할 수 있다.
- 순환 구조(폴더를 자기 하위 폴더 안으로 이동)와 깊이 제한은 **서버 액션에서 검사**. 자기 자신을 부모로 지정하는 것만 DB check 제약으로 막음.
- 하위 폴더가 있는 폴더는 삭제 불가 (`on delete restrict`).

**어드민 페이지**
- 경로 `/admin`. UI 어디에도 링크 없음, URL 직접 입력으로만 접근.
- **배포된 사이트에서도 사용**. Google OAuth(Supabase Auth)로 로그인 → `ADMIN_USER_ID`(Supabase 사용자 uuid)와 비교 → 아니면 **403**.
- 카테고리 쓰기는 `verifyAdmin()` 통과 후 **service role로만** (anon/authenticated에는 쓰기 권한 없음).

**사이드바 · 화면**
- 카테고리가 없거나(미기재), 삭제됐거나, DB에 없는 slug를 적은 글 → **uncategorized**: 폴더 밖 최상위에 파일 아이콘으로 표시 (DB에 없는 slug는 개발 서버 경고도 남김).
- 같은 단계에서는 **폴더 먼저, 파일 나중** (파일 탐색기 방식).
- 폴더 순서는 `sort_order`, 같은 폴더 안 글 순서는 날짜 최신순.
- 현재 보고 있는 글의 폴더와 그 상위 폴더들을 펼친 상태로 시작.
- 글 상세 메타 줄에 **카테고리 경로** 표시 (예: `날짜 · DEV / REACT · N MIN READ`).
- 글이 연결된 카테고리 삭제 시: **경고만 보여주고 삭제**, 소속 글은 uncategorized로.

---

## 진행 상황

### ✅ 1단계 — DB (완료, 적용·검증 끝)

| 항목 | 결과물 |
|---|---|
| 1-1 테이블 생성 | `supabase/migrations/0004_categories.sql` |
| 1-2 권한 · RLS (읽기 공개, 쓰기 service role만) | `supabase/migrations/0005_categories_permissions.sql` |
| (추가) 불필요한 API 권한 회수 | `supabase/migrations/0006_revoke_unused_api_privileges.sql` — anon/authenticated의 `REFERENCES`/`TRIGGER`/`TRUNCATE` 회수 + 이후 테이블 기본 권한 변경 |
| 1-3 초기 데이터 | 마이그레이션 파일 없이 SQL Editor에서 1회 실행 (운영 데이터라서): `dev`(0) / `design`(1) / `note`(2), 모두 최상위 |
| 1-4 검증 | anon 읽기 OK, anon 쓰기 전부 `42501`로 차단, 제약 조건(self-parent·slug 형식·이름 중복·slug 중복·restrict) 전부 동작 확인, 댓글 기능 영향 없음 |

### ✅ 2단계 — 인증 (완료, 로그인·403·어드민 화면 모두 확인)

| 항목 | 결과물 |
|---|---|
| 2-1 콘솔 설정 | Google Cloud Console(동의 화면 테스트 모드 + 테스트 사용자, OAuth 클라이언트), Supabase(Google provider, Redirect URLs에 `localhost:3000/auth/callback`) |
| 2-2 세션 인프라 | `@supabase/ssr` 추가, `@supabase/supabase-js` 2.117로 업그레이드, `src/lib/supabase/session-client.ts`, `src/proxy.ts`(`/admin`에서만 실행) |
| 2-3 로그인 흐름 | `src/lib/actions/auth.ts`, `src/app/auth/callback/route.ts`, `src/app/admin/page.tsx` |
| 2-4 어드민 판별 · 403 | `src/lib/dal.ts`(`getCurrentUser`/`verifyAdmin`), `src/app/forbidden.tsx`, `next.config.ts`(`authInterrupts`), `.env.local`에 `ADMIN_USER_ID` |

자세한 흐름은 [`auth-architecture.md`](./auth-architecture.md) 참고.

---

## 남은 작업

### ⬜ 3단계 — 관리 페이지 (`/admin`)

| # | 항목 | 내용 |
|---|---|---|
| 3-1 | 데이터 조회 | 카테고리 전체 조회 → 트리 조립 함수 (4단계 사이드바도 공유). 카테고리별 연결된 글 수 계산 |
| 3-2 | 트리 표시 | 읽기 전용 트리 (이름 · slug · 글 수 · 깊이) |
| 3-3 | 추가 | 최상위 / 특정 폴더 아래에 생성. 이름 + slug 입력, 3단계 깊이 검사 |
| 3-4 | 수정 | 이름 변경. **slug는 수정 불가로 두는 안 (결정 대기)** |
| 3-5 | 이동 · 순서 | 부모 변경(순환 검사 + 깊이 검사), 같은 폴더 안 순서 변경 |
| 3-6 | 삭제 | 하위 폴더 있으면 차단, 연결된 글 있으면 경고 후 삭제 |

- 모든 쓰기 서버 액션은 **맨 앞에서 `verifyAdmin()`** 호출, 변경 후 사이드바 캐시 갱신(`revalidateTag`).
- **결정 대기**: slug 수정 불가 방침 (바꿔야 하면 새 카테고리 생성 → 글 이동 → 이전 카테고리 삭제).

### ⬜ 4단계 — 블로그 연동

- `src/lib/posts.ts` `PostMeta`에 `category` 추가, MDX 3개에 `category` 기입 (`code-highlight-demo` → `dev`, `typography-demo` → `design`, `hello-world` → `note`).
- `sidebar.tsx` / `sidebar-tree.tsx`: `tags[0]` 대신 DB 카테고리 트리 + 글 목록을 합쳐 **다단 트리 재귀 렌더링** (모바일 햄버거 메뉴 포함). uncategorized 처리, 폴더 먼저 정렬, 활성 글 상위 폴더 펼침.
- `src/app/[slug]/page.tsx` 메타 줄: `#첫번째태그` → 카테고리 경로.

### ⬜ 5단계 — 문서 업데이트

- `architecture.md`: `getAllPosts` 필드 목록(§ 표)에 `category` 추가, 카테고리 데이터 흐름 반영.
- `design-concept.md`: "다음 할 일"의 카테고리 항목 완료 처리.
- 이 문서 마무리.

---

## 배포 전 체크리스트 (배포 시점에)

- 배포 환경 변수에 `ADMIN_USER_ID` 등록 (비어 있으면 아무도 관리 페이지에 못 들어감).
- Supabase Redirect URLs에 `https://<배포 도메인>/auth/callback` 추가, Site URL을 배포 도메인으로 변경.
- (권장) Supabase **Allow new users to sign up** 끄기 — 어드민 계정 생성 후.
