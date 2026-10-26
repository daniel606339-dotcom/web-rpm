"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HojaPresupuesto, { type Presupuesto } from "@/components/HojaPresupuesto";
import { IconoWhatsApp } from "@/components/iconos";
import { SITE } from "@/lib/config";
import { linkWhatsApp } from "@/lib/format";
import { cargarEnCarrito, sb } from "@/lib/portal";

/** /presupuesto/P000123?t=<token>: ver, imprimir/guardar como PDF y pasar el presupuesto al carrito. */
export default function VerPresupuesto({ numero }: { numero: string }) {
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");
  const [p, setP] = useState<Presupuesto | null>(null);
  const [enlace, setEnlace] = useState("");
  const [nuevo, setNuevo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [vencido, setVencido] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = q.get("t") ?? "";
    if (!/^P\d{6,}$/.test(numero) || !/^[0-9a-f-]{36}$/i.test(t)) {
      setTimeout(() => setEstado("error"), 0);
      return;
    }
    const url = `${window.location.origin}/presupuesto/${numero}?t=${t}`;
    sb.rpc("presupuesto_publico", { p_numero: numero, p_token: t }).then(({ data }) => {
      if (!data) return setEstado("error");
      setP(data as Presupuesto);
      setVencido(new Date((data as Presupuesto).vence_at).getTime() < Date.now());
      setEnlace(url);
      setNuevo(q.get("nuevo") === "1");
      setEstado("ok");
      if (q.get("nuevo") === "1") window.history.replaceState(null, "", url.replace(window.location.origin, ""));
    });
  }, [numero]);

  async function alCarrito() {
    if (!p) return;
    const faltan = await cargarEnCarrito(p.items.map((i) => ({ cod: i.cod, cantidad: i.cantidad, nombre: i.nombre })));
    setAviso(
      faltan.length === 0
        ? "Listo: todos los productos están en tu carrito."
        : `Cargamos lo disponible. Sin stock suficiente: ${faltan.map((f) => `${f.nombre} (${f.agregado} de ${f.pedido})`).join(", ")}.`,
    );
  }

  if (estado === "cargando") return <p className="text-suave">Cargando presupuesto…</p>;
  if (estado === "error" || !p)
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-borde bg-white p-6">
        <h1 className="text-xl font-bold">No encontramos el presupuesto</h1>
        <p className="mt-2 text-suave">El enlace no es válido o está incompleto. Escribinos y te lo reenviamos.</p>
        <a
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-lg bg-[#177a3b] px-4 font-bold text-white"
          href={linkWhatsApp(SITE.whatsapp, `Hola RPM, necesito el enlace de mi presupuesto ${numero}.`)}
        >
          <IconoWhatsApp className="size-5" /> Escribir por WhatsApp
        </a>
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="no-print space-y-4">
        {nuevo && (
          <div className="rounded-2xl border border-ok/30 bg-ok/10 p-4">
            <p className="font-bold text-ok">✓ Tu presupuesto {p.numero} está listo</p>
            <p className="mt-1 text-sm">Descargalo en PDF o guardá este enlace: desde acá podés convertirlo en pedido cuando quieras.</p>
          </div>
        )}
        {vencido && (
          <p className="rounded-xl bg-[#fff4ee] p-3 text-sm text-[#8a2e00]">
            Este presupuesto venció. Los precios pueden haber cambiado: al cargarlo en el carrito vas a ver los precios de hoy.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => window.print()} className="h-11 rounded-lg bg-marca px-5 font-bold text-white hover:bg-marca-oscuro">
            Descargar PDF / Imprimir
          </button>
          <button onClick={alCarrito} className="h-11 rounded-lg bg-acento px-5 font-bold text-white hover:bg-acento-oscuro">
            Hacer el pedido con estos productos
          </button>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(enlace);
                setCopiado(true);
              } catch {
                window.prompt("Copiá el enlace del presupuesto:", enlace);
              }
            }}
            className="h-11 rounded-lg border border-borde bg-white px-4 font-semibold"
          >
            {copiado ? "Enlace copiado ✓" : "Copiar enlace"}
          </button>
          <a
            href={linkWhatsApp(SITE.whatsapp, `Hola RPM, tengo una consulta sobre el presupuesto ${p.numero}.`)}
            target="_blank"
            rel="noopener"
            className="flex h-11 items-center gap-2 rounded-lg border border-borde bg-white px-4 font-semibold text-[#128c4a]"
          >
            <IconoWhatsApp className="size-5" /> Consultar
          </a>
        </div>
        {aviso && (
          <p className="flex flex-wrap items-center gap-3 rounded-xl bg-ok/10 p-3 text-sm text-ok">
            {aviso}
            <Link href="/carrito" className="font-bold underline">
              Ir al carrito
            </Link>
          </p>
        )}
        <p className="text-xs text-suave">Para guardarlo como PDF, en la ventana de impresión elegí «Guardar como PDF».</p>
      </div>
      <div className="contenedor-hoja overflow-x-auto rounded-xl bg-fondo p-2 md:p-6">
        <div className="mx-auto w-fit shadow-lg">
          <HojaPresupuesto p={p} enlace={enlace} />
        </div>
      </div>
    </div>
  );
}
