"use client";

/**
 * Portal de empresas (lado navegador).
 * - Sesión de Supabase Auth del usuario del cliente.
 * - "Mi cuenta": cliente, usuario y direcciones (RPC web.mi_cuenta).
 * - Precios del cliente: se piden en lote a web.mis_precios (la base calcula lista propia / descuentos).
 */
import { createClient, type Session } from "@supabase/supabase-js";
import { useEffect, useState, useSyncExternalStore } from "react";
import { SUPABASE } from "./config";
import { agregar } from "@/components/carrito";
import { urlProducto } from "./format";

export const sb = createClient(SUPABASE.url, SUPABASE.key, { db: { schema: "web" } });

export interface Direccion {
  id: number;
  nombre: string;
  direccion: string;
  localidad: string | null;
  referencias: string | null;
  contacto: string | null;
}
export interface Cuenta {
  cod_cliente: string;
  razon_social: string;
  ruc: string | null;
  categoria: "EMPRESA" | "MAYORISTA" | null;
  tiene_lista: boolean;
  usuario: { nombre: string | null; email: string; rol: string } | null;
  direcciones: Direccion[];
}
export interface PrecioCliente {
  precio: number | null;
  precio_base: number | null;
  porc: number | null;
  regla: string;
}

// ---------- estado de la sesión del portal ----------
type Estado = { cargando: boolean; sesion: Session | null; cuenta: Cuenta | null };
let estado: Estado = { cargando: true, sesion: null, cuenta: null };
const oyentes = new Set<() => void>();
let iniciado = false;

function emitir(nuevo: Partial<Estado>) {
  estado = { ...estado, ...nuevo };
  oyentes.forEach((f) => f());
}

async function cargarCuenta(sesion: Session | null) {
  if (!sesion) return emitir({ cargando: false, sesion: null, cuenta: null });
  const { data } = await sb.rpc("mi_cuenta");
  emitir({ cargando: false, sesion, cuenta: (data as Cuenta | null) ?? null });
}

function iniciar() {
  if (iniciado || typeof window === "undefined") return;
  iniciado = true;
  sb.auth.getSession().then(({ data }) => cargarCuenta(data.session));
  sb.auth.onAuthStateChange((evento, sesion) => {
    if (evento === "SIGNED_IN" || evento === "SIGNED_OUT" || evento === "USER_UPDATED") {
      cachePrecios.clear();
      void cargarCuenta(sesion);
    }
  });
}

function suscribir(f: () => void) {
  iniciar();
  oyentes.add(f);
  return () => oyentes.delete(f);
}
const servidor: Estado = { cargando: true, sesion: null, cuenta: null };

/** Estado del portal: cargando, sesión y cuenta (null si no es usuario de un cliente). */
export function usePortal() {
  return useSyncExternalStore(suscribir, () => estado, () => servidor);
}

export async function salir() {
  await sb.auth.signOut();
}

/** Vuelve a leer la cuenta (por ejemplo, después de activar la contraseña). */
export function recargarCuenta() {
  return sb.auth.getSession().then(({ data }) => cargarCuenta(data.session));
}

// ---------- precios del cliente, en lote ----------
const cachePrecios = new Map<string, Promise<PrecioCliente | null>>();
let cola: { cod: string; cantidad: number; resolver: (p: PrecioCliente | null) => void }[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

async function vaciarCola() {
  const lote = cola;
  cola = [];
  timer = null;
  const { data, error } = await sb.rpc("mis_precios", { p_items: lote.map(({ cod, cantidad }) => ({ cod, cantidad })) });
  const filas = (error ? [] : (data as (PrecioCliente & { cod: string; cantidad: number })[])) ?? [];
  for (const q of lote) {
    const f = filas.find((x) => x.cod === q.cod && Number(x.cantidad) === q.cantidad);
    q.resolver(f ? { precio: f.precio, precio_base: f.precio_base, porc: f.porc, regla: f.regla } : null);
  }
}

/** Precio del cliente para un artículo y cantidad (se agrupa con los demás pedidos del mismo momento). */
export function precioCliente(cod: string, cantidad = 1): Promise<PrecioCliente | null> {
  const clave = `${cod}|${cantidad}`;
  let p = cachePrecios.get(clave);
  if (!p) {
    p = new Promise((resolver) => {
      cola.push({ cod, cantidad, resolver });
      if (!timer) timer = setTimeout(vaciarCola, 40);
    });
    cachePrecios.set(clave, p);
  }
  return p;
}

/** Hook: precio del cliente (o null si no es usuario del portal o todavía no cargó). */
export function usePrecioCliente(cod: string, cantidad = 1) {
  const { cuenta } = usePortal();
  const [r, setR] = useState<{ clave: string; p: PrecioCliente | null } | null>(null);
  const clave = `${cuenta?.cod_cliente ?? ""}|${cod}|${cantidad}`;
  useEffect(() => {
    if (!cuenta) return;
    let vivo = true;
    precioCliente(cod, cantidad).then((p) => vivo && setR({ clave, p }));
    return () => {
      vivo = false;
    };
  }, [cuenta, cod, cantidad, clave]);
  return cuenta && r?.clave === clave ? r.p : null;
}

/** Texto corto para mostrar cómo se calculó el precio. */
export function textoRegla(p: PrecioCliente) {
  if (p.regla.startsWith("Lista")) return "Precio acordado";
  if (p.porc && p.porc > 0) return `−${Number(p.porc)}% ${p.regla.startsWith("MAYORISTA") ? "mayorista" : "empresa"}`;
  return "Precio de lista";
}

// ---------- cargar una lista de artículos al carrito (repetir pedido / carrito guardado) ----------

/**
 * Agrega al carrito los artículos indicados con el stock y los datos actuales de la web.
 * Devuelve los que no se pudieron agregar completos (sin stock o con menos stock).
 */
export async function cargarEnCarrito(items: { cod: string; cantidad: number; nombre?: string }[]) {
  const cods = [...new Set(items.map((x) => x.cod))];
  const { data } = await sb
    .from("productos")
    .select("cod_articulo,nombre,slug,foto_url,precio_venta,cant_dispon")
    .in("cod_articulo", cods);
  const prods = new Map((data ?? []).map((p) => [p.cod_articulo as string, p]));
  const faltan: { nombre: string; pedido: number; agregado: number }[] = [];
  for (const it of items) {
    const p = prods.get(it.cod);
    const stock = Math.floor(Number(p?.cant_dispon ?? 0));
    if (!p || stock <= 0) {
      faltan.push({ nombre: p?.nombre ?? it.nombre ?? it.cod, pedido: it.cantidad, agregado: 0 });
      continue;
    }
    const final = agregar(
      { cod: p.cod_articulo, nombre: p.nombre, precio: p.precio_venta, foto: p.foto_url, url: urlProducto(p), stock },
      it.cantidad,
    );
    if (final < it.cantidad) faltan.push({ nombre: p.nombre, pedido: it.cantidad, agregado: final });
  }
  return faltan;
}
