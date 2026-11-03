-- ============================================================================
-- Portal de listas de útiles escolares (B2C) — esquema web
-- Proyecto Supabase: INTRANET (yrvunjrqxowuraezggdh)
--
-- Qué agrega:
--   web.utiles_colegios        colegios con listas publicadas en el portal
--   web.utiles_listas          una lista por colegio + año + grado
--   web.utiles_renglones       lo que pide la lista, renglón por renglón, ya asociado a un artículo RPM
--   web.utiles_reservas        reservas que hacen los padres desde el portal
--   web.utiles_reserva_items   detalle de cada reserva (con stock / a encargar)
--   web.utiles_lista_publica() lectura pública de una lista con precio y stock al momento
--   web.utiles_listas_publicas() índice de colegios y grados publicados (para /utiles y el sitemap)
--   web.crear_reserva_utiles() alta de una reserva (precios recalculados en la base, nunca del navegador)
--
-- No toca ninguna tabla existente. Precio = web.productos.precio_venta (Lista 6, público).
-- ============================================================================

begin;

-- ---------- Tablas ----------

create table web.utiles_colegios (
  id                serial primary key,
  slug              text not null unique,               -- ej. 'colegio-presbiteriano-del-paraguay'
  nombre            text not null,
  nombre_corto      text,                               -- ej. 'CPP'
  cod_institucion_mec int,                              -- código de institución del MEC (datos abiertos)
  distrito          text,
  barrio            text,
  lat               double precision,
  lng               double precision,
  activo            boolean not null default true,
  creado_at         timestamptz not null default now()
);

create table web.utiles_listas (
  id                serial primary key,
  colegio_id        int not null references web.utiles_colegios(id) on delete cascade,
  anio              int not null,                       -- año lectivo (2026, 2027…)
  grado             text not null,                      -- texto visible: 'Pre jardín', '3er grado', '1er curso'
  grado_slug        text not null,                      -- en la URL: 'pre-jardin', '3er-grado'
  grado_orden       int not null,                       -- 1 = pre jardín … 15 = 3er curso (para ordenar)
  fuente_url        text,                               -- PDF o publicación original del colegio
  nota              text,                               -- aclaración visible ("Las témperas se usan de 7mo a 9no")
  publicada         boolean not null default false,     -- solo las publicadas se ven en el portal
  validada_por      text,
  validada_at       timestamptz,
  creado_at         timestamptz not null default now(),
  actualizado_at    timestamptz not null default now(),
  unique (colegio_id, anio, grado_slug)
);

create table web.utiles_renglones (
  id                serial primary key,
  lista_id          int not null references web.utiles_listas(id) on delete cascade,
  orden             int not null default 0,
  texto             text not null,                      -- lo que pide el colegio, como lo leería el padre
  cantidad          int not null default 1 check (cantidad between 1 and 999),
  tipo              text not null default 'util'
                    check (tipo in ('util', 'fuera')),  -- 'fuera' = uniforme, libro, juguete: se muestra pero no se cotiza
  cod_articulo      text,                               -- opción principal (lo que pide el colegio)
  cod_alternativa   text,                               -- opción económica (opcional)
  coincidencia      text not null default 'igual'
                    check (coincidencia in ('igual', 'equivalente', 'sin_catalogo')),
  nota              text                                -- ej. 'Ofrecemos 48 hojas en vez de 50'
);
create index on web.utiles_renglones (lista_id, orden);

create sequence web.utiles_reservas_numero_seq start 1;

create table web.utiles_reservas (
  id                bigserial primary key,
  numero            text not null unique,               -- 'U-000123'
  token             uuid not null default gen_random_uuid(),
  creado_at         timestamptz not null default now(),
  lista_id          int references web.utiles_listas(id) on delete set null,
  colegio           text,                               -- copia para el panel (aunque cambie la lista)
  grado             text,
  nombre            text not null,                      -- padre / madre
  telefono          text not null,                      -- WhatsApp
  email             text,
  alumno            text,                               -- nombre del alumno (para rotular el kit)
  entrega           text not null default 'retiro' check (entrega in ('retiro', 'delivery')),
  direccion         text,
  observaciones     text,
  total_con_stock   bigint not null default 0,          -- lo que se puede entregar ya
  total_encargo     bigint not null default 0,          -- lo que llega después (sin stock hoy)
  total             bigint not null default 0,
  estado            text not null default 'nueva'
                    check (estado in ('nueva', 'contactada', 'confirmada', 'lista', 'entregada', 'cancelada')),
  nota_interna      text,
  actualizado_at    timestamptz,
  actualizado_por   text
);
create index on web.utiles_reservas (creado_at desc);

