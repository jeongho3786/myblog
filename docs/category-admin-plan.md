# 카테고리 체계 + 어드민 관리 페이지 — 작업 계획 · 진행 상황

> **2026-09-28 완료.** 1~5단계 모두 끝났고, 남은 건 아래 "운영 데이터 정리"와 "배포 전 체크리스트"뿐.
> 2026-09-23 시작. 사이드바 카테고리를 `post.tags[0]` 임시 방식에서 DB 기반 중첩 카테고리로 옮기고, 이를 관리하는 어드민 페이지를 만드는 작업.
> 진행 방식: 단계마다 세부 항목으로 나눠 하나씩 구현 → 확인받고 다음 항목으로.

---

## 확정된 결정 사항

**데이터 구조**
- 글(MDX) `metadata`에 **`category`(단일 값)**와 **`tags`(여러 개)**를 분리. `category`는 사이드바 트리용, `tags`는 추후 검색용.
- 카테고리는 **Supabase `categories` 테이블**에 저장. `parent_id`로 부모를 가리키는 방식으로 **중첩(폴더 안의 폴더)** 지원.
- MDX에는 **글이 바로 속한 폴더의 slug 하나만** 적는다 (예: `category: "react"`). 상위 경로(`dev / frontend / react`)는 DB의 `parent_id`를 따라 올라가며 계산 → 폴더 이름 변경·이동 시 MDX 수정 불필요.
- slug는 **전체에서 유일**, 소문자·숫자·하이픈만 허용.
- slug는 **생성 후 수정 불가** (MDX와 DB를 잇는 식별자라서, 바꾸면 연결된 글이 uncategorized로 빠짐). 이름은 자유롭게 수정 가능. slug를 바꿔야 할 때는 **새 카테고리 생성 → 기존 글의 MDX `category`를 하나씩 새 slug로 수정·배포 → 이전 카테고리 삭제** 순서로 옮긴다.
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
- 글이 없는 **빈 폴더도 사이드바에 그대로 표시** (DB에 있는 폴더는 모두 보여줌. 빈 폴더를 둘지 지울지는 어드민에서 직접 판단).
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

## 3~5단계 작업 내역

### ✅ 3단계 — 관리 페이지 (`/admin`)

| # | 항목 | 내용 |
|---|---|---|
| 3-1 ✅ | 데이터 조회 | 카테고리 전체 조회 → 트리 조립 함수 (4단계 사이드바도 공유). 글 수는 세지 않음 → `src/lib/categories.ts` (`getAllCategories`, `buildCategoryTree`) |
| 3-2 ✅ | 트리 표시 | 읽기 전용 트리 (이름 · slug · 깊이) → `src/components/admin/category-tree.tsx` |
| 3-3 ✅ | 추가 | 최상위 / 특정 폴더 아래에 생성. 이름 + slug를 각각 직접 입력 (자동 채움 없음), 3단계 깊이 검사 → `src/lib/actions/categories.ts` (`createCategory`), `src/components/admin/category-create-form.tsx` |
| 3-4 ✅ | 수정 | 이름 변경만 (slug는 수정 불가 — 확정된 결정 사항 참고) → `renameCategory`, `src/components/admin/category-row.tsx` |
| 3-5a ✅ | 이동 | 부모 변경 (순환 검사 + 하위 폴더 포함 깊이 검사). 소속 글은 폴더를 따라감 (MDX는 slug만 가리키므로 수정 불필요) → `moveCategory` |
| 3-5b ✅ | 순서 | 같은 폴더 안 순서 변경 (↑ ↓ 버튼, 형제 폴더 `sort_order`를 0부터 다시 매겨 upsert 한 번으로 저장) → `reorderCategory` |
| 3-6 ✅ | 삭제 | 하위 폴더 있으면 차단. 삭제 확인 때만 연결된 글을 찾아 "글 N개가 uncategorized로 바뀝니다" 경고 후 삭제 (`PostMeta.category` 필요 → 4단계의 `PostMeta` 작업을 3-6 전에 먼저 진행) → `deleteCategory`, `findPostsInCategory` |

- 모든 쓰기 서버 액션은 **맨 앞에서 `verifyAdmin()`** 호출, 변경 후 `updateTag("categories")`로 카테고리 캐시 즉시 만료 (서버 액션 안에서 호출하면 현재 경로가 같은 응답 안에서 다시 렌더링되어 어드민 트리에 바로 반영됨. `revalidateTag(..., "max")`는 다시 렌더링하지 않아서 쓰지 않음).

