"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { createComment } from "@/lib/actions/comments";
import { AUTHOR_NAME_MAX_LENGTH, COMMENT_BODY_MAX_LENGTH } from "@/lib/comments";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";

type CommentFormValues = {
  authorName: string;
  body: string;
  website: string; // honeypot
};

// 공백만 입력한 값은 required를 통과하므로 validate로 한 번 더 막는다. 서버 액션도 trim 후 같은 검사를 한다.
const notBlank = (message: string) => (value: string) =>
  value.trim().length > 0 || message;

const CommentForm = ({ postSlug }: { postSlug: string }) => {
  // RHF의 isSubmitting 대신 useTransition을 쓴다: Next 문서상 이벤트 핸들러에서 Server Action은 startTransition으로 감싸 호출하고,
  // isPending은 revalidatePath로 다시 그린 화면이 반영될 때까지 true로 유지된다.
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CommentFormValues>({
    defaultValues: { authorName: "", body: "", website: "" },
  });

  // handleSubmit은 검증을 통과했을 때만 이 함수를 호출한다.
  const onSubmit = (values: CommentFormValues) => {
    startTransition(async () => {
      const { error } = await createComment({
        postSlug,
        authorName: values.authorName,
        body: values.body,
        honeypot: values.website,
      });

      if (error) {
        // 특정 필드가 아닌 폼 전체 에러(rate limit 등)는 root에 둔다.
        setError("root.serverError", { message: error });
        return;
      }

      reset();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <input
        type="text"
        {...register("website")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px]"
      />

      <div className="flex flex-col gap-1">
        <Input
          type="text"
          placeholder="이름"
          maxLength={AUTHOR_NAME_MAX_LENGTH}
          aria-invalid={!!errors.authorName}
          {...register("authorName", {
            required: "이름을 입력해주세요.",
            validate: notBlank("이름을 입력해주세요."),
            maxLength: {
              value: AUTHOR_NAME_MAX_LENGTH,
              message: `이름은 ${AUTHOR_NAME_MAX_LENGTH}자까지 입력할 수 있어요.`,
            },
          })}
        />
        {errors.authorName && (
          <p className="text-xs text-accent-alt">{errors.authorName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Textarea
          placeholder="댓글을 입력하세요"
          rows={4}
          maxLength={COMMENT_BODY_MAX_LENGTH}
          aria-invalid={!!errors.body}
          {...register("body", {
            required: "댓글을 입력해주세요.",
            validate: notBlank("댓글을 입력해주세요."),
            maxLength: {
              value: COMMENT_BODY_MAX_LENGTH,
              message: `댓글은 ${COMMENT_BODY_MAX_LENGTH}자까지 입력할 수 있어요.`,
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

      {/* disabled variant는 비활성 스타일과 disabled 속성을 같이 붙인다 */}
      <Button type="submit" variant={isPending ? "disabled" : "primary"} className="self-start">
        {isPending ? "등록 중..." : "댓글 등록"}
      </Button>
    </form>
  );
}

export default CommentForm;