create table web.utiles_reserva_items (
  reserva_id        bigint not null references web.utiles_reservas(id) on delete cascade,
  linea             int not null,
  renglon_id        int references web.utiles_renglones(id) on delete set null,
  texto             text not null,                      -- lo que pedía la lista
  cod_articulo      text not null,
  nombre            text not null,                      -- nombre del artículo RPM
  precio            bigint not null,
  cantidad          int not null,
  subtotal          bigint not null,
  con_stock         boolean not null,
  primary key (reserva_id, linea)
);

-- ---------- Seguridad ----------
-- Nadie lee ni escribe las tablas directo desde el navegador salvo el personal (panel).
-- Los padres solo usan las funciones de abajo.

alter table web.utiles_colegios      enable row level security;
alter table web.utiles_listas        enable row level security;
alter table web.utiles_renglones     enable row level security;
alter table web.utiles_reservas      enable row level security;
alter table web.utiles_reserva_items enable row level security;

create policy utiles_colegios_staff  on web.utiles_colegios      for all to authenticated using (web.es_staff()) with check (web.es_staff());
create policy utiles_listas_staff    on web.utiles_listas        for all to authenticated using (web.es_staff()) with check (web.es_staff());
create policy utiles_renglones_staff on web.utiles_renglones     for all to authenticated using (web.es_staff()) with check (web.es_staff());
create policy utiles_reservas_staff_sel on web.utiles_reservas   for select to authenticated using (web.es_staff());
create policy utiles_reservas_staff_upd on web.utiles_reservas   for update to authenticated using (web.es_staff()) with check (web.es_staff());
create policy utiles_items_staff_sel on web.utiles_reserva_items for select to authenticated using (web.es_staff());

grant select, insert, update, delete on web.utiles_colegios, web.utiles_listas, web.utiles_renglones to authenticated;
grant select, update on web.utiles_reservas to authenticated;
grant select on web.utiles_reserva_items to authenticated;
grant usage on sequence web.utiles_colegios_id_seq, web.utiles_listas_id_seq, web.utiles_renglones_id_seq to authenticated;

-- ---------- Lectura pública ----------

-- Índice: colegios y grados publicados del año pedido (o del último año con listas).
create or replace function web.utiles_listas_publicas(p_anio int default null)
returns jsonb
language sql stable security definer
set search_path = pg_catalog, web, public
as $$
  with anio as (
    select coalesce(p_anio, (select max(l.anio) from web.utiles_listas l where l.publicada)) as a
  )
  select coalesce(jsonb_agg(c order by c->>'nombre'), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'slug', co.slug, 'nombre', co.nombre, 'nombre_corto', co.nombre_corto,
      'barrio', co.barrio, 'distrito', co.distrito,
      'grados', jsonb_agg(jsonb_build_object('slug', l.grado_slug, 'grado', l.grado, 'anio', l.anio, 'actualizado_at', l.actualizado_at)
                          order by l.grado_orden)
    ) as c
    from web.utiles_colegios co
    join web.utiles_listas l on l.colegio_id = co.id and l.publicada and l.anio = (select a from anio)
    where co.activo
    group by co.id
  ) x;
$$;

