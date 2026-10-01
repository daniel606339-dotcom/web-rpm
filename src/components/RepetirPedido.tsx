"use client";

import { useRouter } from "next/navigation";
import { repetirPedido, useUltimoPedido } from "./carrito";

/** Tarjeta "Repetir mi último pedido": usa el pedido guardado en este dispositivo (sin cuenta). */
export default function RepetirPedido({ className = "" }: { className?: string }) {
  const p = useUltimoPedido();
  const router = useRouter();
  if (!p || p.items.length === 0) return null;

  const unidades = p.items.reduce((s, x) => s + x.cantidad, 0);
  const fecha = new Date(p.fecha).toLocaleDateString("es-PY", { day: "numeric", month: "long" });
  const resumen = p.items
    .slice(0, 3)
    .map((x) => x.nombre)
    .join(" · ");

  return (
    <div className={`flex flex-col gap-3 rounded-xl border border-marca/30 bg-marca-suave p-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="min-w-0">
        <p className="font-bold text-titulo">
          ¿Repetimos tu último pedido? <span className="font-normal text-suave">({p.numero} · {fecha})</span>
        </p>
        <p className="mt-0.5 truncate text-sm text-suave">
          {p.items.length} {p.items.length === 1 ? "artículo" : "artículos"}, {unidades} unidades: {resumen}
          {p.items.length > 3 ? "…" : ""}
        </p>
      </div>
      <button
        onClick={() => {
          repetirPedido(p);
          router.push("/carrito");
        }}
        className="h-11 shrink-0 rounded-lg bg-marca px-5 text-sm font-bold text-white hover:bg-marca-oscuro"
      >
        Cargar al carrito
      </button>
    </div>
  );
}
