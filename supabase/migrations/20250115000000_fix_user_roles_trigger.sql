-- Migration: Fix user roles trigger
-- Description: Automatically assign default role to new users

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert default role for new user (admin role allows creating companies)
  insert into public.user_roles (user_id, role)
  values (new.id, 'admin');
  
  return new;
end;
$$;

-- Create trigger to automatically assign role to new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant necessary permissions
grant usage on schema auth to authenticated;
grant select on auth.users to authenticated;

-- Also create a function to manually assign developer role if needed
create or replace function public.assign_developer_role(_user_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _user_id uuid;
begin
  -- Get user ID from email
  select id into _user_id
  from auth.users
  where email = _user_email;
  
  if _user_id is null then
    raise exception 'User with email % not found', _user_email;
  end if;
  
  -- Insert or update to developer role
  insert into public.user_roles (user_id, role)
  values (_user_id, 'developer')
  on conflict (user_id) 
  do update set role = 'developer', updated_at = now();
end;
$$;