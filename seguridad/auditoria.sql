-- Auditoría de seguridad de Supabase (proyecto INTRANET). SOLO LECTURA.
-- Se corre en el SQL Editor de Supabase o con la herramienta execute_sql.
-- No lee filas de datos: solo el catálogo y conteos como el rol anónimo.

-- 1) Políticas abiertas a anon / public / authenticated(true) en esquemas expuestos
select schemaname, tablename, policyname, cmd, roles::text, qual, with_check,
  case
    when roles::text ~ '(anon|public)' and cmd in ('INSERT','UPDATE','DELETE','ALL') then 'CRITICA: escritura anónima'
    when roles::text ~ '(anon|public)' and cmd = 'SELECT' and qual = 'true' then 'REVISAR: lectura anónima total'
    when roles::text ~ 'authenticated' and coalesce(qual,with_check) = 'true' then 'REVISAR: cualquier usuario logueado (incluye clientes del portal)'
  end as alerta
from pg_policies
where schemaname in ('public','web','storage')
order by alerta nulls last, schemaname, tablename;

-- 2) Tablas sin RLS y vistas sin security_invoker
select n.nspname, c.relname, c.relkind, c.relrowsecurity as rls, c.reloptions
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public','web') and c.relkind in ('r','v','m')
  and ((c.relkind = 'r' and not c.relrowsecurity)
    or (c.relkind = 'v' and not coalesce(c.reloptions::text ~ 'security_invoker=true', false)));

-- 3) Columnas que parecen secretos
select table_schema, table_name, column_name
from information_schema.columns
where table_schema in ('public','web')
  and column_name ~* '(pass|secret|token|smtp|hash|api_?key)';

-- 4) Funciones SECURITY DEFINER ejecutables por anon o authenticated
select n.nspname, p.proname, pg_get_function_arguments(p.oid) as args,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated,
  p.proconfig as config
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public','web') and p.prosecdef
order by anon desc, n.nspname, p.proname;

-- 5) Buckets de Storage
select id, public, file_size_limit, allowed_mime_types from storage.buckets;

-- 6) Qué ve el rol anónimo (solo conteos; ajustar la lista de tablas)
-- begin; set local role anon;
-- select 'public.clientes', count(*) from public.clientes
-- union all select 'public.cc_saldos', count(*) from public.cc_saldos;
-- rollback;
