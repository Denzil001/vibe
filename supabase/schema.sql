-- =====================================================================
-- VIBE — AI for Humanity : Complete Production Supabase Schema
-- Project: https://ctkdkenofjxmclptdcoe.supabase.co
--
-- Run this in your Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/ctkdkenofjxmclptdcoe/sql
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  email                  text not null,
  username               text not null,
  username_updated_at    timestamptz,
  display_name           text not null,
  avatar_url             text not null default '',
  bio                    text not null default '',
  interests              text[] not null default '{}',
  skills_to_share        text[] not null default '{}',
  skills_to_learn        text[] not null default '{}',
  learning_goals         text[] not null default '{}',
  conversation_topics    text[] not null default '{}',
  languages              text[] not null default '{}',
  discovery_opt_in       boolean not null default true,
  profile_visibility     text not null default 'journey_only'
                           check (profile_visibility in ('public','journey_only','private')),
  role                   text not null default 'passenger'
                           check (role in ('passenger','moderator','admin')),
  points                 integer not null default 50,
  base_score             integer not null default 100,
  reputation_score       integer not null default 100,
  is_restricted          boolean not null default false,
  restriction_expires_at timestamptz,
  restriction_reason     text,
  badges                 text[] not null default '{}',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));
create unique index if not exists profiles_email_lower_idx    on public.profiles (lower(email));

