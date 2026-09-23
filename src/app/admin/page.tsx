import { getCurrentUser, verifyAdmin } from "@/lib/dal";
import { signInWithGoogle, signOut } from "@/lib/actions/auth";
import Button from "@/components/ui/button";

const ERROR_MESSAGES: Record<string, string> = {
  signin: "로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  callback: "로그인 처리 중 문제가 생겼습니다. 다시 시도해 주세요.",
};

const AdminPage = async ({ searchParams }: PageProps<"/admin">) => {
  const { error } = await searchParams;
  const errorMessage = typeof error === "string" ? ERROR_MESSAGES[error] : undefined;

  const user = await getCurrentUser();

  // 로그인 안 했으면 403 대신 로그인 버튼을 보여준다 (그래야 어드민 본인도 들어올 수 있다)
  if (!user) {
    return (
      <main className="w-full px-5 pt-8 pb-14 sm:min-w-160 sm:px-14 sm:pt-14 sm:pb-25 min-[1120px]:w-2/3">
        <AdminHeader />

        {errorMessage && (
          <p className="mb-5 text-sm text-primary">{errorMessage}</p>
        )}

        <form action={signInWithGoogle}>
          <Button type="submit">Google로 로그인</Button>
        </form>
      </main>
    );
  }

  // 로그인은 했지만 어드민이 아니면 여기서 403으로 중단된다
  const admin = await verifyAdmin();

  return (
    <main className="w-full px-5 pt-8 pb-14 sm:min-w-160 sm:px-14 sm:pt-14 sm:pb-25 min-[1120px]:w-2/3">
      <AdminHeader />

      {/* 3단계에서 카테고리 관리 화면이 들어올 자리 */}
      <div className="flex items-center justify-between gap-5">
        <div className="text-sm text-muted">{admin.email}</div>

        <form action={signOut}>
          <Button type="submit" variant="secondary">
            로그아웃
          </Button>
        </form>
      </div>
    </main>
  );
};

const AdminHeader = () => (
  <div className="mb-14">
    <div className="mb-5 text-sm font-medium tracking-label text-primary">
      {"// ADMIN"}
    </div>

    <h1 className="text-5xl font-bold tracking-tight text-foreground">ADMIN</h1>
  </div>
);

export default AdminPage;