-- Una lista con sus renglones, precio y stock actuales de cada opción.
create or replace function web.utiles_lista_publica(p_colegio text, p_grado text, p_anio int default null)
returns jsonb
language sql stable security definer
set search_path = pg_catalog, web, public
as $$
  with l as (
    select l.*, co.nombre as colegio, co.nombre_corto, co.slug as colegio_slug
    from web.utiles_listas l
    join web.utiles_colegios co on co.id = l.colegio_id and co.activo
    where co.slug = p_colegio and l.grado_slug = p_grado and l.publicada
      and (p_anio is null or l.anio = p_anio)
    order by l.anio desc
    limit 1
  ),
  art as (
    select p.cod_articulo, p.nombre, p.foto_url, p.precio_venta, greatest(coalesce(p.cant_dispon, 0), 0) as stock,
           web.url_producto(p.cod_articulo) as url
    from web.productos p
  )
  select case when not exists (select 1 from l) then null else
    (select jsonb_build_object(
       'id', l.id, 'colegio', l.colegio, 'colegio_corto', l.nombre_corto, 'colegio_slug', l.colegio_slug,
       'anio', l.anio, 'grado', l.grado, 'grado_slug', l.grado_slug,
       'fuente_url', l.fuente_url, 'nota', l.nota, 'actualizado_at', l.actualizado_at,
       'renglones', coalesce((
         select jsonb_agg(jsonb_build_object(
           'id', r.id, 'texto', r.texto, 'cantidad', r.cantidad, 'tipo', r.tipo,
           'coincidencia', r.coincidencia, 'nota', r.nota,
           'principal', case when a1.cod_articulo is null then null else jsonb_build_object(
               'cod', a1.cod_articulo, 'nombre', a1.nombre, 'foto', a1.foto_url, 'precio', a1.precio_venta, 'stock', a1.stock, 'url', a1.url) end,
           'alternativa', case when a2.cod_articulo is null then null else jsonb_build_object(
               'cod', a2.cod_articulo, 'nombre', a2.nombre, 'foto', a2.foto_url, 'precio', a2.precio_venta, 'stock', a2.stock, 'url', a2.url) end
         ) order by r.tipo desc, r.orden, r.id)
         from web.utiles_renglones r
         left join art a1 on a1.cod_articulo = r.cod_articulo
         left join art a2 on a2.cod_articulo = r.cod_alternativa
         where r.lista_id = l.id), '[]'::jsonb)
     ) from l)
  end;
$$;

-- ---------- Reserva ----------
-- p = { lista_id, nombre, telefono, email?, alumno?, entrega, direccion?, observaciones?,
--       items: [{ renglon_id, cod, cantidad }] }
-- El precio, el nombre y si hay stock se toman de la base. Solo se aceptan artículos que sean
-- la opción principal o la alternativa del renglón (el navegador no puede inventar productos).
create or replace function web.crear_reserva_utiles(p jsonb)
returns jsonb
language plpgsql security definer
set search_path = pg_catalog, web, public
as $$
declare
  v_lista    web.utiles_listas;
  v_colegio  text;
  v_nombre   text := btrim(coalesce(p->>'nombre', ''));
  v_tel      text := btrim(coalesce(p->>'telefono', ''));
  v_email    text := nullif(btrim(coalesce(p->>'email', '')), '');
  v_alumno   text := nullif(btrim(coalesce(p->>'alumno', '')), '');
  v_entrega  text := coalesce(nullif(p->>'entrega', ''), 'retiro');
  v_dir      text := nullif(btrim(coalesce(p->>'direccion', '')), '');
  v_obs      text := nullif(btrim(coalesce(p->>'observaciones', '')), '');
  v_item     jsonb;
  v_r        web.utiles_renglones;
  v_a        record;
  v_cant     int;
  v_n        int := 0;
  v_con      bigint := 0;
  v_enc      bigint := 0;
  v_id       bigint;
  v_numero   text;
  v_token    uuid;
  v_hay      boolean;