-- ---------------------------------------------------------------------
-- 2. Journeys (Train Rides & Discovery Cohorts)
-- ---------------------------------------------------------------------
create table if not exists public.journeys (
  id                  text primary key,
  user_id             uuid not null references public.profiles(id) on delete cascade,
  train_number        text not null,
  train_name          text not null default '',
  travel_date         date not null,
  boarding_station    text not null,
  destination_station text not null,
  duration_hours      numeric,
  discovery_enabled   boolean not null default true,
  conversation_goals  text[] not null default '{}',
  status              text not null default 'upcoming'
                        check (status in ('upcoming','active','completed')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists journeys_user_idx  on public.journeys (user_id);
create index if not exists journeys_train_idx on public.journeys (train_number, travel_date);

-- ---------------------------------------------------------------------
-- 3. Groups & Communities
-- ---------------------------------------------------------------------
create table if not exists public.groups (
  id           text primary key,
  name         text not null,
  description  text not null default '',
  train_number text,
  category     text not null default 'Tech & Innovation',
  rules        text[] not null default '{}',
  created_by   uuid references public.profiles(id) on delete set null,
  member_count integer not null default 1,
  created_at   timestamptz not null default now()
);

create table if not exists public.group_members (
  id        text primary key,
  group_id  text not null references public.groups(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  role      text not null default 'member' check (role in ('member','moderator','admin')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create index if not exists group_members_user_idx on public.group_members (user_id);
create index if not exists group_members_grp_idx  on public.group_members (group_id);

-- ---------------------------------------------------------------------
-- 4. Conversations (1-to-1 Direct Messages)
-- ---------------------------------------------------------------------
create table if not exists public.conversations (
  id               text primary key,
  participant_ids  uuid[] not null,
  last_message     text,
  last_message_at  timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists conversations_participants_idx on public.conversations using gin (participant_ids);

-- ---------------------------------------------------------------------
-- 5. Messages (Group & Direct Messages)
-- ---------------------------------------------------------------------
create table if not exists public.messages (
  id              text primary key,
  conversation_id text references public.conversations(id) on delete cascade,
  group_id        text references public.groups(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  sender_name     text not null,
  sender_avatar   text not null default '',
  content         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
create index if not exists messages_group_idx        on public.messages (group_id, created_at);

-- ---------------------------------------------------------------------
-- 6. Two-Way Blocks & Safety Reports
-- ---------------------------------------------------------------------
create table if not exists public.blocks (
  id         text primary key,
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);

create index if not exists blocks_blocker_idx on public.blocks (blocker_id);
create index if not exists blocks_blocked_idx on public.blocks (blocked_id);

create table if not exists public.reports (
  id                  text primary key,
  reporter_id         uuid not null references public.profiles(id) on delete cascade,
  reported_user_id    uuid references public.profiles(id) on delete set null,
  reported_group_id   text references public.groups(id) on delete set null,
  reported_message_id text references public.messages(id) on delete set null,
  category            text not null,
  reason              text not null,
  status              text not null default 'pending'
                        check (status in ('pending','under_review','resolved','dismissed')),
  notes               text,
  moderator_id        uuid references public.profiles(id) on delete set null,
  resolution_action   text,
  resolved_at         timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists reports_status_idx on public.reports (status);

-- ---------------------------------------------------------------------
-- 7. QR Tokens & Onboarding Passes
-- ---------------------------------------------------------------------
create table if not exists public.qr_tokens (
  id         text primary key,
  token      text not null unique,
  type       text not null default 'public_entry'
               check (type in ('public_entry','journey_join','group_join')),
  target_id  text,
  label      text,
  expires_at timestamptz not null,
  is_revoked boolean not null default false,
  max_uses   integer default 500,
  used_count integer not null default 0,
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists qr_tokens_token_idx on public.qr_tokens (token);

-- Seed Default QR Demo Passes
insert into public.qr_tokens (id, token, type, label, expires_at, is_revoked, max_uses, used_count, created_at)
values
  ('qrt_public_1', 'vibe_onboard_public_welcome', 'public_entry', 'VIBE Community General Onboarding', now() + interval '90 days', false, 10000, 42, now()),
  ('qrt_journey_12951', 'vibe_jrn_12951_rajdhani', 'journey_join', 'Mumbai Rajdhani (12951) Passenger Coach B4', now() + interval '30 days', false, 500, 18, now()),
  ('qrt_group_grp1', 'vibe_grp_tech_startups', 'group_join', 'Tech & Startups Cohort (12951)', now() + interval '30 days', false, 200, 12, now())
on conflict (token) do nothing;

-- ---------------------------------------------------------------------
-- 8. Score Events (+2/-2 Reputation Ledger with Anti-Brigade Rules)
-- ---------------------------------------------------------------------
create table if not exists public.score_events (
  id              text primary key,
  journey_id      text not null,
  voter_user_id   uuid not null references public.profiles(id) on delete cascade,
  target_user_id  uuid not null references public.profiles(id) on delete cascade,
  vote_type       text not null check (vote_type in ('positive','negative')),
  point_delta     integer not null check (point_delta in (2, -2)),
  reason_category text,
  status          text not null default 'active' check (status in ('active','reversed')),
  reversal_reason text,
  reversal_by     uuid references public.profiles(id) on delete set null,
  reversed_by     uuid references public.profiles(id) on delete set null,
  reversed_at     timestamptz,
  created_at      timestamptz not null default now()
);

create unique index if not exists score_events_voter_target_journey_unique
  on public.score_events (voter_user_id, target_user_id, journey_id) where status = 'active';

create index if not exists score_events_target_idx on public.score_events (target_user_id, journey_id);

-- ---------------------------------------------------------------------
-- 9. Restrictions (<90 Threshold) & Moderator Appeals
-- ---------------------------------------------------------------------
create table if not exists public.restrictions (
  id             text primary key,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  trigger_score  integer not null,
  started_at     timestamptz not null default now(),
  expires_at     timestamptz not null,
  reason         text not null,
  policy_version text not null default 'v1.0-mvp-24h',
  status         text not null default 'active'
                   check (status in ('active','expired','appealed','lifted')),
  appeal_id      text
);

create index if not exists restrictions_user_idx on public.restrictions (user_id);

create table if not exists public.appeals (
  id               text primary key,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  username         text,
  restriction_id   text,
  score_event_id   text,
  user_explanation text not null,
  status           text not null default 'pending'
                     check (status in ('pending','approved','rejected')),
  decision_notes   text,
  moderator_id     uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  resolved_at      timestamptz
);

create index if not exists appeals_user_idx   on public.appeals (user_id);
create index if not exists appeals_status_idx on public.appeals (status);

-- ---------------------------------------------------------------------
-- 10. Educational Activities & Achievements
-- ---------------------------------------------------------------------
create table if not exists public.activity_attempts (
  id            text primary key,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  activity_id   text not null,
  score         integer not null,
  max_score     integer not null,
  points_earned integer not null,
  completed_at  timestamptz not null default now()
);

create table if not exists public.user_achievements (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_key)
);

-- ---------------------------------------------------------------------
-- 11. Row Level Security (RLS)
-- ---------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.journeys          enable row level security;
alter table public.groups            enable row level security;
alter table public.group_members     enable row level security;
alter table public.conversations     enable row level security;
alter table public.messages          enable row level security;
alter table public.blocks            enable row level security;
alter table public.reports           enable row level security;
alter table public.score_events      enable row level security;
alter table public.restrictions      enable row level security;
alter table public.appeals           enable row level security;
alter table public.qr_tokens         enable row level security;
alter table public.activity_attempts enable row level security;
alter table public.user_achievements enable row level security;

-- Authenticated Read Policies
create policy "Allow read profiles" on public.profiles for select using (true);
create policy "Allow read journeys" on public.journeys for select using (true);
create policy "Allow read groups" on public.groups for select using (true);
create policy "Allow read group_members" on public.group_members for select using (true);
create policy "Allow read conversations" on public.conversations for select using (true);
create policy "Allow read messages" on public.messages for select using (true);
create policy "Allow read blocks" on public.blocks for select using (true);
create policy "Allow read reports" on public.reports for select using (true);
create policy "Allow read score_events" on public.score_events for select using (true);
create policy "Allow read qr_tokens" on public.qr_tokens for select using (true);
create policy "Allow read activity_attempts" on public.activity_attempts for select using (true);
create policy "Allow read user_achievements" on public.user_achievements for select using (true);
create policy "Allow read restrictions" on public.restrictions for select using (true);
create policy "Allow read appeals" on public.appeals for select using (true);
