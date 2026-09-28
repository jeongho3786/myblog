# 블로그 디자인 컨셉 — Draftline

> 2026-08-29 ~ 2026-08-30 논의 정리. 디자인 목업(Claude Design 캔버스) 기준.
> 캔버스: https://claude.ai/code/artifact/8af21ed2-40a3-4e38-ba99-82644c3ef4ca

## 컨셉 한 줄 요약

**단색 배경 + 실선 테두리로 도면/공학 노트 느낌.**
점선은 사이드바 트리 가이드라인(카테고리 폴더 하위 목록 들여쓰기 선)에만 예외로 남긴다 — 그 외 테두리·구분선은 전부 실선. (2026-09-03: 원래는 `Solid = 활성`, `Dashed = 구조·경계`로 화면 전체를 점선 위주로 읽는 규칙이었으나, 실선으로 전환하기로 확정.)

## 여기까지 온 과정

1. 처음엔 **모눈종이 배경**(20px 소격자 + 100px 대격자)에 자로 그은 듯한 정렬을 시도.
2. 실제로 보니 배경 격자선과 UI 요소의 선이 서로 어긋나면서 오히려 산만해짐. → **배경은 단색으로 되돌리고**, 대신 UI 자체의 테두리를 점선으로 그어 "도면" 느낌을 내는 방향으로 전환.
3. 점선 두께 비교(Light 1px 위주 vs Heavy 2px + 구조선까지 점선) → **Light Dash**로 1차 확정. 큰 구조선(헤더 밑줄, 제목 밑줄, 섹션 경계)만 실선 유지, 나머지는 1px 점선.
4. 폰트 5종 비교 → **D2Coding(네이버)**으로 확정.
5. (2026-09-02) Blog Home 레이아웃 확정: 상단 헤더 제거, **사이드바 + 콘텐츠** 2단 구성으로 전환.
6. (2026-09-02) 사이드바를 **파일탐색기 트리** 형태로 변경 — 카테고리를 폴더로, 클릭하면 하위에 포스트 목록(파일)이 펼쳐지는 실제 동작하는 인터랙션.
7. (2026-09-03) 점선 규칙 재검토 → **사이트 전체를 실선으로 전환**, 사이드바 트리 가이드라인만 점선으로 예외 유지.
8. (2026-09-03) 반응형 도입: PC·태블릿은 사이드바+본문 유지, 모바일만 스티키 헤더+햄버거 트리 메뉴로 전환.
9. (2026-09-03) Post Detail도 Sidebar 컴포넌트로 통일 → 예전 Header 컴포넌트 완전히 폐기, "기본 레이아웃 = 사이드바 + 본문"으로 확정.
10. (2026-09-03) 레포에 D2Coding 폰트 파일(Regular/Bold, woff2) 반입 + `next/font/local`로 연결, `font-sans`/`font-mono` 둘 다 D2Coding으로 통일.
11. (2026-09-03) 목업 캔버스 전체 아트보드에도 실제 D2Coding 폰트 적용 (JetBrains Mono 플레이스홀더 제거). Font Comparison 보드는 비교용 폰트(JetBrains Mono 등)는 그대로 두고 D2Coding 스와치만 최종 확정 표시로 갱신.
12. (2026-09-03) 아트보드 7개 전수 스캔으로 실측값(색상/폰트크기/letter-spacing/line-height/보더/spacing) 뽑아서 `src/app/globals.css`에 디자인 토큰으로 확정 (아래 "CSS 토큰" 섹션). UI Kit 아트보드 색상 스와치도 실제 토큰 15개 전체로 갱신 + 잘못돼 있던 BORDER 값(`#D9D7D1`→`#C4C1B9`) 수정.
13. (2026-09-04) `src/components/ui/button.tsx` 작업 중 CSS 변수 구조 단순화. 기존엔 `:root`에 hex 원본을 두고 `@theme inline`이 그걸 다시 alias하는 2단 참조라, 에디터에서 `bg-primary`를 호버해도 `var(--primary)`만 보이고 실제 색을 못 따라감. `:root` 레이어를 없애고 `@theme`(non-inline)에 hex를 직접 정의하도록 변경 — 다크모드 전환 계획이 없어 별도 `:root` 레이어의 이점이 없다고 판단. `--font-sans`/`--font-mono`는 `next/font/local`이 주입하는 외부 변수(`--font-d2coding`)를 그대로 참조해야 해서 예외적으로 별도 `@theme inline` 블록에 남겨둠.
14. (2026-09-04) Button 컴포넌트 최초 구현 (`src/components/ui/button.tsx`). variant는 `primary`(채움) / `secondary`(실선 테두리) / `disabled`(변형 지정 시 `disabled` 속성 자동 부여) 세 가지로 시작.
15. (2026-09-04) Ghost variant 재정의: 원래 목업의 "테두리만 옅게" 방식 대신 **테두리 없이 텍스트만 있는 형태**로 변경, 이름도 `ghost` → **`text`**로 개명. 텍스트 색은 기본 상태부터 `text-foreground`로 고정(기존엔 `text-muted` → hover 시 `text-foreground`로 바뀌는 방식이었으나, 상태 전환 없이 처음부터 hover와 같은 색으로 통일).
16. (2026-09-04) Secondary variant 수정: `hover:bg-surface`(배경색 `#FFFFFF`)가 페이지 배경(`#FAFAF8`)과 거의 구분이 안 돼서 `hover:bg-border/15`(테두리색 15% 불투명도)로 교체. 모든 variant(primary/secondary/text)에 `active:` 상태 추가 — 클릭 시 hover보다 한 단계 진한 톤으로 눌림 피드백 부여.
17. (2026-09-04) 클래스명을 문자열 변수(`Record<Variant, string>`)로 관리하면 에디터(Zed)가 Tailwind 자동완성/호버를 못 띄워서 `class-variance-authority`(cva) 도입. `variantClasses` 객체를 `cva(base, { variants, defaultVariants })` 호출로 전환하고, 별도 `type ButtonVariant` 선언 없이 `VariantProps<typeof buttonVariants>`로 타입을 자동 추론하도록 구성 (cva 설정 객체가 스타일과 타입의 단일 소스). `.zed/settings.json`에 `tailwindcss-language-server`의 `classFunctions: ["cva", "cx"]` 설정 추가해서 `cva(...)` 호출 안 클래스 문자열도 IntelliSense가 인식하게 함.
18. (2026-09-04) 코드에서 확정된 Button 스타일을 목업 캔버스의 UI Kit(Components) 아트보드에도 반영: Secondary 테두리를 `#1C1C1A`→`#C4C1B9`(`--border`)로 정정, Ghost를 Text로 개명하고 밑줄 테두리를 완전히 제거. Primary/Disabled는 이미 실제 토큰과 일치해서 변경 없음.
19. (2026-09-04) Tag 컴포넌트 구현 (`src/components/ui/tag.tsx`). UI Kit "04 TAGS" 아트보드 스펙 그대로 이식: `default`(테두리 `border-muted`, 텍스트 `muted`) / `outline`(테두리·텍스트 `primary`) / `filled`(배경 `primary`, 텍스트 `surface`). 공통 `text-2xs`/`tracking-wide`/`px-2.5 py-1.25`(=10px/5px, Tailwind v4 유동 spacing 스케일로 표기 — 값은 임의값 `px-[10px] py-[5px]`와 동일).
20. (2026-09-04) Input 컴포넌트 구현 (`src/components/ui/input.tsx`). UI Kit "05 INPUT" 스펙: 기본 상태 테두리 `border`(`#C4C1B9`) + placeholder `muted` 텍스트, Focus 시 테두리 `primary` + 실제 입력값은 `foreground` 텍스트. `py-3 px-4`(12px/16px), `text-md`(13px). react-hook-form의 `register()`가 반환하는 `ref`를 연결해야 해서 이후 `forwardRef`로 전환.
21. (2026-09-04) `react-hook-form` 도입 + 테스트용 연동 폼 작성. `Input`은 `forwardRef`로 실제 `<input>` DOM을 그대로 노출하는 얇은 래퍼라 `register`(uncontrolled) 방식이 적합 — `Controller`/`control`은 `ref`를 못 받거나 `value`/`onChange` prop 기반인 컴포넌트(서드파티 UI킷, 커스텀 드롭다운 등)를 위한 것이라 지금 구조엔 불필요하다고 판단.
22. (2026-09-04) `ui` 폴더 원칙 확정: **진짜 베이스 공통 컴포넌트만** 둔다. react-hook-form 연동 테스트처럼 데모/검증 목적의 파일은 `src/components/test/`로 분리 (`input-form-test.tsx`).
23. (2026-09-04) Divider 컴포넌트 구현 (`src/components/ui/divider.tsx`). UI Kit "06 DIVIDERS" 스펙: `rule`(2px solid `foreground`, 섹션 최상위 구조 경계) / `divider`(1px solid `border`, 기본값 — 목록·카드 경계) / `dotted`(1px dotted `border`, 표·인라인 보조 구분). `<div>`가 아니라 시맨틱이 맞고 접근성 트리에서 `role="separator"`로 인식되는 `<hr>`을 베이스로 사용.
24. (2026-09-04) 코드 하이라이팅 스택 결정: **Shiki** 채택 (VS Code와 동일한 TextMate 문법 엔진, 결과물이 이미 하이라이트된 정적 HTML/CSS라 클라이언트 JS 번들 불필요, 나중에 파일 기반 MDX가 아니라 DB에서 마크다운을 가져와 렌더링하는 구조로 바뀌어도 `codeToHtml()`을 요청 시점에 그대로 재사용 가능). MDX 파이프라인 연결은 `rehype-pretty-code`(Shiki 래퍼, `title=`/줄 하이라이트 등 코드펜스 meta 파싱 지원)로 결정 — 대안으로 Shiki 팀 공식 `@shikijs/rehype`+`@shikijs/transformers` 조합도 검토했으나, 전환 시 `title=` 메타 기반 파일명 탭 기능을 직접 구현해야 하는 트레이드오프가 있어 **`rehype-pretty-code` 유지**로 결론.
25. (2026-09-04) `next.config.ts`에 `rehype-pretty-code` 연결 (`theme: "github-dark"`, `keepBackground: false`로 배경은 우리 토큰이 직접 제어). 트러블슈팅: Next 16 `next dev`의 기본 번들러 Turbopack은 설정을 Rust 쪽으로 넘길 때 JSON 직렬화가 필요해서, 플러그인을 함수로 직접 import해 배열에 넣으면 `loader ... does not have serializable options` 에러 발생 → `["rehype-pretty-code", options]`처럼 **문자열(모듈 경로)**로 넘기도록 수정 (`@next/mdx` 로더가 내부에서 `require.resolve` + `import()`로 알아서 로드).
26. (2026-09-04) `src/mdx-components.tsx`에 `figure`/`figcaption`/`pre` 오버라이드 추가. `rehype-pretty-code`가 코드펜스마다 `<figure><figcaption>파일명</figcaption><pre><code>...</code></pre></figure>` 구조를 뱉는데, 이 3개 태그에 `code-bg`/`code-border`/`code-tab`/`code-text` 토큰을 입혀서 사이트 전체 `.mdx` 코드블록에 자동 적용되게 함. (`h1`/`p`/`a`/`ul` 등 나머지 마크다운 요소는 아직 미스타일링.)
27. (2026-09-04) 샘플 포스트 `src/content/posts/code-highlight-demo.mdx` 추가 — tsx/python 코드펜스 + `title=` 메타로 파일명 탭 동작 확인용.
28. (2026-09-12) `src/mdx-components.tsx`에 본문 마크다운 요소 오버라이드 추가: `h1`(`text-3xl`/`md:text-4xl`, `tracking-tight`) / `h2`(`text-2xl`) / `h3`(`text-xl`) / `p`(`text-base`/`md:text-lg`, `text-foreground-secondary`) / `ul`·`ol`·`li` / `strong` / `a`(`text-primary` + 밑줄) / `blockquote`(처음엔 스펙을 못 찾아 `border-border` + `text-muted`로 임시 결정했다가, 아래 29번에서 캔버스 원본을 다시 찾아 `border-primary` + `text-foreground`로 정정) / `hr`(기존 `Divider` 컴포넌트의 `divider` variant 재사용). 확인용 샘플 포스트 `src/content/posts/typography-demo.mdx` 추가 (`code-highlight-demo.mdx`와 동일한 용도).
29. (2026-09-12) 전반적인 페이지 레이아웃(사이드바 + 본문)을 실제 코드로 구현. 목업 캔버스(`Sidebar.dc.html`/`Main.dc.html`/`PostDetail.dc.html`)를 파일 단위로 직접 읽어 실측값을 뽑음:
    - `src/components/layout/sidebar.tsx`(서버 컴포넌트, `getAllPosts()`로 태그 첫 번째 값 기준 임시 그룹핑) + `src/components/layout/sidebar-tree.tsx`(`"use client"`, 폴더 펼침/접힘 상태 관리, `usePathname()`으로 현재 보고 있는 글의 카테고리를 기본으로 펼침). `aside`는 `w-65`(260px) 고정폭, 자식 트리는 `border-dotted`(사이트 전체에서 유일한 점선 요소, 카테고리 분류 규칙과 무관하게 이미 확정돼 있던 예외).
    - `src/app/blog/layout.tsx` 추가 — `/blog` 세그먼트 전체에 사이드바+본문 2단 flex 레이아웃 적용.
    - `src/app/blog/page.tsx`를 `Main.dc.html` 스펙대로 재작성: `// INDEX` 라벨 + `ALL POSTS` h1 + 엔트리 수, 목록은 `grid-cols-[60px_1fr_140px]`(번호/제목+태그/날짜), 태그는 기존 `Tag` 컴포넌트 재사용(목업 원본 padding과는 살짝 다르지만 이미 확정된 공용 컴포넌트를 우선).
    - `src/app/blog/[slug]/page.tsx`를 `PostDetail.dc.html` 스펙대로 재작성: 메타 라인(날짜·태그·읽는 시간) + h1 + `Divider(variant="rule")` + 본문(`mdx-components.tsx` 적용) + 이전/다음 글 내비게이션. 이 과정에서 `PostDetail.dc.html` 원본을 다시 확인해 blockquote 스펙이 `border-primary`(액센트) + `text-foreground`였다는 걸 발견 → 28번에서 임시로 정한 회색 버전을 정정.
    - `src/lib/posts.ts`: `PostMeta`에 `tags: string[]` 추가, `getAdjacentPosts(slug)`(이전/다음 글 조회) / `getReadingTimeMinutes(slug)`(파일 글자 수 기반 대략치, 별도 라이브러리 없이 500자당 1분으로 추정) 추가. 기존 샘플 포스트 3개에 `tags` 메타 추가, 본문 상단에 프런트매터 제목과 중복되던 `# 제목` 줄 제거(`typography-demo.mdx`는 테스트 목적상 유지).
    - 모바일(390px, 스티키 헤더 + 햄버거 트리 메뉴) 레이아웃은 이번 작업에 포함하지 않음 — 데스크톱 2단 구성만 우선 구현.
