"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Category = {
  key: string;
  name: string;
  posts: { slug: string; title: string }[];
};

const SidebarTree = ({ categories }: { categories: Category[] }) => {
  const pathname = usePathname();
  const activeSlug =
    pathname && pathname !== "/" ? pathname.slice(1) : null;

  const defaultExpanded = categories.find((category) =>
    category.posts.some((post) => post.slug === activeSlug),
  )?.key;

  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(defaultExpanded ? [defaultExpanded] : []),
  );

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <nav className="flex flex-col gap-0.5">
      {categories.map((category) => {
        const isOpen = expanded.has(category.key);
        return (
          <div key={category.key}>
            <button
              type="button"
              onClick={() => toggle(category.key)}
              className="flex w-full cursor-pointer items-center gap-1.5 py-1.5 text-left"
            >
              <svg
                width="8"
                height="8"
                viewBox="0 0 16 16"
                className={`shrink-0 text-muted transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}
              >
                <path
                  d="M5 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                className="shrink-0 text-muted"
              >
                <path
                  d="M1.5 3.5h4l1.2 1.5h7.3a.5.5 0 01.5.5v7a.5.5 0 01-.5.5h-12a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  fill="none"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className={`text-sm font-medium ${isOpen ? "text-foreground" : "text-muted"}`}
              >
                {category.name}
              </span>
            </button>

            {isOpen && (
              <div className="ml-2.25 border-l border-dotted border-border pl-3.5">
                {category.posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/${post.slug}`}
                    className="flex items-center gap-1.5 py-1.5"
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 16 16"
                      className="shrink-0 text-subtle"
                    >
                      <path
                        d="M4 1.5h5.5L12.5 4.5V14a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5v-12a.5.5 0 01.5-.5z"
                        stroke="currentColor"
                        strokeWidth="1.1"
                        fill="none"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.5 1.5V4.5H12.5"
                        stroke="currentColor"
                        strokeWidth="1.1"
                        fill="none"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="truncate text-xs text-muted">
                      {post.title}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default SidebarTree;
