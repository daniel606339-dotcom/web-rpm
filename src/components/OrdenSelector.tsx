"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Orden } from "@/lib/data";

const OPCIONES: [Orden, string][] = [
  ["relevancia", "Disponibles primero"],
  ["precio-asc", "Menor precio"],
  ["precio-desc", "Mayor precio"],
  ["nombre", "Nombre A-Z"],
];

export default function OrdenSelector({ orden }: { orden: Orden }) {
  const router = useRouter();
  const ruta = usePathname();
  const params = useSearchParams();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-suave">Ordenar:</span>
      <select
        value={orden}
        onChange={(e) => {
          const p = new URLSearchParams(params.toString());
          p.delete("pagina");
          if (e.target.value === "relevancia") p.delete("orden");
          else p.set("orden", e.target.value);
          const s = p.toString();
          router.push(s ? `${ruta}?${s}` : ruta);
        }}
        className="rounded-lg border border-borde bg-white px-3 py-2"
      >
        {OPCIONES.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}
