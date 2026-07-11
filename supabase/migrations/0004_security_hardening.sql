-- Flexsport.uz — lock down internal helper functions per Supabase security advisor

alter function public.immutable_array_to_string(text[], text) set search_path = '';

revoke execute on function public.handle_new_user() from public, anon, authenticated;