30. (2026-09-12) 라우팅 정리: 글 목록을 `/blog`가 아니라 루트 `/`에서 보여주도록 변경. `Sidebar`를 `src/app/blog/layout.tsx`(삭제됨)가 아니라 루트 `src/app/layout.tsx`로 옮겨서 모든 페이지(404 포함)에 공통 적용되게 하고, `src/app/page.tsx`(기존 create-next-app 스캐폴드 + 컴포넌트 스와치 테스트 코드)를 글 목록 페이지 내용으로 교체. `src/app/blog/page.tsx`는 중복이라 삭제하고 `/blog/[slug]` 상세 경로만 유지. 루트에 있던 Button/Tag/Divider/Input 스와치 테스트 코드는 별도로 옮기지 않고 제거함 — 필요하면 다시 요청.
31. (2026-09-14) 글 상세 경로를 `/blog/[slug]`에서 루트 `/[slug]`로 단축. `src/app/blog/[slug]/page.tsx`를 `src/app/[slug]/page.tsx`로 이동(빈 `src/app/blog/` 디렉터리 삭제)하고, 내부 링크(`src/app/page.tsx`의 목록 링크, 이전/다음 글 링크, `sidebar-tree.tsx`의 트리 링크·활성 슬러그 판별, `revalidatePath` 경로)를 전부 `/${slug}` 형태로 갱신. 홈(`/`)과 동적 세그먼트(`/[slug]`)가 `src/app` 바로 아래 형제로 공존해도 정적 경로가 우선 매칭되어 충돌 없음 — `next build`로 라우트 테이블 확인 완료.
32. (2026-09-15) 데스크톱 사이드바에 `sticky top-0 h-screen overflow-y-auto self-start` 적용 (`src/components/layout/sidebar.tsx`) — 본문이 사이드바보다 길어져 페이지가 스크롤돼도 사이드바는 뷰포트에 고정되고, 사이드바 자체 콘텐츠가 뷰포트보다 길면 사이드바 내부만 별도로 스크롤됨. 모바일 스티키 헤더(위 "다음 할 일" 항목)와는 별개로 데스크톱 2단 레이아웃에서만 해당.
33. (2026-09-15) `src/app/layout.tsx`의 `metadata`를 create-next-app 기본값(`title: "Create Next App"`, `description: "Generated by create next app"`)에서 `"Jeong-ho blog"`로 교체 — 남아있던 스캐폴드 잔재 정리 (30번 로그에서 페이지 컴포넌트 스캐폴드를 정리한 것과 같은 맥락).

