"use client";

import Link from "next/link";
import { useCarrito } from "./carrito";
import { IconoCarrito } from "./iconos";

export default function CarritoBoton() {
  const items = useCarrito();
  const n = items.reduce((s, x) => s + x.cantidad, 0);
  return (
    <Link href="/carrito" className="flex items-center gap-2 text-sm font-semibold text-texto hover:text-marca" aria-label={`Mi pedido, ${n} artículos`}>
      <IconoCarrito className="size-5" />
      Mi pedido ({n > 999 ? "999+" : n})
    </Link>
  );
}
