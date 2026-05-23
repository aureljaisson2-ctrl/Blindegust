create extension if not exists pgcrypto;

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_key text not null,
  status text not null default 'lobby',
  current_round int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade not null,
  name text not null,
  score int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade not null,
  number int not null,
  status text not null default 'open',
  correct_answer text default '',
  created_at timestamptz not null default now(),
  unique(game_id, number)
);

create table if not exists guesses (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references rounds(id) on delete cascade not null,
  player_id uuid references players(id) on delete cascade not null,
  answer text not null,
  points int not null default 0,
  created_at timestamptz not null default now(),
  unique(round_id, player_id)
);

alter table games enable row level security;
alter table players enable row level security;
alter table rounds enable row level security;
alter table guesses enable row level security;

create policy "demo read games" on games for select using (true);
create policy "demo insert games" on games for insert with check (true);
create policy "demo update games" on games for update using (true);

create policy "demo read players" on players for select using (true);
create policy "demo insert players" on players for insert with check (true);
create policy "demo update players" on players for update using (true);

create policy "demo read rounds" on rounds for select using (true);
create policy "demo insert rounds" on rounds for insert with check (true);
create policy "demo update rounds" on rounds for update using (true);

create policy "demo read guesses" on guesses for select using (true);
create policy "demo insert guesses" on guesses for insert with check (true);
create policy "demo update guesses" on guesses for update using (true);

alter publication supabase_realtime add table games;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table rounds;
alter publication supabase_realtime add table guesses;
