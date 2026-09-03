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

- **버튼**: Primary = 채움(solid, accent 배경) / Secondary·Ghost·Disabled = 실선 테두리 (색·굵기로 상태 구분)
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

- [ ] 사이드바 트리의 카테고리 분류 체계 확정 (지금은 태그 기반 임시 그룹핑)
- [ ] 목업 → 실제 Next.js 컴포넌트로 옮기기
