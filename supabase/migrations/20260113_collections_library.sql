-- Migration: Collections and Library Features
-- 2026-01-13

-- 1. Collections Table (The Container)
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  is_public boolean default false,
  slug text, -- Friendly URL slug (optional, requires uniqueness logic in app)
  is_featured boolean default false, -- Admin curated flag
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Ensure slug is unique if present
  constraint collections_slug_key unique (slug)
);

-- 2. Collection Topics (Groups within a collection)
create table if not exists collection_topics (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references collections(id) on delete cascade not null,
  title text not null,
  description text,
  order_index integer default 0,
  created_at timestamptz default now()
);

-- 3. Collection Topic Scapes (Link scapes to topics)
create table if not exists collection_topic_scapes (
  topic_id uuid references collection_topics(id) on delete cascade not null,
  scape_id uuid references scapes(id) on delete cascade not null,
  order_index integer default 0,
  created_at timestamptz default now(),

  -- Composite PK to prevent adding same scape to same topic twice
  primary key (topic_id, scape_id)
);

-- Indexes for performance
create index idx_collections_user_id on collections(user_id);
create index idx_collections_is_public on collections(is_public);
create index idx_collection_topics_collection_id on collection_topics(collection_id);
create index idx_collection_topic_scapes_topic_id on collection_topic_scapes(topic_id);

-- Enable RLS
alter table collections enable row level security;
alter table collection_topics enable row level security;
alter table collection_topic_scapes enable row level security;

-- Policies --

-- Collections:
-- 1. Users can view their own collections
create policy "Users can view own private collections"
  on collections for select
  using (auth.uid() = user_id);

-- 2. Everyone can view public collections
create policy "Everyone can view public collections"
  on collections for select
  using (is_public = true);

-- 3. Users can insert their own collections
create policy "Users can create collections"
  on collections for insert
  with check (auth.uid() = user_id);

-- 4. Users can update their own collections
create policy "Users can update own collections"
  on collections for update
  using (auth.uid() = user_id);

-- 5. Users can delete their own collections
create policy "Users can delete own collections"
  on collections for delete
  using (auth.uid() = user_id);


-- Collection Topics (Inherit from Collection):
-- 1. View: If user can view the parent collection, they can view topics
-- (Note: PostgREST doesn't support joins in simple RLS, so we use exists)
create policy "Users can view topics of visible collections"
  on collection_topics for select
  using (
    exists (
      select 1 from collections c
      where c.id = collection_topics.collection_id
      and (c.is_public = true or c.user_id = auth.uid())
    )
  );

-- 2. Manage: Only owner of parent collection can modify topics
create policy "Users can manage topics of own collections"
  on collection_topics for all
  using (
    exists (
      select 1 from collections c
      where c.id = collection_topics.collection_id
      and c.user_id = auth.uid()
    )
  );


-- Collection Topic Scapes (Inherit from Topic -> Collection):
-- 1. View: If user can view the parent topic (and thus collection), they can view the link
create policy "Users can view scapes of visible topics"
  on collection_topic_scapes for select
  using (
    exists (
      select 1 from collection_topics t
      join collections c on c.id = t.collection_id
      where t.id = collection_topic_scapes.topic_id
      and (c.is_public = true or c.user_id = auth.uid())
    )
  );

-- 2. Manage: Only owner of parent collection can modify scape links
create policy "Users can manage scapes of own collections"
  on collection_topic_scapes for all
  using (
    exists (
      select 1 from collection_topics t
      join collections c on c.id = t.collection_id
      where t.id = collection_topic_scapes.topic_id
      and c.user_id = auth.uid()
    )
  );
