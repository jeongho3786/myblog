import { type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center border px-4 py-2 text-sm tracking-wide transition-colors disabled:cursor-not-allowed disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "border-primary bg-primary text-surface hover:bg-primary/90 active:bg-primary/80",
        secondary:
          "border-border bg-transparent text-foreground hover:bg-border/15 active:bg-border/25",
        text: "border-transparent bg-transparent text-foreground hover:bg-border/10 active:bg-border/20",
        disabled: "border-border-muted bg-disabled-bg text-code-tab",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = ({ variant, className, disabled, ...props }: ButtonProps) => {
  return (
    <button
      className={buttonVariants({ variant, className })}
      disabled={disabled || variant === "disabled"}
      {...props}
    />
  );
};

export default Button;
