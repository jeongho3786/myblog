import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";
import Divider from "@/components/ui/divider";

const components: MDXComponents = {
  h1: ({ className, ...props }: ComponentProps<"h1">) => (
    <h1
      className={`mt-0 mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl ${className ?? ""}`}
      {...props}
    />
  ),
  h2: ({ className, ...props }: ComponentProps<"h2">) => (
    <h2
      className={`mt-10 mb-4 text-2xl font-bold tracking-tight text-foreground ${className ?? ""}`}
      {...props}
    />
  ),
  h3: ({ className, ...props }: ComponentProps<"h3">) => (
    <h3
      className={`mt-8 mb-3 text-xl font-semibold text-foreground ${className ?? ""}`}
      {...props}
    />
  ),
  p: ({ className, ...props }: ComponentProps<"p">) => (
    <p
      className={`mb-5 text-base text-foreground-secondary md:text-lg ${className ?? ""}`}
      {...props}
    />
  ),
  a: ({ className, ...props }: ComponentProps<"a">) => (
    <a
      className={`text-primary underline underline-offset-2 ${className ?? ""}`}
      {...props}
    />
  ),
  ul: ({ className, ...props }: ComponentProps<"ul">) => (
    <ul
      className={`mb-5 list-outside list-disc pl-6 text-base text-foreground-secondary md:text-lg ${className ?? ""}`}
      {...props}
    />
  ),
  ol: ({ className, ...props }: ComponentProps<"ol">) => (
    <ol
      className={`mb-5 list-outside list-decimal pl-6 text-base text-foreground-secondary md:text-lg ${className ?? ""}`}
      {...props}
    />
  ),
  li: ({ className, ...props }: ComponentProps<"li">) => (
    <li className={`mb-1 ${className ?? ""}`} {...props} />
  ),
  strong: ({ className, ...props }: ComponentProps<"strong">) => (
    <strong className={`font-bold text-foreground ${className ?? ""}`} {...props} />
  ),
  blockquote: ({ className, ...props }: ComponentProps<"blockquote">) => (
    <blockquote
      className={`mb-5 border-l-2 border-primary pl-4 text-base text-foreground italic md:text-lg ${className ?? ""}`}
      {...props}
    />
  ),
  hr: ({ className, ...props }: ComponentProps<"hr">) => (
    <Divider className={`my-10 ${className ?? ""}`} {...props} />
  ),
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
