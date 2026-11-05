"use client";

import Link from "next/link";
import { useState } from "react";
import { esReferencia } from "@/lib/anioEscolar";
import type { ColegioResumen } from "@/lib/utiles";

const normal = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Filtro de colegios por nombre o barrio, con los grados como botones. */
export default function BuscadorColegios({ colegios }: { colegios: ColegioResumen[] }) {
  const [q, setQ] = useState("");
  const t = normal(q.trim());
  const visibles = t
    ? colegios.filter((c) => normal(`${c.nombre} ${c.nombre_corto ?? ""} ${c.barrio ?? ""} ${c.distrito ?? ""}`).includes(t))
    : colegios;

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar colegio o barrio…"
        aria-label="Buscar colegio"
        className="h-12 w-full max-w-xl rounded-[10px] border border-borde bg-white px-4 text-base outline-none focus:border-marca focus:ring-2 focus:ring-marca/15"
      />
      {visibles.length === 0 ? (
        <p className="text-suave">No encontramos ese colegio todavía.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {visibles.map((c) => (
            <li key={c.slug} className="rounded-2xl border border-borde bg-white p-5">
              <h2 className="text-lg font-bold text-titulo">{c.nombre}</h2>
              <p className="text-sm text-suave">{[c.barrio, c.distrito].filter(Boolean).join(", ")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.grados.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/utiles/${c.slug}/${g.slug}`}
                    className="inline-flex h-9 items-center rounded-full border border-marca/30 bg-marca-suave px-3.5 text-sm font-semibold text-marca hover:border-marca"
                  >
                    {g.grado}
                    {esReferencia(g.anio) && <span className="ml-1 text-xs font-normal text-suave">({g.anio})</span>}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
