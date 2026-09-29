"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Banner } from "@/lib/inicio";
import { IconoImagen } from "./iconos";

/** Carrusel de banners: flechas, puntos, deslizamiento con el dedo y avance automático. */
export default function Carrusel({ banners }: { banners: Banner[] }) {
  const n = banners.length;
  const [actual, setActual] = useState(0);
  const [pausa, setPausa] = useState(false);
  const toque = useRef<{ x: number; y: number } | null>(null);

  const ir = (i: number) => setActual(((i % n) + n) % n);

  useEffect(() => {
    if (pausa || n < 2) return;
    const t = setTimeout(() => setActual((a) => (a + 1) % n), 6000);
    return () => clearTimeout(t);
  }, [actual, pausa, n]);

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Promociones"
      className="relative"
      onMouseEnter={() => setPausa(true)}
      onMouseLeave={() => setPausa(false)}
    >
      <div
        className="overflow-hidden rounded-[14px] md:rounded-2xl"
        onTouchStart={(e) => {
          setPausa(true);
          toque.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          const t = toque.current;
          toque.current = null;
          if (!t) return;
          const dx = e.changedTouches[0].clientX - t.x;
          const dy = e.changedTouches[0].clientY - t.y;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) ir(actual + (dx < 0 ? 1 : -1));
        }}
      >
        <ul className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${actual * 100}%)` }}>
          {banners.map((b, i) => (
            <li
              key={i}
              className="w-full shrink-0"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${n}`}
              aria-hidden={i !== actual}
            >
              <Link href={b.href} tabIndex={i === actual ? 0 : -1} className="block">
                {b.imagen ? (
                  <picture>
                    {b.imagenCelular && <source media="(max-width: 767px)" srcSet={b.imagenCelular} />}
                    <img
                      src={b.imagen}
                      alt={b.titulo}
                      className="aspect-[720/320] w-full object-cover md:aspect-[1280/400]"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  </picture>
                ) : (
                  <div className="flex aspect-[720/320] w-full flex-col items-center justify-center gap-1.5 bg-marca-suave px-4 text-center text-[#3a4256] md:aspect-[1280/400]">
                    <IconoImagen className="size-7 md:size-9" />
                    <span className="font-titulo text-base font-bold uppercase md:text-xl">[{b.titulo}]</span>
                    <span className="text-xs md:text-sm">
                      <span className="md:hidden">Imagen de 720 × 320 px para celular</span>
                      <span className="hidden md:inline">Imagen de 1280 × 400 px</span>
                    </span>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {n > 1 && (
        <>
          <button
            type="button"
            onClick={() => ir(actual - 1)}
            aria-label="Anterior"
            className="absolute left-4 top-[calc(50%-12px)] hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl leading-none text-texto shadow-md hover:text-marca md:flex"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => ir(actual + 1)}
            aria-label="Siguiente"
            className="absolute right-4 top-[calc(50%-12px)] hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl leading-none text-texto shadow-md hover:text-marca md:flex"
          >
            ›
          </button>
          <div className="mt-3 flex justify-center gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => ir(i)}
                aria-label={`Ir al banner ${i + 1}`}
                aria-current={i === actual}
                className={`h-1.5 rounded-full transition-all ${i === actual ? "w-5 bg-marca md:w-6" : "w-1.5 bg-[#c9cedb]"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