## 컬러

`src/app/globals.css`의 CSS 변수명 기준 (2026-09-03 확정). Tailwind가 `bg-*`/`text-*`/`border-*` 유틸리티를 자동 생성함.

| 토큰 (`--color-*`) | 값 | 용도 |
|---|---|---|
| `background` | `#FAFAF8` | 페이지 배경 (단색, 살짝 따뜻한 화이트) |
| `surface` | `#FFFFFF` | 떠 있는 패널/카드 배경 |
| `foreground` | `#1C1C1A` | 제목/본문 강조 텍스트, 구조선(2px 실선), 코드블록 패널 배경 |
| `foreground-secondary` | `#2E2C28` | 장문 본문(article) 텍스트 |
| `muted` | `#7A7873` | 메타 정보, 캡션, 보조 텍스트 |
| `subtle` | `#A8A59D` | 3단계 옅은 보조색 (트리 아이콘 등) |
| `border` | `#C4C1B9` | 기본 테두리/구분선 (사이드바 트리 가이드라인만 점선, 나머지는 실선) |
| `border-muted` | `#D9D7D1` | 비활성(disabled) 요소 테두리 |
| `primary` | `#24408E` (잉크블루) | 기본 accent |
| `accent-alt` | `#8E2A24` (레드) | 대안 accent — primary와 동시에 쓰는 색이 아니라 교체용 선택지 |
| `code-bg` | `#1C1C1A` | 코드블록 패널 배경 |
| `code-border` | `#55524A` | 코드블록 테두리/탭 구분선 |
| `code-tab` | `#B9B6AD` | 코드블록 파일명 탭 텍스트, disabled 텍스트 |
| `code-text` | `#E8E6E1` | 코드블록 본문 텍스트 |
| `disabled-bg` | `#F0EFEB` | 비활성 컨트롤 배경 |

