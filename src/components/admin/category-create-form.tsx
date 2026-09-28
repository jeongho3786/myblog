"use client";

import { type SubmitEvent, useState, useTransition } from "react";
import { createCategory } from "@/lib/actions/categories";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import type { CategoryOption } from "@/lib/categories";

const ROOT = "";

const CategoryCreateForm = ({ parentOptions }: { parentOptions: CategoryOption[] }) => {
  const [isPending, startTransition] = useTransition();
  const [parentId, setParentId] = useState(ROOT);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const { error } = await createCategory({
        name,
        slug,
        parentId: parentId === ROOT ? null : parentId,
      });

      if (error) {
        setError(error);
        return;
      }

      // 같은 폴더 아래에 연달아 추가하는 경우가 많아서 상위 폴더 선택은 유지한다
      setName("");
      setSlug("");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">상위 폴더</span>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full border border-border bg-transparent px-4 py-3 text-md text-foreground outline-none transition-colors focus:border-primary"
        >
          <option value={ROOT}>(최상위)</option>
          {parentOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">이름 (화면에 보이는 글자, 나중에 수정 가능)</span>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 자료구조"
          required
          maxLength={40}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">
          slug (MDX의 category에 적는 값, 만든 뒤 수정 불가)
        </span>
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="예: data-structure"
          required
          maxLength={40}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          title="소문자·숫자·하이픈만 (예: data-structure)"
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      {error && <p className="text-sm text-primary">{error}</p>}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "추가 중..." : "카테고리 추가"}
      </Button>
    </form>
  );
};

export default CategoryCreateForm;
