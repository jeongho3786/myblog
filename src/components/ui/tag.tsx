import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const tagVariants = cva(
  "inline-flex items-center px-2.5 py-1.25 text-2xs font-medium tracking-wide border",
  {
    variants: {
      variant: {
        default: "border-border-muted bg-transparent text-muted",
        outline: "border-primary bg-transparent text-primary",
        filled: "border-transparent bg-primary text-surface",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface TagProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {}

const Tag = ({ variant, className, ...props }: TagProps) => {
  return <span className={cn(tagVariants({ variant }), className)} {...props} />;
};

export default Tag;
