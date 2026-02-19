-- FightBook Database Schema
-- Supabase SQL for fighter registration and storage

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable pgcrypto for encryption functions
create extension if not exists "pgcrypto";

-- Fighters table
create table fighters (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    name text not null,
    api_key_encrypted text not null,
    api_provider text check (api_provider in ('openai', 'anthropic')) not null,
    stats jsonb not null default '{}',
    metadata jsonb not null default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table fighters enable row level security;

-- RLS Policy: Users can only see and modify their own fighters
create policy "Users can CRUD own fighters" on fighters
    for all
    using (auth.uid() = user_id);

-- Index for faster user_id lookups
create index idx_fighters_user_id on fighters(user_id);

-- Index for sorting by created_at
create index idx_fighters_created_at on fighters(created_at desc);

-- Function to auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
create trigger update_fighters_updated_at
    before update on fighters
    for each row
    execute function update_updated_at_column();
