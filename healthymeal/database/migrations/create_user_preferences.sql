-- Tworzenie tabeli user_preferences
create table if not exists public.user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  diet_type text default 'normal',
  max_carbs integer default 0,
  excluded_products text[] default '{}',
  allergens text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id)
);

-- Ustawienie uprawnień RLS (Row Level Security)
alter table public.user_preferences enable row level security;

-- Polityki dostępu
create policy "Users can view own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- Indeksy
create index user_preferences_user_id_idx on public.user_preferences(user_id);

-- Trigger do aktualizacji updated_at
create or replace function update_user_preferences_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_user_preferences_updated_at
  before update on public.user_preferences
  for each row
  execute function update_user_preferences_updated_at();

-- Funkcja do tworzenia preferencji przy rejestracji użytkownika
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_preferences (user_id, diet_type, max_carbs, excluded_products, allergens)
  values (new.id, 'normal', 0, '{}', '{}');
  return new;
end;
$$;

-- Trigger do automatycznego tworzenia preferencji
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user(); 