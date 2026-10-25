-- =====================================================================
-- COMPARTMENT — Complete Production Database Schema
-- Aligned with Hackathon Specification
-- =====================================================================

create extension if not exists "pgcrypto";

-- Drop existing tables to recreate with clean COMPARTMENT constraints
drop table if exists public.activity_attempts cascade;
drop table if exists public.user_achievements cascade;
drop table if exists public.appeals cascade;
drop table if exists public.restrictions cascade;
drop table if exists public.score_events cascade;
drop table if exists public.qr_tokens cascade;
drop table if exists public.reports cascade;
drop table if exists public.blocks cascade;
drop table if exists public.ratings cascade;
drop table if exists public.messages cascade;
drop table if exists public.room_members cascade;
drop table if exists public.rooms cascade;
drop table if exists public.match_suggestions cascade;
drop table if exists public.journey_participants cascade;
drop table if exists public.boarding_passes cascade;
drop table if exists public.journeys cascade;
drop table if exists public.profiles cascade;
drop table if exists public.groups cascade;
drop table if exists public.group_members cascade;
drop table if exists public.conversations cascade;

-- ---------------------------------------------------------------------
-- 1. Journeys
-- ---------------------------------------------------------------------
create table public.journeys (
  id                          uuid primary key default gen_random_uuid(),
  code                        text not null unique,
  name                        text not null,
  starts_at                   timestamptz not null default now(),
  ends_at                     timestamptz not null,
  status                      text not null default 'active' check (status in ('scheduled','active','ended')),
  ended_at                    timestamptz,
  allow_unverified_demo_claims boolean not null default true,
  created_at                  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. Boarding Passes
-- ---------------------------------------------------------------------
create table public.boarding_passes (
  id                  uuid primary key default gen_random_uuid(),
  journey_id          uuid not null references public.journeys(id) on delete cascade,
  code_hash           text not null unique,
  display_name_hint   text,
  status              text not null default 'available' check (status in ('available','redeemed','expired','revoked')),
  verification_source text not null default 'organizer_allowlist' check (verification_source in ('organizer_allowlist','unverified_first_claim')),
  expires_at          timestamptz not null,
  redeemed_by         uuid references auth.users(id),
  claimed_at          timestamptz,
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. Profiles (Permanent Passenger Identity)
-- ---------------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text not null,
  handle              text not null,
  display_name        text not null,
  avatar              text not null default 'Window Gazer',
  conversation_goal   text not null default 'Meaningful conversations',
  interests           text[] not null default '{}',
  bio                 text not null default '',
  language            text not null default 'en',
  reputation_points   integer not null default 0 check (reputation_points <= 100),
  chats_banned_at     timestamptz,
  ban_reason          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create unique index profiles_handle_lower_idx on public.profiles (lower(handle));
create unique index profiles_email_lower_idx  on public.profiles (lower(email));

-- ---------------------------------------------------------------------
-- 4. Journey Participants
-- ---------------------------------------------------------------------
create table public.journey_participants (
  id                  uuid primary key default gen_random_uuid(),
  journey_id          uuid not null references public.journeys(id) on delete cascade,
  user_id             uuid not null references public.profiles(id) on delete cascade,
  joined_at           timestamptz not null default now(),
  left_at             timestamptz,
  status              text not null default 'active' check (status in ('active','left','removed')),
  is_discoverable     boolean not null default true,
  availability_status text not null default 'open_to_chat',
  verification_source text not null default 'organizer_allowlist',
  coach_label         text not null default 'Coach B',
  unique (journey_id, user_id)
);

create index journey_participants_journey_idx on public.journey_participants (journey_id);
create index journey_participants_user_idx    on public.journey_participants (user_id);

-- ---------------------------------------------------------------------
-- 5. Rooms & Room Members
-- ---------------------------------------------------------------------
create table public.rooms (
  id         uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  type       text not null check (type in ('lounge','private')),
  status     text not null default 'active' check (status in ('active','locked','expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.room_members (
  room_id   uuid not null references public.rooms(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

-- Exactly one lounge per journey
create unique index rooms_one_lounge_per_journey on public.rooms (journey_id) where type = 'lounge';

-- ---------------------------------------------------------------------
-- 6. Match Suggestions
-- ---------------------------------------------------------------------
create table public.match_suggestions (
  id               uuid primary key default gen_random_uuid(),
  journey_id       uuid not null references public.journeys(id) on delete cascade,
  user_a_id        uuid not null references public.profiles(id) on delete cascade,
  user_b_id        uuid not null references public.profiles(id) on delete cascade,
  match_score      numeric not null default 0,
  match_reason     text not null default '',
  icebreaker       text not null default '',
  source           text not null default 'deterministic_fallback' check (source in ('ai_gemini','deterministic_fallback','manual_wave')),
  user_a_response  text not null default 'pending' check (user_a_response in ('pending','accepted','declined')),
  user_b_response  text not null default 'pending' check (user_b_response in ('pending','accepted','declined')),
  status           text not null default 'pending' check (status in ('pending','mutual_accepted','declined','expired','blocked')),
  room_id          uuid references public.rooms(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  responded_at     timestamptz
);

create unique index match_suggestions_pair_unique on public.match_suggestions (journey_id, least(user_a_id, user_b_id), greatest(user_a_id, user_b_id));

-- ---------------------------------------------------------------------
-- 7. Messages
-- ---------------------------------------------------------------------
create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  room_id    uuid not null references public.rooms(id) on delete cascade,
  sender_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

create index messages_room_created_idx on public.messages (room_id, created_at);

-- ---------------------------------------------------------------------
-- 8. Ratings & Reputation
-- ---------------------------------------------------------------------
create table public.ratings (
  id            uuid primary key default gen_random_uuid(),
  journey_id    uuid not null references public.journeys(id) on delete cascade,
  room_id       uuid not null references public.rooms(id) on delete cascade,
  rater_id      uuid not null references public.profiles(id) on delete cascade,
  rated_user_id uuid not null references public.profiles(id) on delete cascade,
  rating_type   text not null check (rating_type in ('GOOD','BAD')),
  points_delta  integer not null check (points_delta in (2, -2)),
  created_at    timestamptz not null default now(),
  unique (journey_id, rater_id, rated_user_id),
  check (rater_id <> rated_user_id)
);

create index ratings_rated_journey_idx on public.ratings (rated_user_id, journey_id);

-- ---------------------------------------------------------------------
-- 9. Safety: Blocks & Reports
-- ---------------------------------------------------------------------
create table public.blocks (
  id         uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  reason     text not null default 'user_block',
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.reports (
  id               uuid primary key default gen_random_uuid(),
  journey_id       uuid references public.journeys(id) on delete set null,
  room_id          uuid references public.rooms(id) on delete set null,
  reporter_id      uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  category         text not null,
  details          text not null,
  status           text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 10. Games & Activities Persistence
-- ---------------------------------------------------------------------
create table public.activity_attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  activity_id   text not null,
  score         integer not null,
  max_score     integer not null,
  points_earned integer not null,
  completed_at  timestamptz not null default now()
);

create table public.user_achievements (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_key)
);

-- ---------------------------------------------------------------------
-- Row Level Security (RLS)
-- ---------------------------------------------------------------------
alter table public.journeys            enable row level security;
alter table public.boarding_passes     enable row level security;
alter table public.profiles            enable row level security;
alter table public.journey_participants enable row level security;
alter table public.rooms               enable row level security;
alter table public.room_members        enable row level security;
alter table public.match_suggestions   enable row level security;
alter table public.messages            enable row level security;
alter table public.ratings             enable row level security;
alter table public.blocks              enable row level security;
alter table public.reports             enable row level security;
alter table public.activity_attempts   enable row level security;
alter table public.user_achievements   enable row level security;

-- Policies
create policy "Public journeys view" on public.journeys for select using (true);
create policy "Public profiles view" on public.profiles for select using (true);
create policy "Public participants view" on public.journey_participants for select using (true);
create policy "Allow read rooms for members" on public.rooms for select using (
  type = 'lounge' or id in (select room_id from public.room_members where user_id = auth.uid())
);
create policy "Allow read messages for members" on public.messages for select using (
  room_id in (
    select id from public.rooms where type = 'lounge'
    union
    select room_id from public.room_members where user_id = auth.uid()
  )
);
create policy "Allow read matches for participants" on public.match_suggestions for select using (
  user_a_id = auth.uid() or user_b_id = auth.uid()
);
create policy "Allow read blocks for owner" on public.blocks for select using (
  blocker_id = auth.uid()
);
