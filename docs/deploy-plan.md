# 배포 — 작업 계획 · 진행 상황

> 2026-10-04 정리. 개발 남은 항목은 [`design-concept.md` "다음 할 일"](./design-concept.md) 참고.
> 진행 방식: 단계마다 세부 항목으로 나눠 하나씩 진행 → 확인받고 다음 항목으로.

---

## 완료

- [x] Supabase **Allow new users to sign up** 끄기 (어드민 계정 생성 후)

---

## 1. 도메인 구매 여부 결정

- [ ] 처음엔 Vercel 기본 도메인(`*.vercel.app`)으로 배포하고 도메인은 나중에 붙일지, 처음부터 구매한 도메인으로 갈지 결정.
- 도메인이 바뀌면 **3단계(Supabase Auth URL)를 다시 해야 한다.**

## 2. Vercel 배포

- [ ] GitHub 저장소를 Vercel 프로젝트로 import.
- [ ] 환경 변수 등록 (코드에서 `process.env`로 읽는 값 기준):

| 변수 | 용도 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 읽기용 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Action 쓰기용 (서버 전용, 노출 금지) |
| `IP_HASH_SALT` | 댓글 rate limit용 IP 해시 salt |
| `ADMIN_USER_ID` | 어드민 Supabase uuid — 비어 있으면 아무도 `/admin`에 못 들어감 |

- [ ] (도메인 구매 시) Vercel에 도메인 연결.

## 3. Supabase Auth URL 설정

- [ ] Site URL을 배포 도메인으로 변경.
- [ ] Redirect URLs에 `https://<배포 도메인>/auth/callback` 추가.

## 4. 운영 데이터 정리

배포 전후 어느 시점이든 테스트 데이터를 **전부** 정리한다.

- [ ] 테스트 카테고리 삭제 (`테스트`, `asd`, `자식dev`, `중복테스트`, `깊이테스트` 등 — 하위 폴더부터). 실제로 쓸 카테고리 구조로 다시 구성.
- [x] 테스트 MDX 글 정리 (`src/content/posts/`) — 2026-10-04 데모 글 3개 삭제, 테스트용 `hello-world.mdx`(제목 `Hello_world`) 하나만 남김.
  - ⚠️ **글이 0개면 빌드 실패**: `import(\`@/content/posts/${slug}.mdx\`)`는 빌드 때 맞는 파일이 하나도 없으면 `Module not found`. 실제 글을 **먼저** 쓰고 나서 `hello-world.mdx`를 지운다.
- [ ] 테스트 댓글 · `comment_rate_limits` 행 정리.
- [ ] 테스트 짧은 일기(`diary_entries`, `테스트 일기 1~7` 등) 정리.

## 5. 배포 후 확인

- [ ] Google 로그인 → `/admin` 접근 (어드민 계정만 들어가지는지)
- [ ] 댓글 작성 · rate limit 동작
- [ ] 사이드바 카테고리 트리 · 글 메타 줄 카테고리 경로
- [ ] 짧은 일기 `/diary` — 비로그인 시 작성 폼·수정/삭제 버튼 없음, 어드민 작성·수정·삭제·페이지 이동. **로그인 후 1시간 이상 지나서** `/diary`만 오가도 로그인이 유지되는지 (proxy 토큰 갱신)
- [ ] 홈 아스키 배너 — 모바일에서 가로 스크롤·줄바꿈 없이 보이는지, 배포 환경 폰트(D2Coding)로 정렬이 맞는지
