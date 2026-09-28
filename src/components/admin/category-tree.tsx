import CategoryRow from "@/components/admin/category-row";
import {
  collectSubtreeIds,
  countSubtreeLevels,
  MAX_CATEGORY_DEPTH,
  type CategoryNode,
  type CategoryOption,
} from "@/lib/categories";

// 어드민 페이지의 카테고리 트리. 관리 화면이라 접기 없이 전부 펼쳐서 보여준다.
// 트리 구조는 서버에서 그리고, 이름 변경처럼 상호작용이 필요한 한 줄(CategoryRow)만 클라이언트 컴포넌트다.
const CategoryTree = ({
  nodes,
  options,
}: {
  nodes: CategoryNode[];
  options: CategoryOption[];
}) => {
  if (nodes.length === 0) {
    return <p className="text-sm text-muted">아직 카테고리가 없습니다.</p>;
  }

  return <CategoryList nodes={nodes} options={options} parentId={null} />;
};

const CategoryList = ({
  nodes,
  options,
  parentId,
}: {
  nodes: CategoryNode[];
  options: CategoryOption[];
  parentId: string | null;
}) => (
  <ul className="flex flex-col gap-0.5">
    {nodes.map((node, index) => (
      <li key={node.id}>
        <CategoryRow
          id={node.id}
          name={node.name}
          slug={node.slug}
          depth={node.depth}
          parentId={parentId}
          moveOptions={getMoveOptions(node, options)}
          isFirst={index === 0}
          isLast={index === nodes.length - 1}
          hasChildren={node.children.length > 0}
        />

        {node.children.length > 0 && (
          <div className="ml-2.25 border-l border-dotted border-border pl-3.5">
            <CategoryList nodes={node.children} options={options} parentId={node.id} />
          </div>
        )}
      </li>
    ))}
  </ul>
);

// 이 폴더를 옮길 수 있는 상위 폴더 목록 (서버 액션에서도 다시 검사한다)
// - 자기 자신과 하위 폴더는 뺀다 (순환)
// - 옮긴 뒤 가장 깊은 하위 폴더가 최대 깊이를 넘는 위치는 뺀다
const getMoveOptions = (node: CategoryNode, options: CategoryOption[]) => {
  const subtreeIds = new Set(collectSubtreeIds(node));
  const subtreeLevels = countSubtreeLevels(node);

  return options.filter(
    (option) =>
      !subtreeIds.has(option.id) &&
      option.depth + subtreeLevels <= MAX_CATEGORY_DEPTH,
  );
};

export default CategoryTree;
