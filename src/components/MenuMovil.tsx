"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconoMenu } from "./iconos";

interface Item {
  slug: string;
  nombre: string;
  lineas: { slug: string; nombre: string }[];
}

export default function MenuMovil({ menu }: { menu: Item[] }) {
  const [abierto, setAbierto] = useState(false);
  const [dep, setDep] = useState<string | null>(null);
  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="-ml-2 rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
        aria-label="Abrir menú de categorías"
        aria-expanded={abierto}
      >
        <IconoMenu />
      </button>
      {abierto && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Categorías">
          <button className="absolute inset-0 bg-black/40" aria-label="Cerrar menú" onClick={() => setAbierto(false)} />
          <nav
            // Cerrar al tocar cualquier link
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setAbierto(false);
            }}
            className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between bg-marca px-4 py-4 text-white">
              <span className="font-bold">Categorías</span>
              <button onClick={() => setAbierto(false)} className="rounded px-2 text-2xl leading-none" aria-label="Cerrar">
                ×
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto">
              {menu.map((d) => (
                <li key={d.slug} className="border-b border-borde">
                  <button
                    className="flex w-full items-center justify-between px-4 py-3.5 text-left font-medium"
                    onClick={() => setDep(dep === d.slug ? null : d.slug)}
                    aria-expanded={dep === d.slug}
                  >
                    {d.nombre}
                    <span className="text-suave">{dep === d.slug ? "−" : "+"}</span>
                  </button>
                  {dep === d.slug && (
                    <ul className="bg-fondo pb-2">
                      <li>
                        <Link href={`/d/${d.slug}`} className="block px-6 py-2.5 text-sm font-semibold text-marca">
                          Ver todo {d.nombre}
                        </Link>
                      </li>
                      {d.lineas.map((l) => (
                        <li key={l.slug}>
                          <Link href={`/c/${l.slug}`} className="block px-6 py-2.5 text-sm">
                            {l.nombre}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