## 폰트 — D2Coding (Naver)

- 선정 이유: 한글 음절 하나가 영문 두 칸 폭에 정확히 맞도록 설계되어, **한글·영문·코드를 폰트 하나로** 커버. 표/코드 정렬이 가장 정확함.
- (2026-09-03 완료) Google Fonts에 없어서 `src/app/fonts/`에 Regular/Bold(woff2)를 자체 호스팅 + `next/font/local`로 로드, `layout.tsx`에 적용 완료. 원본: https://github.com/naver/d2-coding-font (Ver 1.3.3, OFL 라이선스)
- 목업 캔버스 전체 아트보드에도 동일 폰트를 서브셋(woff2, 실제 사용 문구 기준)해서 base64로 임베드 완료
- 비교했던 후보 (참고용, 목업 캔버스의 Font Comparison 아트보드에 실물 비교 있음):
  - JetBrains Mono + Noto Sans KR — 코드에 특화되지만 한글은 완전히 다른 서체라 이질감
  - IBM Plex Mono + IBM Plex Sans KR — 같은 패밀리라 톤이 잘 맞고 "엔지니어링 디자인 시스템" 느낌 강함 (2순위)
  - Roboto Mono + Noto Sans KR — 가장 무난하고 가독성 좋음, 개성은 약함
  - Space Mono + Noto Sans KR — 타자기 느낌 개성파, 장문 본문엔 부담

