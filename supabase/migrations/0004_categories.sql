-- 사이드바 트리에 쓰이는 카테고리(폴더) 테이블.
-- parent_id로 부모를 가리키는 방식으로 중첩을 표현한다 (parent_id가 null이면 최상위 폴더).
-- 글(MDX)은 metadata.category에 자기가 바로 속한 폴더의 slug 하나만 적고,
-- 상위 경로(dev / frontend / react)는 이 테이블의 parent_id를 따라 올라가며 계산한다.
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 40),
  slug text not null unique
    check (char_length(slug) between 1 and 40 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),

  -- 여러 단계에 걸친 순환(dev → react → frontend → dev)과 최대 깊이(3단계)는 서버 액션에서 검사한다.
  constraint categories_not_self_parent check (parent_id is null or parent_id <> id)
);

-- 같은 부모 아래에 같은 이름의 폴더가 두 개 생기지 않도록 막는다.
-- 일반 unique는 null끼리를 서로 다른 값으로 취급해서 최상위 폴더(parent_id = null)끼리는
-- 이름이 겹쳐도 통과되므로, nulls not distinct로 null도 같은 값으로 취급하게 한다 (Postgres 15+).
alter table public.categories
  add constraint categories_parent_name_unique unique nulls not distinct (parent_id, name);

-- 트리 조립과 "하위 폴더가 있는지" 확인할 때 parent_id로 조회하므로 인덱스를 둔다.
create index categories_parent_id_idx on public.categories (parent_id);
