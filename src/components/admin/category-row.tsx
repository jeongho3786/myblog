"use client";

import { type SubmitEvent, useState, useTransition } from "react";
import {
  deleteCategory,
  findPostsInCategory,
  moveCategory,
  renameCategory,
  reorderCategory,
} from "@/lib/actions/categories";
import { FolderIcon } from "@/components/ui/icons";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import type { CategoryNode, CategoryOption } from "@/lib/categories";

type CategoryRowProps = Pick<CategoryNode, "id" | "name" | "slug" | "depth"> & {
  // 지금 상위 폴더 (최상위면 null)
  parentId: string | null;
  // 이 폴더를 옮길 수 있는 상위 폴더 목록 (자기 자신 · 하위 폴더 · 깊이 초과 위치는 이미 빠져 있다)
  moveOptions: CategoryOption[];
  // 같은 폴더 안에서 맨 위 / 맨 아래인지 (순서 버튼 비활성화용)
  isFirst: boolean;
  isLast: boolean;
  // 하위 폴더가 있으면 삭제할 수 없다
  hasChildren: boolean;
};

// view: 평소 / rename: 이름 변경 중 / move: 이동 중 / delete: 삭제 확인 중
type Mode = "view" | "rename" | "move" | "delete";

type LinkedPost = { slug: string; title: string };

const ROOT = "";