## UI 규칙 (실선 기본, 점선은 트리 가이드라인 예외)

- **버튼**: Primary = 채움(solid, accent 배경) / Secondary·Disabled = 실선 테두리 (색·굵기로 상태 구분) / Text = 테두리 없이 텍스트만 (구 Ghost, 2026-09-04 개명) — 전 variant에 hover·active 상태 있음
- **태그**: Default·Outline = 실선 테두리 / Filled = 배경 채움(테두리 없음)
- **인풋**: 기본 상태 = 실선 테두리(muted) / Focused = 실선(accent)
- **디바이더**: Rule(2px, 페이지/섹션 최상위 구조) · Divider(1px, 목록·카드 등 콘텐츠 경계) · Dotted(보조, 표/인라인)
- **코드블록**: 어두운 패널(`#1C1C1A`) + 실선 테두리, 상단에 파일명 탭
- **사이드바 트리 가이드라인**: 카테고리 폴더를 펼쳤을 때 하위 포스트 목록의 들여쓰기 세로선만 점선 유지 (유일한 점선 요소)
- 각진 모서리(border-radius 0), 얇은 1px 보더 기본

## CSS 토큰 (2026-09-03 확정, `src/app/globals.css`)

아트보드 7개 소스를 전수 스캔해서 실제 쓰인 값(색상/font-size/letter-spacing/line-height/border-width/spacing)을 뽑고, Tailwind 기본 스케일과 비교해서 다른 부분만 재정의했다. 색상 토큰은 위 "컬러" 표 참고.

