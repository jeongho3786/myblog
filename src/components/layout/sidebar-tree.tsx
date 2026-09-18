"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronIcon, FolderIcon, FileIcon } from "@/components/ui/icons";

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
        return next;
      }

      next.add(key);
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
              <ChevronIcon
                className={`shrink-0 text-muted transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}
              />

              <FolderIcon className="shrink-0 text-muted" />

              <span
                className={`text-base font-medium ${isOpen ? "text-foreground" : "text-muted"}`}
              >
                {category.name}
              </span>
            </button>

            {isOpen && (
              <div className="ml-2.25 border-l border-dotted border-border pl-3.5">
                {category.posts.map((post) => {
                  const isActive = post.slug === activeSlug;
                  return (
                    <Link
                      key={post.slug}
                      href={`/${post.slug}`}
                      className="flex items-center gap-1.5 py-1.5"
                    >
                      <FileIcon
                        active={isActive}
                        className={`shrink-0 ${isActive ? "text-accent" : "text-subtle"}`}
                      />

                      <span
                        className={`truncate text-sm ${isActive ? "font-medium text-foreground" : "text-muted"}`}
                      >
                        {post.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default SidebarTree;
