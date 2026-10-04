import { ASCII_BANNER, ASCII_BANNER_COLUMNS } from "@/components/home/ascii-banner";

// 표제란(도면 귀퉁이의 정보 칸)에 들어가는 연락처
const CONTACTS = [
  { label: "EMAIL", text: "jeongho3786@gmail.com", href: "mailto:jeongho3786@gmail.com" },
  { label: "GITHUB", text: "github.com/jeongho3786", href: "https://github.com/jeongho3786" },
];

// 배너 글자 크기: D2Coding 영문 한 글자 폭은 0.5em이라 배너 폭 = 칸 수 × 0.5em.
// 배너를 감싼 영역의 폭(100cqw)에 꽉 맞는 글자 크기는 100cqw / 칸 수 × 2 — 반올림 오차로 넘치지 않게 2 대신 1.8로 여유를 둔다.
// 넓은 화면에서는 최대 1.5rem(24px)에서 멈춘다.
const bannerFontSize = `min(1.5rem, calc(100cqw / ${ASCII_BANNER_COLUMNS} * 1.8))`;

const Home = () => {
  return (
    <main className="flex w-full items-center justify-center px-5 py-14 sm:px-14">
      {/* 그림은 스크린리더가 기호를 한 글자씩 읽지 않게 숨기고, 대신 이 제목을 읽게 한다 */}
      <h1 className="sr-only">jeong-ho blog</h1>

      <div className="w-full max-w-3xl border border-border">
        <div className="@container px-6 py-10 sm:px-10 sm:py-16">
          <pre
            aria-hidden="true"
            className="mx-auto w-fit leading-[1.15] text-foreground"
            style={{ fontSize: bannerFontSize }}
          >
            {ASCII_BANNER}
          </pre>
        </div>

        <dl className="grid grid-cols-[auto_1fr] border-t border-border text-base sm:text-lg">
          {CONTACTS.map((contact, index) => (
            <div
              key={contact.label}
              className={`col-span-2 grid grid-cols-subgrid ${index > 0 ? "border-t border-border" : ""}`}
            >
              <dt className="border-r border-border px-4 py-3 tracking-label text-muted sm:px-6 sm:py-4">
                {contact.label}
              </dt>
              <dd className="px-4 py-3 sm:px-6 sm:py-4">
                <a
                  href={contact.href}
                  {...(contact.href.startsWith("http") && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                  className="text-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  {contact.text}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
};

export default Home;