- **font-size** (`--text-2xs` ~ `--text-5xl`): 10~32px 사이 실측값 기준으로 Tailwind 기본 스케일(`text-2xl`=24px, `text-3xl`=30px 등)을 덮어씀. 반 픽셀 차이(10.5/11.5/12.5px 등, 데스크톱·모바일 따로 만들며 생긴 우발적 오차)는 가까운 정수로 통합.
- **letter-spacing** (`--tracking-tight` ~ `--tracking-label`): tight(-0.01em, 큰 제목) / snug(0.02em) / normal(0.04em, 일반 UI 기본값) / wide(0.06em, 라벨) / label(0.09em, "// INDEX" 같은 섹션 라벨) 5단계로 정리.
- **line-height** (`--leading-tight/normal/relaxed`): 1.4(제목) / 1.7(UI 텍스트) / 1.85(본문·코드) 3단계로 정리. 각 `--text-*` 크기마다 역할에 맞는 기본 line-height를 미리 짝지어놔서, `leading-*`를 따로 안 붙여도 자연스럽게 보임.
- **spacing**: 아트보드에서 쓰인 레이아웃 단위(8~100px)가 전부 4px 배수라 Tailwind v4의 유동 spacing 스케일(`p-15`=60px 등)이 그대로 커버함 — 별도 토큰 불필요. 2px/3px/9px/13px 같은 미세 정렬값은 토큰화하지 않고 컴포넌트에서 임의값(`pt-[2px]`)으로 처리.
- **border-radius**: 전 아트보드 공통으로 `0` — `button, input, textarea, select`에 리셋 규칙 추가.

## 만들어둔 아트보드

