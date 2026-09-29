"use client";

import { useSyncExternalStore } from "react";

export interface ItemCarrito {
  cod: string;
  nombre: string;
  precio: number | null;
  foto: string | null;
  url: string;
  cantidad: number;
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

export function agregar(item: Omit<ItemCarrito, "cantidad">, cantidad: number) {
  const items = [...leer()];
  const i = items.findIndex((x) => x.cod === item.cod);
  if (i >= 0) items[i] = { ...items[i], ...item, cantidad: items[i].cantidad + cantidad };
  else items.push({ ...item, cantidad });
  guardar(items);
}

export function cambiarCantidad(cod: string, cantidad: number) {
  guardar(
    leer()
      .map((x) => (x.cod === cod ? { ...x, cantidad } : x))
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
