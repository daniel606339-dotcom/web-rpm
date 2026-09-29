"use client";

import { useSyncExternalStore } from "react";

export interface ItemCarrito {
  cod: string;
  nombre: string;
  precio: number | null;
  foto: string | null;
  url: string;
  cantidad: number;
  /** Stock disponible cuando se agregó (tope de cantidad). */
  stock?: number;
}

const CLAVE = "rpm-carrito-v1";
const vacio: ItemCarrito[] = [];
let actual: ItemCarrito[] | null = null;
const oyentes = new Set<() => void>();

function leer(): ItemCarrito[] {
  if (actual) return actual;
  try {
    const raw = localStorage.getItem(CLAVE);
    actual = raw ? (JSON.parse(raw) as ItemCarrito[]) : [];
  } catch {
    actual = [];
  }
  return actual;
}

function guardar(items: ItemCarrito[]) {
  actual = items;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(items));
  } catch {
    /* navegación privada: el carrito vive solo en memoria */
  }
  oyentes.forEach((f) => f());
}

function suscribir(f: () => void) {
  oyentes.add(f);
  const alCambiarOtraPestana = (e: StorageEvent) => {
    if (e.key === CLAVE) {
      actual = null;
      f();
    }
  };
  window.addEventListener("storage", alCambiarOtraPestana);
  return () => {
    oyentes.delete(f);
    window.removeEventListener("storage", alCambiarOtraPestana);
  };
}

export function useCarrito() {
  return useSyncExternalStore(suscribir, leer, () => vacio);
}

const tope = (stock: number | undefined, n: number) => (stock != null && stock >= 0 ? Math.min(n, stock) : n);

/** Agrega al carrito sin pasar el stock. Devuelve la cantidad que quedó en el carrito. */
export function agregar(item: Omit<ItemCarrito, "cantidad">, cantidad: number) {
  const items = [...leer()];
  const i = items.findIndex((x) => x.cod === item.cod);
  let final: number;
  if (i >= 0) {
    const stock = item.stock ?? items[i].stock;
    final = tope(stock, items[i].cantidad + cantidad);
    items[i] = { ...items[i], ...item, stock, cantidad: final };
  } else {
    final = tope(item.stock, cantidad);
    items.push({ ...item, cantidad: final });
  }
  guardar(items);
  return final;
}

export function cambiarCantidad(cod: string, cantidad: number) {
  guardar(
    leer()
      .map((x) => (x.cod === cod ? { ...x, cantidad: tope(x.stock, cantidad) } : x))
      .filter((x) => x.cantidad > 0),
  );
}

export function quitar(cod: string) {
  guardar(leer().filter((x) => x.cod !== cod));
}

export function vaciar() {
  guardar([]);
}

export function totalCarrito(items: ItemCarrito[]) {
  return items.reduce((s, x) => s + (x.precio ?? 0) * x.cantidad, 0);
}