begin
  if length(v_nombre) < 3 or length(v_nombre) > 120 then raise exception 'Nombre inválido'; end if;
  if regexp_replace(v_tel, '[^0-9]', '', 'g') !~ '^[0-9]{6,15}$' then raise exception 'Teléfono inválido'; end if;
  if v_email is not null and v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Correo electrónico inválido'; end if;
  if v_entrega not in ('retiro', 'delivery') then raise exception 'Forma de entrega inválida'; end if;
  if v_entrega = 'delivery' and coalesce(length(v_dir), 0) < 5 then raise exception 'Falta la dirección de entrega'; end if;
  if length(coalesce(v_obs, '')) > 1000 or length(coalesce(v_dir, '')) > 300 or length(coalesce(v_alumno, '')) > 120 then
    raise exception 'Texto demasiado largo';
  end if;
  if jsonb_typeof(p->'items') is distinct from 'array' or jsonb_array_length(p->'items') = 0 or jsonb_array_length(p->'items') > 150 then
    raise exception 'La reserva no tiene productos';
  end if;

  select * into v_lista from web.utiles_listas where id = (p->>'lista_id')::int and publicada;
  if not found then raise exception 'Lista no encontrada'; end if;
  select nombre into v_colegio from web.utiles_colegios where id = v_lista.colegio_id;

  -- Freno simple contra repeticiones: mismo teléfono y lista en los últimos 2 minutos.
  if exists (select 1 from web.utiles_reservas
             where lista_id = v_lista.id and regexp_replace(telefono, '[^0-9]', '', 'g') = regexp_replace(v_tel, '[^0-9]', '', 'g')
               and creado_at > now() - interval '2 minutes') then
    raise exception 'Ya recibimos tu reserva hace un momento';
  end if;

  v_numero := 'U-' || lpad(nextval('web.utiles_reservas_numero_seq')::text, 6, '0');
  insert into web.utiles_reservas (numero, lista_id, colegio, grado, nombre, telefono, email, alumno, entrega, direccion, observaciones)
  values (v_numero, v_lista.id, v_colegio, v_lista.grado, v_nombre, v_tel, v_email, v_alumno, v_entrega, v_dir, v_obs)
  returning id, token into v_id, v_token;

  for v_item in select * from jsonb_array_elements(p->'items') loop
    v_cant := least(greatest(coalesce((v_item->>'cantidad')::int, 0), 0), 999);
    continue when v_cant = 0;

    select * into v_r from web.utiles_renglones
     where id = (v_item->>'renglon_id')::int and lista_id = v_lista.id and tipo = 'util';
    continue when not found;
    continue when (v_item->>'cod') is distinct from v_r.cod_articulo and (v_item->>'cod') is distinct from v_r.cod_alternativa;

    select cod_articulo, nombre, precio_venta, coalesce(cant_dispon, 0) as stock
      into v_a from web.productos where cod_articulo = v_item->>'cod';
    continue when not found or v_a.precio_venta is null or v_a.precio_venta <= 0;

    v_hay := v_a.stock >= v_cant;
    v_n := v_n + 1;
    insert into web.utiles_reserva_items (reserva_id, linea, renglon_id, texto, cod_articulo, nombre, precio, cantidad, subtotal, con_stock)
    values (v_id, v_n, v_r.id, v_r.texto, v_a.cod_articulo, v_a.nombre, v_a.precio_venta, v_cant, v_a.precio_venta * v_cant, v_hay);
    if v_hay then v_con := v_con + v_a.precio_venta * v_cant; else v_enc := v_enc + v_a.precio_venta * v_cant; end if;
  end loop;

  if v_n = 0 then raise exception 'La reserva no tiene productos válidos'; end if;

  update web.utiles_reservas
     set total_con_stock = v_con, total_encargo = v_enc, total = v_con + v_enc
   where id = v_id;

  return jsonb_build_object('ok', true, 'numero', v_numero, 'token', v_token,
                            'total', v_con + v_enc, 'total_con_stock', v_con, 'total_encargo', v_enc, 'items', v_n);
end;
$$;

-- Ver la propia reserva (página de confirmación), con número + token.
create or replace function web.reserva_utiles_publica(p_numero text, p_token uuid)
returns jsonb
language sql stable security definer
set search_path = pg_catalog, web, public
as $$
  select jsonb_build_object(
    'numero', r.numero, 'creado_at', r.creado_at, 'colegio', r.colegio, 'grado', r.grado,
    'nombre', r.nombre, 'alumno', r.alumno, 'entrega', r.entrega, 'estado', r.estado,
    'total', r.total, 'total_con_stock', r.total_con_stock, 'total_encargo', r.total_encargo,
    'items', (select jsonb_agg(jsonb_build_object('texto', i.texto, 'nombre', i.nombre, 'cod', i.cod_articulo,
                    'precio', i.precio, 'cantidad', i.cantidad, 'subtotal', i.subtotal, 'con_stock', i.con_stock) order by i.linea)
              from web.utiles_reserva_items i where i.reserva_id = r.id))
  from web.utiles_reservas r where r.numero = p_numero and r.token = p_token;
$$;

revoke all on function web.utiles_listas_publicas(int) from public;
revoke all on function web.utiles_lista_publica(text, text, int) from public;
revoke all on function web.crear_reserva_utiles(jsonb) from public;
revoke all on function web.reserva_utiles_publica(text, uuid) from public;
grant execute on function web.utiles_listas_publicas(int)            to anon, authenticated;
grant execute on function web.utiles_lista_publica(text, text, int)  to anon, authenticated;
grant execute on function web.crear_reserva_utiles(jsonb)            to anon, authenticated;
grant execute on function web.reserva_utiles_publica(text, uuid)     to anon, authenticated;

commit;
