import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  experimental: {
    // 어드민이 아닌 사용자에게 forbidden()으로 403 페이지를 보여주기 위해 필요
    authInterrupts: true,
  },
};

const withMDX = createMDX({
  options: {
    rehypePlugins: [
      [
        "rehype-pretty-code",
        {
          theme: "github-dark",
          keepBackground: false,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
