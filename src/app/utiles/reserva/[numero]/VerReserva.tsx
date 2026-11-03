"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconoWhatsApp } from "@/components/iconos";
import { SITE } from "@/lib/config";
import { gs, linkWhatsApp } from "@/lib/format";
import { sb } from "@/lib/portal";

interface Item {
  texto: string;
  nombre: string;
  cod: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  con_stock: boolean;
}
interface Reserva {
  numero: string;
  creado_at: string;
  colegio: string;
  grado: string;
  nombre: string;
  alumno: string | null;
  entrega: "retiro" | "delivery";
  estado: string;
  total: number;
  total_con_stock: number;
  total_encargo: number;
  items: Item[];
}

function mensaje(r: Reserva, enlace: string) {
  const lineas = [
    `Hola RPM, hice la reserva de útiles ${r.numero}.`,
    `${r.colegio} – ${r.grado}${r.alumno ? ` (alumno: ${r.alumno})` : ""}`,
    `${r.items.length} artículos · Total ${gs(r.total)}`,
    r.total_encargo > 0 ? `A encargar: ${gs(r.total_encargo)}` : "Todo con stock",
    `Entrega: ${r.entrega === "delivery" ? "delivery" : "retiro en el local"}`,
    enlace,
  ];
  return lineas.join("\n");
}

/** /utiles/reserva/U-000123?t=<token>: confirmación y aviso por WhatsApp. */
export default function VerReserva({ numero }: { numero: string }) {
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");
  const [r, setR] = useState<Reserva | null>(null);
  const [enlace, setEnlace] = useState("");
  const [nuevo, setNuevo] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = q.get("t") ?? "";
    if (!/^U-\d{6,}$/.test(numero) || !/^[0-9a-f-]{36}$/i.test(t)) {
      setTimeout(() => setEstado("error"), 0);
      return;
    }
    const url = `${window.location.origin}/utiles/reserva/${numero}?t=${t}`;
    sb.rpc("reserva_utiles_publica", { p_numero: numero, p_token: t }).then(({ data }) => {
      if (!data) return setEstado("error");
      setR(data as Reserva);
      setEnlace(url);
      setNuevo(q.get("nuevo") === "1");
      setEstado("ok");
      if (q.get("nuevo") === "1") window.history.replaceState(null, "", url.replace(window.location.origin, ""));
    });
  }, [numero]);

  if (estado === "cargando") return <p className="text-suave">Cargando reserva…</p>;
  if (estado === "error" || !r)
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-borde bg-white p-6">
        <h1 className="text-xl font-bold">No encontramos la reserva</h1>
        <p className="mt-2 text-suave">El enlace no es válido o está incompleto. Escribinos y la buscamos.</p>
        <a
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-lg bg-[#177a3b] px-4 font-bold text-white"
          href={linkWhatsApp(SITE.whatsapp, `Hola RPM, consulto por mi reserva de útiles ${numero}.`)}
        >
          <IconoWhatsApp className="size-5" /> Escribir por WhatsApp
        </a>
      </div>
    );

  const wa = linkWhatsApp(SITE.whatsapp, mensaje(r, enlace));
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-2xl border border-borde bg-white p-5 md:p-7">
        {nuevo && <p className="mb-2 font-bold text-ok">¡Listo, {r.nombre.split(" ")[0]}! Guardamos tu reserva.</p>}
        <h1 className="text-2xl font-extrabold text-titulo">Reserva {r.numero}</h1>
        <p className="text-suave">
          {r.colegio} · {r.grado}
          {r.alumno && ` · ${r.alumno}`}
        </p>
        <p className="mt-4">
          {nuevo ? "Último paso: avisanos por WhatsApp" : "¿Dudas o cambios? Escribinos por WhatsApp"} y te confirmamos stock, total y{" "}
          {r.entrega === "delivery" ? "el delivery" : "cuándo retirar"}.
        </p>
        <a href={wa} className="mt-3 inline-flex h-12 items-center gap-2 rounded-lg bg-[#177a3b] px-5 font-bold text-white">
          <IconoWhatsApp className="size-5" /> {nuevo ? "Enviar mi reserva por WhatsApp" : "Escribir por WhatsApp"}
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-borde bg-white">
        <ul className="divide-y divide-borde text-sm">
          {r.items.map((i, k) => (
            <li key={k} className="flex items-center gap-3 px-4 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{i.texto}</span>
                <span className="block text-suave">{i.nombre}</span>
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${i.con_stock ? "bg-ok/10 text-ok" : "bg-acento/10 text-acento"}`}>
                {i.con_stock ? "Con stock" : "A encargar"}
              </span>
              <span className="w-10 text-right">{i.cantidad}</span>
              <span className="w-24 text-right font-semibold">{gs(i.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-borde p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-ok">Con stock</span>
            <span>{gs(r.total_con_stock)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-acento">A encargar</span>
            <span>{gs(r.total_encargo)}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-extrabold text-marca">{gs(r.total)}</span>
          </div>
          <p className="pt-1 text-xs text-suave">Precios al público con IVA incluido. La reserva no es una compra: confirmamos todo por WhatsApp.</p>
        </div>
      </div>
      <Link href="/utiles" className="inline-block text-sm text-marca underline">
        Ver otras listas
      </Link>
    </div>
  );
}