- **기본 레이아웃**: 모든 페이지 = 사이드바 + 본문. 상단 헤더 없음 (Header 컴포넌트는 폐기됨)
- **Blog Home** — 사이드바 + 콘텐츠(글 목록: 번호·제목·태그·날짜) 2단 구성
- **Blog Home — Mobile** — 390px 프레임. 사이드바 대신 스티키 헤더(사이트명 + 햄버거) → 탭하면 헤더 아래로 트리 메뉴가 펼쳐짐(콘텐츠를 밀어냄, 오버레이 아님). PC·태블릿은 이 변경 없이 사이드바 유지
- **Post Detail** — 사이드바 + 본문(제목/메타, 코드블록, 인용구). Blog Home과 동일한 Sidebar 컴포넌트 공유
- **Post Detail — Mobile** — 390px 프레임. Blog Home — Mobile과 동일한 스티키 헤더 + 햄버거 트리 메뉴, 본문/코드블록/인용구는 모바일 폭에 맞게 폰트·여백 축소
- **UI Kit** — 컬러·타이포·버튼·태그·인풋·디바이더·코드블록 컴포넌트 시트
- **Font Comparison** — 폰트 5종 비교 (참고용). D2Coding 스와치는 실제 폰트로 렌더링됨, 나머지 4종은 비교 목적으로 각자의 후보 폰트 유지
- **Sidebar** — 재사용 컴포넌트로 분리 (`dc-import`). 사이트명 + 카테고리 폴더 트리(클릭 시 펼침/접힘, 하위에 포스트 목록). 카테고리 분류는 기존 글 태그 기반 임시 그룹핑(예시 데이터)

## 다음 할 일

> 2026-09-18 기준 계획 정리. 낙관적 댓글 반영(`useOptimistic`)은 검토 후 폐기 ([`architecture.md` §10](./architecture.md) 참고).

- [ ] **사이드바 트리의 카테고리 분류 체계 확정 (진행 중)** — `post.tags[0]` 임시 방식을 DB 기반 중첩 카테고리 + `/admin` 관리 페이지로 교체하는 중. 1단계(DB)·2단계(인증) 완료, 3단계(관리 페이지)부터 이어서 진행. 결정 사항과 세부 단계는 [`category-admin-plan.md`](./category-admin-plan.md) 참고
- [ ] **댓글 목록 페이지네이션** — `comment-list.tsx`가 `.range()`/`.limit()` 없이 글당 전체 댓글을 한 번에 조회·렌더링 중. 댓글이 쌓일수록 조회량·DOM 노드 수가 무한정 늘어나는 구조 (2026-09-18 확인)
- [ ] **`react-hook-form`을 실제 사용처(댓글 폼 등)에 적용할지 검토** — 지금은 `src/components/test/input-form-test.tsx` 데모에만 있음
- [ ] **홈 페이지 별도 추가** — 지금 루트 `/`는 글 목록(`page.tsx`)이 바로 나오는데, 목록과 분리된 초기 화면을 새로 만들고 아스키 아트 요소를 넣는 방향 검토. 글 목록은 다른 경로로 옮겨야 할지도 같이 결정 필요
- [ ] **한줄 일기 (댓글 폼과 같은 형식)** — 미확정, 고민 중인 지점:
  - 작성자를 어떻게 구분할지 (본인 전용 글쓰기인지, 댓글처럼 익명 작성 가능한 형태인지)
  - `comments` 테이블을 재사용할지, 별도 테이블(`diary`/`notes` 등)을 새로 만들지

완료된 항목 (참고):
- [x] 전반적인 페이지 레이아웃(사이드바 + 본문) 실제 코드 구현, 글 목록을 `/blog`에서 루트 `/`로 이동 — 29·30번 로그 참고
- [x] 모바일 레이아웃(스티키 헤더 + 햄버거 트리 메뉴) 구현 — `sidebar-shell.tsx`, [`css-architecture.md` §7](./css-architecture.md) 참고
- [x] 목업 → 실제 Next.js 컴포넌트로 옮기기 (Button/Tag/Input/Divider/CodeBlock/본문 타이포그래피 전부 완료)
