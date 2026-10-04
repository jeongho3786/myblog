"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createDiaryEntry } from "@/lib/actions/diary";
import { DIARY_BODY_MAX_LENGTH } from "@/lib/diary";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";

type DiaryEntryFormValues = {
  body: string;
};

// /diary 하단의 작성 폼. 어드민일 때만 렌더링된다 (서버 액션도 verifyAdmin으로 다시 확인).
const DiaryEntryForm = () => {
  const router = useRouter();
  // CommentForm과 같은 이유로 RHF isSubmitting 대신 useTransition (Server Action은 startTransition으로 감싸 호출)
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<DiaryEntryFormValues>({ defaultValues: { body: "" } });

  const onSubmit = (values: DiaryEntryFormValues) => {
    startTransition(async () => {
      const { error } = await createDiaryEntry({ body: values.body });

      if (error) {
        setError("root.serverError", { message: error });
        return;
      }

      reset();
      // 최신순이라 새 일기는 1페이지 맨 위에 들어간다. 다른 페이지에서 썼어도 바로 보이게 1페이지로 이동
      router.push("/diary");
    });
  }

  return (
    <section className="mt-14 border-t border-border pt-8">
      <h2 className="mb-4 text-sm font-medium tracking-label text-primary">{"// WRITE"}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Textarea
            placeholder="오늘의 짧은 일기"
            rows={3}
            maxLength={DIARY_BODY_MAX_LENGTH}
            aria-invalid={!!errors.body}
            {...register("body", {
              required: "내용을 입력해 주세요.",
              // 공백만 입력한 값은 required를 통과하므로 한 번 더 막는다. 서버 액션도 trim 후 같은 검사를 한다
              validate: (value) => value.trim().length > 0 || "내용을 입력해 주세요.",
              maxLength: {
                value: DIARY_BODY_MAX_LENGTH,
                message: `${DIARY_BODY_MAX_LENGTH}자까지 입력할 수 있습니다.`,
              },
            })}
          />
          {errors.body && (
            <p className="text-xs text-accent-alt">{errors.body.message}</p>
          )}
        </div>

        {errors.root?.serverError && (
          <p className="text-sm text-accent-alt">{errors.root.serverError.message}</p>
        )}

        <Button type="submit" variant={isPending ? "disabled" : "primary"} className="self-start">
          {isPending ? "저장 중..." : "기록하기"}
        </Button>
      </form>
    </section>
  );
}

export default DiaryEntryForm;
