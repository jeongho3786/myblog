import { getCurrentUser, verifyAdmin } from "@/lib/dal";
import { signInWithGoogle, signOut } from "@/lib/actions/auth";
import {
  buildCategoryTree,
  getAllCategories,
  MAX_CATEGORY_DEPTH,
  toCategoryOptions,
} from "@/lib/categories";
import Button from "@/components/ui/button";
import CategoryTree from "@/components/admin/category-tree";
import CategoryCreateForm from "@/components/admin/category-create-form";

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
  const categoryTree = buildCategoryTree(await getAllCategories());
  const categoryOptions = toCategoryOptions(categoryTree);

  return (
    <main className="w-full px-5 pt-8 pb-14 sm:min-w-160 sm:px-14 sm:pt-14 sm:pb-25 min-[1120px]:w-2/3">
      <AdminHeader />

      <div className="mb-14 flex items-center justify-between gap-5">
        <div className="text-sm text-muted">{admin.email}</div>

        <form action={signOut}>
          <Button type="submit" variant="secondary">
            로그아웃
          </Button>
        </form>
      </div>

      <section className="mb-14">
        <h2 className="mb-5 text-sm font-medium tracking-label text-primary">
          {"// CATEGORIES"}
        </h2>

        <CategoryTree nodes={categoryTree} options={categoryOptions} />
      </section>

      <section>
        <h2 className="mb-5 text-sm font-medium tracking-label text-primary">
          {"// NEW CATEGORY"}
        </h2>

        {/* 이미 최대 깊이인 폴더 아래에는 만들 수 없으므로 선택지에서 뺀다 (서버 액션에서도 다시 검사) */}
        <CategoryCreateForm
          parentOptions={categoryOptions.filter(
            (option) => option.depth < MAX_CATEGORY_DEPTH,
          )}
        />
      </section>
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
