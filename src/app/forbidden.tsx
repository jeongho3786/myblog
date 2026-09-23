import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import Button from "@/components/ui/button";

// forbidden() 호출 시 403 상태 코드와 함께 렌더링되는 화면
const Forbidden = () => {
  return (
    <main className="w-full px-5 pt-8 pb-14 sm:min-w-160 sm:px-14 sm:pt-14 sm:pb-25 min-[1120px]:w-2/3">
      <div className="mb-14">
        <div className="mb-5 text-sm font-medium tracking-label text-primary">
          {"// 403"}
        </div>

        <h1 className="mb-5 text-5xl font-bold tracking-tight text-foreground">
          FORBIDDEN
        </h1>

        <div className="text-sm tracking-wide text-muted">
          이 페이지에 접근할 권한이 없습니다.
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* 다른 계정으로 다시 로그인할 수 있도록 로그아웃도 제공 */}
        <form action={signOut}>
          <Button type="submit" variant="secondary">
            로그아웃
          </Button>
        </form>

        <Link
          href="/"
          className="text-sm tracking-wide text-muted underline underline-offset-4 hover:text-foreground"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
};

export default Forbidden;
