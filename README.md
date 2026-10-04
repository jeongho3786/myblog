# jeong-ho blog

개인 기술 블로그입니다. 글은 MDX 파일로 쓰고, 카테고리 · 댓글 · 짧은 일기 같은 데이터는 Supabase에 저장합니다.
단색 배경 + 실선 테두리 디자인에, 한글 · 영문 · 코드를 고정폭 폰트(D2Coding) 하나로 통일했습니다.

## 기술 스택

| 분류 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router, Server Actions), React 19 |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4, class-variance-authority, tailwind-merge |
| 콘텐츠 | MDX (`@next/mdx`), Shiki · rehype-pretty-code |
| 폼 | react-hook-form |
| 백엔드 · DB | Supabase (Postgres, RLS, Auth — Google OAuth, pg_cron) |
| 배포 | Vercel |
| 패키지 매니저 | pnpm |
