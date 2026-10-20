-- LOVORA by Sisirey: initial Supabase schema
-- Run in Supabase SQL Editor. Review policies before production launch.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'My surprise',
  slug text unique,
  experience_type text not null default 'birthday',
  status text not null default 'draft' check (status in ('draft','published')),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_slug_idx on public.projects(slug);
alter table public.projects enable row level security;
drop policy if exists "Owners can read their projects" on public.projects;
create policy "Owners can read their projects" on public.projects for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Owners can create projects" on public.projects;
create policy "Owners can create projects" on public.projects for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Owners can update projects" on public.projects;
create policy "Owners can update projects" on public.projects for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Owners can delete projects" on public.projects;
create policy "Owners can delete projects" on public.projects for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.audio_tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null check (kind in ('music','effect')),
  category text not null default 'general',
  storage_path text,
  public_url text,
  enabled boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);
alter table public.audio_tracks enable row level security;
drop policy if exists "Anyone can read enabled audio tracks" on public.audio_tracks;
create policy "Anyone can read enabled audio tracks" on public.audio_tracks for select to anon, authenticated using (enabled = true);
-- Admin write access is intentionally not granted here. Configure a server-side
-- admin role/RPC or restrictive RLS policies for your own admin identity before
-- using uploads in production. Never rely on a VITE_ variable as authorization.

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default 'true'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
drop policy if exists "Anyone can read public site settings" on public.site_settings;
create policy "Anyone can read public site settings" on public.site_settings for select to anon, authenticated using (key in ('music_enabled','effects_enabled','vibration_enabled'));
-- Restrict writes to trusted server-side admin tooling in production.

-- Public celebration reads: recipients can view only published projects.
drop policy if exists "Anyone can view published projects" on public.projects;
create policy "Anyone can view published projects" on public.projects for select to anon using (status = 'published');

-- Audio Storage bucket (public URLs are needed for public celebration playback).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lovora-audio','lovora-audio',true, 15728640, array['audio/mpeg','audio/mp3','audio/wav','audio/ogg','audio/mp4','audio/aac','audio/x-m4a'])
on conflict (id) do nothing;

-- NOTE: Storage upload/delete policies are not automatically granted. Add
-- carefully scoped admin-only policies or use a server-side upload endpoint.