// 어드민 트리의 한 줄. "이름 변경" · "이동" · "삭제"를 누르면 그 줄이 입력 폼 / 확인 영역으로 바뀐다 (slug는 수정 불가라 그대로 표시)
const CategoryRow = ({
  id,
  name,
  slug,
  depth,
  parentId,
  moveOptions,
  isFirst,
  isLast,
  hasChildren,
}: CategoryRowProps) => {
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<Mode>("view");
  const [draftName, setDraftName] = useState(name);
  const [draftParentId, setDraftParentId] = useState(parentId ?? ROOT);
  const [error, setError] = useState<string | null>(null);
  // 삭제 확인 때 찾은 "이 폴더에 바로 속한 글". null이면 아직 찾는 중
  const [linkedPosts, setLinkedPosts] = useState<LinkedPost[] | null>(null);

  const startMode = (nextMode: Mode) => {
    // 이전에 취소했던 입력이 남지 않도록 현재 값으로 다시 채운다
    setDraftName(name);
    setDraftParentId(parentId ?? ROOT);
    setError(null);
    setMode(nextMode);
  };

  const submit = (action: () => Promise<{ error: string | null }>) => {
    setError(null);

    startTransition(async () => {
      const { error } = await action();

      if (error) {
        setError(error);
        return;
      }

      setMode("view");
    });
  };

  const startDelete = () => {
    startMode("delete");
    setLinkedPosts(null);

    // 하위 폴더가 있으면 어차피 삭제할 수 없으므로 글을 찾지 않는다
    if (hasChildren) return;

    startTransition(async () => {
      const result = await findPostsInCategory(slug);

      // 실패하면 linkedPosts가 null로 남아 삭제 버튼도 비활성화된 채로 유지된다
      if (result.error !== null) {
        setError(result.error);
        return;
      }

      setLinkedPosts(result.posts);
    });
  };

  const handleRename = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(() => renameCategory({ id, name: draftName }));
  };

  const handleMove = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(() =>
      moveCategory({
        id,
        parentId: draftParentId === ROOT ? null : draftParentId,
      }),
    );
  };

  const cancelButton = (
    <Button
      type="button"
      variant="secondary"
      disabled={isPending}
      onClick={() => setMode("view")}
      className="shrink-0 px-2 py-1"
    >
      취소
    </Button>
  );

  const errorMessage = error && <p className="text-sm text-primary">{error}</p>;

  if (mode === "rename") {
    return (
      <form onSubmit={handleRename} className="flex flex-col gap-1.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <FolderIcon className="shrink-0 text-muted" />

          <Input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            required
            maxLength={40}
            autoFocus
            className="px-2 py-1"
          />

          <span className="shrink-0 text-sm text-muted">/{slug}</span>

          <Button type="submit" disabled={isPending} className="shrink-0 px-2 py-1">
            {isPending ? "저장 중..." : "저장"}
          </Button>

          {cancelButton}
        </div>

        {errorMessage}
      </form>
    );
  }

  if (mode === "move") {
    return (
      <form onSubmit={handleMove} className="flex flex-col gap-1.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <FolderIcon className="shrink-0 text-muted" />

          <span className="shrink-0 text-base font-medium text-foreground">{name}</span>

          <span className="shrink-0 text-sm text-muted">→</span>

          <select
            value={draftParentId}
            onChange={(e) => setDraftParentId(e.target.value)}
            autoFocus
            className="w-full min-w-0 border border-border bg-transparent px-2 py-1 text-md text-foreground outline-none transition-colors focus:border-primary"
          >
            <option value={ROOT}>(최상위)</option>
            {moveOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <Button type="submit" disabled={isPending} className="shrink-0 px-2 py-1">
            {isPending ? "이동 중..." : "이동"}
          </Button>

          {cancelButton}
        </div>

        {errorMessage}
      </form>
    );
  }

  if (mode === "delete") {
    return (
      <div className="flex flex-col gap-1.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <FolderIcon className="shrink-0 text-muted" />

          <span className="text-base font-medium text-foreground">{name}</span>

          <span className="text-sm text-muted">/{slug}</span>
        </div>

        <p className="text-sm text-muted">
          {hasChildren
            ? "하위 폴더가 있어서 삭제할 수 없습니다. 하위 폴더를 먼저 옮기거나 삭제해 주세요."
            : linkedPosts === null
              ? // 조회에 실패했으면 아래 에러 메시지만 보여준다
                error
                ? null
                : "연결된 글을 확인하는 중..."
              : linkedPosts.length === 0
                ? "이 폴더에 바로 속한 글이 없습니다. 삭제할까요?"
                : `글 ${linkedPosts.length}개가 uncategorized로 바뀝니다: ${linkedPosts
                    .map((post) => post.title)
                    .join(", ")}. 삭제할까요?`}
        </p>

        <div className="flex items-center gap-1.5">
          {!hasChildren && (
            <Button
              type="button"
              disabled={isPending || linkedPosts === null}
              onClick={() => submit(() => deleteCategory({ id }))}
              className="shrink-0 px-2 py-1"
            >
              {isPending && linkedPosts !== null ? "삭제 중..." : "삭제"}
            </Button>
          )}

          {cancelButton}
        </div>

        {errorMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 py-1.5">
      <div className="flex items-center gap-1.5">
        <FolderIcon className="shrink-0 text-muted" />

        <span className="text-base font-medium text-foreground">{name}</span>

        <span className="text-sm text-muted">/{slug}</span>

        <span className="ml-auto text-xs tracking-wide text-subtle">L{depth}</span>

        <Button
          type="button"
          variant="text"
          disabled={isFirst || isPending}
          onClick={() => submit(() => reorderCategory({ id, direction: "up" }))}
          aria-label="위로"
          className="px-2 py-0.5 text-xs disabled:text-subtle"
        >
          ↑
        </Button>

        <Button
          type="button"
          variant="text"
          disabled={isLast || isPending}
          onClick={() => submit(() => reorderCategory({ id, direction: "down" }))}
          aria-label="아래로"
          className="px-2 py-0.5 text-xs disabled:text-subtle"
        >
          ↓
        </Button>

        <Button
          type="button"
          variant="text"
          onClick={() => startMode("rename")}
          className="px-2 py-0.5 text-xs"
        >
          이름 변경
        </Button>

        <Button
          type="button"
          variant="text"
          onClick={() => startMode("move")}
          className="px-2 py-0.5 text-xs"
        >
          이동
        </Button>

        <Button
          type="button"
          variant="text"
          onClick={startDelete}
          className="px-2 py-0.5 text-xs"
        >
          삭제
        </Button>
      </div>

      {errorMessage}
    </div>
  );
};

export default CategoryRow;
