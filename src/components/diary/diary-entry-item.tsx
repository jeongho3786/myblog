"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { DIARY_BODY_MAX_LENGTH, type DiaryEntry } from "@/lib/diary";
import { deleteDiaryEntry, updateDiaryEntry } from "@/lib/actions/diary";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import { cn } from "@/lib/cn";

// view: 읽기 / edit: 본문 자리가 입력창으로 바뀜 / confirmDelete: 삭제 확인 버튼이 나옴
type Mode = "view" | "edit" | "confirmDelete";

type EditFormValues = { body: string };

// 짧은 일기 하나. canEdit(어드민)일 때만 수정/삭제 버튼이 보인다. 실제 권한 확인은 서버 액션의 verifyAdmin().
// 날짜는 서버 시간대(Vercel은 UTC)와 상관없이 한국 날짜로 보이도록 시간대를 고정한다 — 서버·브라우저 렌더링 결과도 같아진다.
const DiaryEntryItem = ({ entry, canEdit }: { entry: DiaryEntry; canEdit: boolean }) => {
  const [mode, setMode] = useState<Mode>("view");
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormValues>({ defaultValues: { body: entry.body } });

  const changeMode = (nextMode: Mode) => {
    setActionError(null);
    // 수정을 시작할 때마다 지금 저장된 본문으로 입력창을 채운다 (취소했다가 다시 열어도 원래 내용부터)
    if (nextMode === "edit") reset({ body: entry.body });
    setMode(nextMode);
  };

  const onSave = (values: EditFormValues) => {
    startTransition(async () => {
      const { error } = await updateDiaryEntry({ id: entry.id, body: values.body });
      if (error) {
        setActionError(error);
        return;
      }
      // revalidatePath로 새 본문이 entry prop으로 내려오므로 읽기 모드로만 돌아가면 된다
      setMode("view");
    });
  };

  const onDelete = () => {
    startTransition(async () => {
      const { error } = await deleteDiaryEntry({ id: entry.id });
      // 성공하면 이 항목은 다시 그린 목록에서 빠지므로 따로 할 일이 없다
      if (error) setActionError(error);
    });
  };

  return (
    <li className="border-b border-border py-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs tracking-wide text-muted">
          {new Date(entry.created_at).toLocaleDateString("ko-KR", {
            timeZone: "Asia/Seoul",
          })}
        </span>

        {canEdit && mode === "view" && (
          <div className="flex gap-1">
            <SmallButton onClick={() => changeMode("edit")}>수정</SmallButton>
            <SmallButton onClick={() => changeMode("confirmDelete")}>삭제</SmallButton>
          </div>
        )}

        {canEdit && mode === "confirmDelete" && (
          <div className="flex items-center gap-1">
            <span className="mr-1 text-xs text-accent-alt">정말 삭제할까요?</span>
            <SmallButton onClick={onDelete} disabled={isPending} danger>
              {isPending ? "삭제 중..." : "확인"}
            </SmallButton>
            <SmallButton onClick={() => changeMode("view")} disabled={isPending}>
              취소
            </SmallButton>
          </div>
        )}
      </div>

      {mode === "edit" ? (
        <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-2">
          <Textarea
            rows={3}
            maxLength={DIARY_BODY_MAX_LENGTH}
            aria-invalid={!!errors.body}
            {...register("body", {
              required: "내용을 입력해 주세요.",
              validate: (value) => value.trim().length > 0 || "내용을 입력해 주세요.",
              maxLength: {
                value: DIARY_BODY_MAX_LENGTH,
                message: `${DIARY_BODY_MAX_LENGTH}자까지 입력할 수 있습니다.`,
              },
            })}
          />
          {errors.body && <p className="text-xs text-accent-alt">{errors.body.message}</p>}

          <div className="flex gap-2">
            <Button type="submit" variant={isPending ? "disabled" : "primary"}>
              {isPending ? "저장 중..." : "저장"}
            </Button>
            <Button
              type="button"
              variant={isPending ? "disabled" : "secondary"}
              onClick={() => changeMode("view")}
            >
              취소
            </Button>
          </div>
        </form>
      ) : (
        <p className="whitespace-pre-wrap text-foreground-secondary">{entry.body}</p>
      )}

      {actionError && <p className="mt-2 text-xs text-accent-alt">{actionError}</p>}
    </li>
  );
}

// 항목 오른쪽 위의 작은 텍스트 버튼 (수정 · 삭제 · 확인 · 취소).
// ui/Button의 text variant에 className으로 크기·색만 덮어쓴다 — Button 안의 cn()이 겹치는 기본 클래스(px-4 py-2 text-sm text-foreground)를 지운다.
const SmallButton = ({
  onClick,
  disabled,
  danger,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) => (
  <Button
    type="button"
    variant="text"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "px-2 py-1 text-xs disabled:text-code-tab",
      danger ? "text-accent-alt" : "text-muted hover:text-foreground",
    )}
  >
    {children}
  </Button>
);

export default DiaryEntryItem;
