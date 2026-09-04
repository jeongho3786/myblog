import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

const components: MDXComponents = {
  figure: ({ className, ...props }: ComponentProps<"figure">) => (
    <figure
      className={`border border-code-border bg-code-bg text-code-text ${className ?? ""}`}
      {...props}
    />
  ),
  figcaption: ({ className, ...props }: ComponentProps<"figcaption">) => (
    <figcaption
      className={`border-b border-code-border px-4 py-2 font-mono text-xs text-code-tab ${className ?? ""}`}
      {...props}
    />
  ),
  pre: ({ className, ...props }: ComponentProps<"pre">) => (
    <pre
      className={`overflow-x-auto p-4 font-mono text-md leading-relaxed ${className ?? ""}`}
      {...props}
    />
  ),
};

export const useMDXComponents = (): MDXComponents => {
  return components;
};
