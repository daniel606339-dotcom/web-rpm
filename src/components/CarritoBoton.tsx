"use client";

import Link from "next/link";
import { useCarrito } from "./carrito";
import { IconoCarrito } from "./iconos";

export default function CarritoBoton() {
  const items = useCarrito();
  const n = items.reduce((s, x) => s + x.cantidad, 0);
  return (
    <Link
      href="/carrito"
      className="relative flex items-center gap-2 rounded-lg px-2 py-2 text-white hover:bg-white/10"
      aria-label={`Carrito, ${n} artículos`}
    >
      <IconoCarrito />
      <span className="hidden text-sm font-semibold lg:inline">Carrito</span>
      {n > 0 && (
        <span className="absolute -top-0.5 left-6 min-w-5 rounded-full bg-acento px-1 text-center text-xs font-bold leading-5 text-white">
          {n > 99 ? "99+" : n}
        </span>
      )}
    </Link>
  );
}
