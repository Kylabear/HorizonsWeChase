-- Run once in Supabase SQL Editor if your project still has the old "landmark" type value.

do $$ begin
  alter type place_type rename value 'landmark' to 'horizon';
exception
  when undefined_object then null;
  when invalid_parameter_value then null;
end $$;
