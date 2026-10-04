import { extendTailwindMerge } from "tailwind-merge";

// 클래스 문자열을 합치면서, 같은 CSS 속성을 정하는 클래스가 겹치면 뒤에 온 것만 남긴다.
// 예) cn("px-4 py-2 text-sm", "px-2 py-1") → "text-sm px-2 py-1"
//
// 왜 필요한가: class 속성 안의 순서는 CSS 우선순위와 무관하고, 같은 우선순위면 "CSS 파일에서 뒤에 정의된 규칙"이 이긴다.
// Tailwind는 같은 종류를 숫자 순서로 출력해서 .px-4가 .px-2보다 뒤에 있다 → "px-4 ... px-2"를 같이 붙이면 px-4가 이긴다.
// 그래서 ui 컴포넌트의 기본 클래스를 className으로 덮어쓰려면 겹치는 쪽을 미리 지워줘야 한다.
//
// tailwind-merge는 Tailwind 기본 이름 기준으로 "어떤 클래스끼리 같은 속성인지"를 판단하므로,
// globals.css의 @theme에서 기본에 없는 이름으로 만든 토큰 중 스스로 알아보지 못하는 것은 알려줘야 한다.
// - tracking-snug / tracking-label: 등록 안 하면 자간으로 인식 못 해서 "tracking-snug tracking-wide"가 둘 다 남는다 → 등록
// - text-2xs / text-md: 2xs·md 같은 크기 이름 형태는 스스로 글자 크기로 분류한다 → 등록 불필요 (직접 실행해서 확인)
// - 색 토큰(--color-*): 이름이 무엇이든 text-·bg-·border- 뒤의 값을 색으로 처리한다 → 등록 불필요
// globals.css에 새 tracking-* 토큰처럼 크기 이름 형태가 아닌 토큰을 추가하면 여기에도 추가한다.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      tracking: ["snug", "label"],
    },
  },
});

export const cn = (...classNames: (string | false | null | undefined)[]) =>
  twMerge(classNames.filter(Boolean).join(" "));
