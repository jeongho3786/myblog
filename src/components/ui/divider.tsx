import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const dividerVariants = cva("w-full border-0 border-t", {
  variants: {
    variant: {
      rule: "border-t-2 border-foreground",
      divider: "border-border",
      dotted: "border-dotted border-border",
    },
  },
  defaultVariants: {
    variant: "divider",
  },
});

interface DividerProps
  extends HTMLAttributes<HTMLHRElement>,
    VariantProps<typeof dividerVariants> {}

const Divider = ({ variant, className, ...props }: DividerProps) => {
  return <hr className={dividerVariants({ variant, className })} {...props} />;
};

export default Divider;
