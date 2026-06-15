-- =============================================================================
-- Make get_secrets non-throwing on no-access (follow-up to 20260615_secrets_encryption)
-- =============================================================================
-- The initial get_secrets RAISED 'Not authorized' when the caller didn't own the
-- scape. That turned the common case of a LOCAL-only scape (no row in
-- public.scapes) into a 400 + "failed to load secrets" toast on every load.
--
-- RLS-backed reads previously just returned an empty set in that situation. We
-- restore that behaviour here: ownership is enforced as a JOIN predicate instead
-- of a RAISE, so an unauthorized/local scape simply yields zero rows.
--
-- set_secret is intentionally left untouched -- writes must still fail loudly.
-- =============================================================================

create or replace function public.get_secrets(p_scape_id uuid)
returns table (
  id uuid,
  scape_id uuid,
  key text,
  value text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  return query
  select
    s.id,
    s.scape_id,
    s.key,
    ds.decrypted_secret as value,
    s.created_at
  from public.secrets s
  -- Ownership enforced here: no matching owned scape => no rows (no error).
  join public.scapes sc
    on sc.id = s.scape_id
   and sc.author_id = auth.uid()
  join vault.decrypted_secrets ds
    on ds.id = s.secret_id
  where s.scape_id = p_scape_id
  order by s.key;
end;
$$;

revoke all on function public.get_secrets(uuid) from public, anon;
grant execute on function public.get_secrets(uuid) to authenticated;
