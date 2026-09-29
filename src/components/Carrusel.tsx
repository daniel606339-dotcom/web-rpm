"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Banner } from "@/lib/inicio";
import { IconoImagen } from "./iconos";

/** Carrusel de banners con flechas, puntos, deslizamiento táctil y avance automático. */
export default function Carrusel({ banners }: { banners: Banner[] }) {
  const pista = useRef<HTMLUListElement>(null);
  const [actual, setActual] = useState(0);
  const [pausa, setPausa] = useState(false);

  const ir = useCallback(
    (i: number) => {
      const el = pista.current;
      if (!el) return;
      const n = (i + banners.length) % banners.length;
      el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
    },
    [banners.length],
  );

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const alMover = () => setActual(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", alMover, { passive: true });
    return () => el.removeEventListener("scroll", alMover);
  }, []);

  useEffect(() => {
    if (pausa || banners.length < 2) return;
    const t = setInterval(() => ir(actual + 1), 6000);
    return () => clearInterval(t);
  }, [actual, pausa, ir, banners.length]);

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Promociones"
      className="relative"
      onMouseEnter={() => setPausa(true)}
      onMouseLeave={() => setPausa(false)}
      onTouchStart={() => setPausa(true)}
    >
      <ul ref={pista} className="scroll-x flex snap-x snap-mandatory">
        {banners.map((b, i) => (
          <li key={i} className="w-full shrink-0 snap-center" aria-roledescription="diapositiva" aria-label={`${i + 1} de ${banners.length}`}>
            <Link href={b.href} className="block overflow-hidden rounded-[14px] md:rounded-2xl">
              {b.imagen ? (
                <picture>
                  {b.imagenCelular && <source media="(max-width: 767px)" srcSet={b.imagenCelular} />}
                  <img src={b.imagen} alt={b.titulo} className="aspect-[720/320] w-full object-cover md:aspect-[1280/400]" loading={i === 0 ? "eager" : "lazy"} />
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

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => ir(actual - 1)}
            aria-label="Anterior"
            className="absolute left-4 top-1/2 hidden size-10 -translate-y-[calc(50%+12px)] items-center justify-center rounded-full bg-white text-texto shadow-md hover:text-marca md:flex"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => ir(actual + 1)}
            aria-label="Siguiente"
            className="absolute right-4 top-1/2 hidden size-10 -translate-y-[calc(50%+12px)] items-center justify-center rounded-full bg-white text-texto shadow-md hover:text-marca md:flex"
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