### ✅ 4단계 — 블로그 연동

- 4-1 ✅ (3-6 선행 작업으로 앞당겨 완료) `src/lib/posts.ts` `PostMeta`에 `category: string | null` 추가, MDX 3개에 `category` 기입 (`code-highlight-demo` → `dev`, `typography-demo` → `design`, `hello-world` → `note`).
- 4-2 ✅ `sidebar.tsx` / `sidebar-tree.tsx`: `tags[0]` 대신 DB 카테고리 트리 + 글 목록을 합쳐 **다단 트리 재귀 렌더링** (모바일 햄버거 메뉴 포함). uncategorized 처리, 폴더 먼저 정렬, 활성 글 상위 폴더 펼침. (추가) 카테고리 조회 실패 시 사이드바가 레이아웃 전체를 깨뜨리지 않도록 모든 글을 uncategorized로 표시.
- 4-3 ✅ `src/app/[slug]/page.tsx` 메타 줄: `#첫번째태그` → 카테고리 경로 (`getCategoryPath`). uncategorized면 카테고리 부분 생략. 카테고리 조회 실패 시에도 페이지가 깨지지 않도록 `getAllCategoriesOrEmpty` 사용.

### ✅ 5단계 — 문서 업데이트

- 5-1 ✅ `architecture.md`: §4 `getAllPosts` 필드 목록에 `category` 추가, §10에 "카테고리를 DB로 관리" 채택 기록, **§11 카테고리 데이터 흐름** 신설 (읽기 · 쓰기 흐름, `updateTag` 동작).
- 5-2 ✅ `design-concept.md`: "다음 할 일"의 카테고리 항목을 완료로 옮기고 34번 로그 추가.
- 5-3 ✅ 이 문서 마무리.

---

## 결과물 한눈에 보기

| 파일 | 역할 |
|---|---|
| `src/lib/categories.ts` | 타입, 조회(`getAllCategories` / `getAllCategoriesOrEmpty`), 트리 조립, 경로 계산, 선택지 · 하위 폴더 헬퍼 |
| `src/lib/actions/categories.ts` | 어드민 서버 액션: `createCategory` / `renameCategory` / `moveCategory` / `reorderCategory` / `findPostsInCategory` / `deleteCategory` |
| `src/app/admin/page.tsx` | 로그인 · 403 · 관리 화면 (트리 + 추가 폼) |
| `src/components/admin/category-tree.tsx` | 어드민 트리 (서버), 줄마다 이동 가능한 위치 계산 |
| `src/components/admin/category-row.tsx` | 한 줄 (클라이언트): 이름 변경 · 이동 · ↑↓ · 삭제 |
| `src/components/admin/category-create-form.tsx` | 추가 폼 |
| `src/components/layout/sidebar.tsx`, `sidebar-tree.tsx` | 블로그 사이드바 다단 트리 |
| `src/app/[slug]/page.tsx` | 메타 줄 카테고리 경로 |
| `src/lib/posts.ts`, `src/content/posts/*.mdx` | `PostMeta.category` |

전체 데이터 흐름은 [`architecture.md` §11](./architecture.md), 로그인 구조는 [`auth-architecture.md`](./auth-architecture.md) 참고.

---

## 운영 데이터 정리 (테스트 후 남은 것)

2026-09-28 기능 확인 중 운영 DB에 테스트 데이터가 남았다. 어드민 페이지에서 정리할 것.

- `note` 폴더가 삭제된 상태 → `hello-world` 글이 uncategorized로 보임. `note`(slug `note`)를 다시 만들거나, 글의 `category`를 다른 폴더로 바꿀 것.
- `dev` 폴더 이름이 "상위-바꾸기"로 바뀐 상태 (slug는 `dev` 그대로) → 이름을 되돌릴 것.
- 테스트 폴더(`테스트`, `asd`, `자식dev`, `중복테스트`, `깊이테스트` 등) 삭제 — 하위 폴더부터.

---

## 배포 전 체크리스트 (배포 시점에)

- 배포 환경 변수에 `ADMIN_USER_ID` 등록 (비어 있으면 아무도 관리 페이지에 못 들어감).
- Supabase Redirect URLs에 `https://<배포 도메인>/auth/callback` 추가, Site URL을 배포 도메인으로 변경.
- (권장) Supabase **Allow new users to sign up** 끄기 — 어드민 계정 생성 후.
