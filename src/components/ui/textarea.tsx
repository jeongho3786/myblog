import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cva } from "class-variance-authority";

// Input과 같은 스펙(테두리·여백·폰트·포커스)에 여러 줄 입력용 설정만 더한 것. 세로로만 크기 조절 가능.
const textareaVariants = cva(
  "w-full resize-y border border-border bg-transparent px-4 py-3 text-md leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary aria-invalid:border-accent-alt",
);

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={textareaVariants({ className })}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
