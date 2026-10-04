"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronIcon, FolderIcon, FileIcon } from "@/components/ui/icons";

export type SidebarPost = { slug: string; title: string };

// 트리 맨 아래에 고정되는 짧은 일기 페이지(/diary). 글과 같은 파일 모양·활성 표시를 쓰려고 SidebarPost 형태로 둔다.
const DIARY_LINK: SidebarPost = { slug: "diary", title: "짧은 일기" };

export type SidebarFolder = {
  id: string;
  name: string;
  children: SidebarFolder[];
  posts: SidebarPost[];
};

// 같은 단계에서는 폴더 먼저, 글(파일) 나중 (파일 탐색기 방식)
const SidebarTree = ({
  folders,
  uncategorized,
}: {
  folders: SidebarFolder[];
  // 폴더에 속하지 않은 글 — 최상위에 파일로 표시
  uncategorized: SidebarPost[];
}) => {
  const pathname = usePathname();
  const activeSlug = pathname && pathname !== "/" ? pathname.slice(1) : null;

  // 처음에는 지금 보고 있는 글이 들어 있는 폴더와 그 상위 폴더들을 펼친다
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(activeSlug ? findFolderPath(folders, activeSlug) : []),
  );

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
        return next;
      }

      next.add(id);
      return next;
    });
  };

  return (
    <nav className="flex flex-col gap-0.5">
      <FolderList
        folders={folders}
        expanded={expanded}
        onToggle={toggle}
        activeSlug={activeSlug}
      />

      <PostList posts={uncategorized} activeSlug={activeSlug} />

      <PostList posts={[DIARY_LINK]} activeSlug={activeSlug} />
    </nav>
  );
};

const FolderList = ({
  folders,
  expanded,
  onToggle,
  activeSlug,
}: {
  folders: SidebarFolder[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  activeSlug: string | null;
}) =>
  folders.map((folder) => {
    const isOpen = expanded.has(folder.id);
    return (
      <div key={folder.id}>
        <button
          type="button"
          onClick={() => onToggle(folder.id)}
          className="flex w-full cursor-pointer items-center gap-1.5 py-1.5 text-left"
        >
          <ChevronIcon
            className={`shrink-0 text-muted transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}
          />

          <FolderIcon className="shrink-0 text-muted" />

          <span
            className={`text-base font-medium ${isOpen ? "text-foreground" : "text-muted"}`}
          >
            {folder.name}/
          </span>
        </button>

        {isOpen && (
          <div className="ml-2.25 flex flex-col gap-0.5 border-l border-dotted border-border pl-3.5">
            <FolderList
              folders={folder.children}
              expanded={expanded}
              onToggle={onToggle}
              activeSlug={activeSlug}
            />

            <PostList posts={folder.posts} activeSlug={activeSlug} />
          </div>
        )}
      </div>
    );
  });

const PostList = ({
  posts,
  activeSlug,
}: {
  posts: SidebarPost[];
  activeSlug: string | null;
}) =>
  posts.map((post) => {
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
  });

// 글이 들어 있는 폴더까지의 경로(최상위 → 글이 바로 속한 폴더)의 id 목록. 폴더 안에 없으면 빈 배열
const findFolderPath = (folders: SidebarFolder[], postSlug: string): string[] => {
  for (const folder of folders) {
    if (folder.posts.some((post) => post.slug === postSlug)) return [folder.id];

    const childPath = findFolderPath(folder.children, postSlug);
    if (childPath.length > 0) return [folder.id, ...childPath];
  }

  return [];
};

export default SidebarTree;
