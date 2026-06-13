begin;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('pending', 'inprogress', 'done', 'returns');
  end if;

  if not exists (select 1 from pg_type where typname = 'complaint_state') then
    create type public.complaint_state as enum ('pending', 'done');
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  phone text unique,
  password text,
  governorate text,
  city text,
  role text,
  location text,
  image text,
  "isBlocked" boolean not null default false,
  routes text,
  trader_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.delegates (
  id uuid primary key references public.users(id) on delete cascade,
  name text not null,
  phone text,
  image text,
  trader_id uuid references public.users(id) on delete set null,
  routes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  img text,
  created_at timestamptz not null default now()
);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  traderprice numeric not null default 0,
  "endPrice" numeric not null default 0,
  "onSale" boolean not null default false,
  sale numeric not null default 0,
  category_id uuid references public.categories(id) on delete set null,
  trader_id uuid references public.users(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  unit text,
  quantity_per_unit integer not null default 1,
  image text,
  state boolean not null default true,
  publish boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  trader_id uuid references public.users(id) on delete set null,
  delegator uuid references public.delegates(id) on delete set null,
  status public.order_status not null default 'pending',
  total numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null default 1,
  price numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  description text,
  state public.complaint_state not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  rate integer,
  feed_back text,
  "isPublished" boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public."UsersMessage" (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  sender_id uuid,
  receiver_id uuid,
  content text not null,
  sender_role text,
  receiver_role text,
  actual_sender_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists users_role_idx on public.users(role);
create index if not exists users_trader_id_idx on public.users(trader_id);
create index if not exists delegates_trader_id_idx on public.delegates(trader_id);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_trader_id_idx on public.products(trader_id);
create index if not exists products_company_id_idx on public.products(company_id);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_trader_id_idx on public.orders(trader_id);
create index if not exists orders_delegator_idx on public.orders(delegator);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);
create index if not exists complaints_user_id_idx on public.complaints(user_id);
create index if not exists testimonials_user_id_idx on public.testimonials(user_id);
create index if not exists users_message_conversation_idx on public."UsersMessage"(conversation_id, created_at);
create index if not exists users_message_receiver_unread_idx on public."UsersMessage"(receiver_id, read_at);

alter table public.users enable row level security;
alter table public.delegates enable row level security;
alter table public.companies enable row level security;
alter table public.categories enable row level security;
alter table public.units enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.complaints enable row level security;
alter table public.testimonials enable row level security;
alter table public."UsersMessage" enable row level security;

do $$
declare
  table_name text;
  policy_table text;
begin
  foreach table_name in array array[
    'users',
    'delegates',
    'companies',
    'categories',
    'units',
    'products',
    'orders',
    'order_items',
    'complaints',
    'testimonials',
    'UsersMessage'
  ]
  loop
    policy_table := case when table_name = 'UsersMessage' then '"UsersMessage"' else table_name end;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = table_name || '_compat_select'
    ) then
      execute format(
        'create policy %I on public.%s for select to anon, authenticated using (true)',
        table_name || '_compat_select',
        policy_table
      );
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = table_name || '_compat_insert'
    ) then
      execute format(
        'create policy %I on public.%s for insert to anon, authenticated with check (true)',
        table_name || '_compat_insert',
        policy_table
      );
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = table_name || '_compat_update'
    ) then
      execute format(
        'create policy %I on public.%s for update to anon, authenticated using (true) with check (true)',
        table_name || '_compat_update',
        policy_table
      );
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = table_name || '_compat_delete'
    ) then
      execute format(
        'create policy %I on public.%s for delete to anon, authenticated using (true)',
        table_name || '_compat_delete',
        policy_table
      );
    end if;
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values
  ('users', 'users', true),
  ('delegates', 'delegates', true),
  ('products', 'products', true),
  ('categories', 'categories', true),
  ('companies', 'companies', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'marketly_public_bucket_read'
  ) then
    create policy marketly_public_bucket_read
    on storage.objects
    for select
    to anon, authenticated
    using (bucket_id in ('users', 'delegates', 'products', 'categories', 'companies'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'marketly_public_bucket_insert'
  ) then
    create policy marketly_public_bucket_insert
    on storage.objects
    for insert
    to anon, authenticated
    with check (bucket_id in ('users', 'delegates', 'products', 'categories', 'companies'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'marketly_public_bucket_update'
  ) then
    create policy marketly_public_bucket_update
    on storage.objects
    for update
    to anon, authenticated
    using (bucket_id in ('users', 'delegates', 'products', 'categories', 'companies'))
    with check (bucket_id in ('users', 'delegates', 'products', 'categories', 'companies'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'marketly_public_bucket_delete'
  ) then
    create policy marketly_public_bucket_delete
    on storage.objects
    for delete
    to anon, authenticated
    using (bucket_id in ('users', 'delegates', 'products', 'categories', 'companies'));
  end if;
end $$;

do $$
begin
  alter publication supabase_realtime add table public."UsersMessage";
exception
  when duplicate_object then null;
  when undefined_object then
    raise notice 'supabase_realtime publication does not exist yet; enable Realtime from the Supabase Dashboard if needed.';
end $$;

commit;
