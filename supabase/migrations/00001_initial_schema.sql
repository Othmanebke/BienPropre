-- ============================================================
-- BienPropre — Initial Schema
-- ============================================================

-- ------------------------------------
-- Extensions
-- ------------------------------------
create extension if not exists "uuid-ossp";

-- ------------------------------------
-- ENUM: order status
-- ------------------------------------
create type order_status as enum ('pending', 'paid', 'failed', 'shipped');

-- ------------------------------------
-- Helper: updated_at trigger function
-- ------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- TABLE: profiles
-- ============================================================
create table if not exists profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  email       text        not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create profile row on new auth user signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ------------------------------------
-- RLS: profiles
-- ------------------------------------
alter table profiles enable row level security;

create policy "profiles: owner can read own row"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles: owner can update own row"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- TABLE: products
-- ============================================================
create table if not exists products (
  id              uuid        primary key default uuid_generate_v4(),
  name            text        not null,
  description     text,
  base_price      numeric(10, 2) not null check (base_price >= 0),
  is_customizable boolean     not null default false,
  image_url       text,
  created_at      timestamptz not null default now()
);

-- ------------------------------------
-- RLS: products (public read, admin write)
-- ------------------------------------
alter table products enable row level security;

create policy "products: anyone can read"
  on products for select
  using (true);

-- Admin mutations are performed via service-role key (bypasses RLS).

-- ============================================================
-- TABLE: orders
-- ============================================================
create table if not exists orders (
  id                uuid         primary key default uuid_generate_v4(),
  user_id           uuid         references profiles (id) on delete set null,
  stripe_session_id text         unique,
  status            order_status not null default 'pending',
  total_amount      numeric(10, 2) not null check (total_amount >= 0),
  shipping_address  jsonb,
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now()
);

create trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

create index idx_orders_user_id          on orders (user_id);
create index idx_orders_stripe_session   on orders (stripe_session_id);
create index idx_orders_status           on orders (status);

-- ------------------------------------
-- RLS: orders
-- ------------------------------------
alter table orders enable row level security;

create policy "orders: owner can read own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "orders: owner can insert own orders"
  on orders for insert
  with check (auth.uid() = user_id or user_id is null);

-- Status updates (pending → paid / failed / shipped) are performed
-- exclusively via service-role key in Edge Functions / webhooks.

-- ============================================================
-- TABLE: order_items
-- ============================================================
create table if not exists order_items (
  id                  uuid           primary key default uuid_generate_v4(),
  order_id            uuid           not null references orders (id) on delete cascade,
  product_id          uuid           not null references products (id) on delete restrict,
  quantity            integer        not null check (quantity > 0),
  size                text           not null,
  color               text           not null,
  custom_text         text,
  custom_image_url    text,
  price_at_purchase   numeric(10, 2) not null check (price_at_purchase >= 0)
);

create index idx_order_items_order_id on order_items (order_id);

-- ------------------------------------
-- RLS: order_items
-- ------------------------------------
alter table order_items enable row level security;

create policy "order_items: owner can read own items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "order_items: owner can insert for own order"
  on order_items for insert
  with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or orders.user_id is null)
    )
  );
