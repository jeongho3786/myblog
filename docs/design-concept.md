# 블로그 디자인 컨셉 — Draftline

> 2026-08-29 ~ 2026-08-30 논의 정리. 디자인 목업(Claude Design 캔버스) 기준.
> 캔버스: https://claude.ai/code/artifact/8af21ed2-40a3-4e38-ba99-82644c3ef4ca

## 컨셉 한 줄 요약

**단색 배경 + 점선(dashed) 테두리로 도면/공학 노트 느낌.**
`Solid = 지금 누를 수 있는 것 / 활성 상태`, `Dashed = 구조·경계` 라는 규칙 하나로 화면 전체를 읽는다.

## 여기까지 온 과정

1. 처음엔 **모눈종이 배경**(20px 소격자 + 100px 대격자)에 자로 그은 듯한 정렬을 시도.
2. 실제로 보니 배경 격자선과 UI 요소의 선이 서로 어긋나면서 오히려 산만해짐. → **배경은 단색으로 되돌리고**, 대신 UI 자체의 테두리를 점선으로 그어 "도면" 느낌을 내는 방향으로 전환.
3. 점선 두께 비교(Light 1px 위주 vs Heavy 2px + 구조선까지 점선) → **Light Dash**로 확정. 큰 구조선(헤더 밑줄, 제목 밑줄, 섹션 경계)만 실선 유지, 나머지는 1px 점선.
4. 폰트 5종 비교 → **D2Coding(네이버)**으로 확정.

## 컬러

| 이름 | 값 | 용도 |
|---|---|---|
| Background | `#FAFAF8` | 페이지 배경 (단색, 살짝 따뜻한 화이트) |
| Border (dashed 기본) | `#C4C1B9` | 점선 테두리 색 |
| Foreground | `#1C1C1A` | 본문/제목 텍스트, 구조선(실선) |
| Muted | `#7A7873` | 메타 정보, 캡션, 보조 텍스트 |
| Accent (기본) | `#24408E` (잉크블루) | 포인트 컬러 |
| Accent (대안) | `#8E2A24` (레드) | 포인트 컬러 옵션 |

## 폰트 — D2Coding (Naver)

- 선정 이유: 한글 음절 하나가 영문 두 칸 폭에 정확히 맞도록 설계되어, **한글·영문·코드를 폰트 하나로** 커버. 표/코드 정렬이 가장 정확함.
- Google Fonts에 없음 → 실제 구현 시 폰트 파일을 프로젝트에 내려받아 `next/font/local`로 자체 호스팅 필요. (`public/fonts/` 또는 `src/assets/fonts/`에 두고 `localFont()`로 로드)
- 다운로드: https://github.com/naver/d2-coding-font (Regular / Bold, 필요시 Ligature 버전도 있음)
- 비교했던 후보 (참고용, 목업 캔버스의 Font Comparison 아트보드에 실물 비교 있음):
  - JetBrains Mono + Noto Sans KR — 코드에 특화되지만 한글은 완전히 다른 서체라 이질감
  - IBM Plex Mono + IBM Plex Sans KR — 같은 패밀리라 톤이 잘 맞고 "엔지니어링 디자인 시스템" 느낌 강함 (2순위)
  - Roboto Mono + Noto Sans KR — 가장 무난하고 가독성 좋음, 개성은 약함
  - Space Mono + Noto Sans KR — 타자기 느낌 개성파, 장문 본문엔 부담

## UI 규칙 (Solid vs Dashed)

- **버튼**: Primary = 채움(solid, accent 배경) / Secondary·Ghost·Disabled = 점선 테두리
- **태그**: Default·Outline = 점선 테두리 / Filled = 배경 채움(테두리 없음)
- **인풋**: 기본 상태 = 점선 테두리 / Focused = 실선(accent)
- **디바이더**: Rule(2px 실선, 페이지/섹션 최상위 구조) · Dashed(1px, 목록·카드 등 콘텐츠 경계) · Dotted(보조, 표/인라인)
- **코드블록**: 어두운 패널(`#1C1C1A`) + 점선 테두리, 상단에 파일명 탭
- 각진 모서리(border-radius 0), 얇은 1px 보더 기본

## 만들어둔 아트보드

- **Blog Home** — 헤더 + 글 목록 (번호·제목·태그·날짜)
- **Post Detail** — 제목/메타, 본문, 코드블록, 인용구
- **UI Kit** — 컬러·타이포·버튼·태그·인풋·디바이더·코드블록 컴포넌트 시트
- **Font Comparison** — 폰트 5종 비교 (참고용, 최종 페이지들에는 아직 D2Coding 미적용 — 다음 작업에서 반영)
- Header는 재사용 컴포넌트로 분리 (`dc-import`)

## 다음 할 일

- [ ] 화면 레이아웃 잡기 (내일)
- [ ] 목업 아트보드들 폰트를 D2Coding으로 교체
- [ ] D2Coding 폰트 파일 프로젝트에 반입 + `next/font/local` 세팅
- [ ] 목업 → 실제 Next.js 컴포넌트로 옮기기
