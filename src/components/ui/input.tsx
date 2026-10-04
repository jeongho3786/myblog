import { forwardRef, type InputHTMLAttributes } from "react";
import { cva } from "class-variance-authority";

const inputVariants = cva(
  "w-full border border-border bg-transparent px-4 py-3 text-md text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary aria-invalid:border-accent-alt",
);

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input ref={ref} className={inputVariants({ className })} {...props} />
    );
  },
);

Input.displayName = "Input";

export default Input;
