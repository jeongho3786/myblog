"use client";

import { useEffect, useState } from "react";

type Heading = {
  text: string;
  level: 1 | 2;
  element: HTMLElement;
};

const PostToc = () => {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const container = document.getElementById("post-content");
    if (!container) return;

    const elements = Array.from(
      container.querySelectorAll<HTMLElement>("h1, h2"),
    );

    // 서버 렌더 시점엔 존재하지 않는 본문 DOM을 읽어야 해서 렌더 중 계산이 불가능함
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeadings(
      elements.map((element) => ({
        text: element.textContent ?? "",
        level: element.tagName === "H1" ? 1 : 2,
        element,
      })),
    );
  }, []);

  if (headings.length === 0) return null;

  const handleClick = (element: HTMLElement) => {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="flex flex-col gap-2">
      <div className="text-sm font-medium tracking-label text-primary">
        {"// ON THIS PAGE"}
      </div>

      {headings.map((heading, index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleClick(heading.element)}
          className={`cursor-pointer truncate text-left text-sm text-muted transition-colors hover:text-foreground ${
            heading.level === 2 ? "pl-3" : ""
          }`}
        >
          {heading.text}
        </button>
      ))}
    </nav>
  );
};

export default PostToc;
