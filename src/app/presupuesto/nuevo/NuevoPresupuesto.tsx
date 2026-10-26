"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cambiarCantidad, quitar, totalCarrito, useCarrito } from "@/components/carrito";
import { gs } from "@/lib/format";
import { sb, usePortal, type Cuenta } from "@/lib/portal";

const campo =
  "h-12 w-full rounded-[10px] border border-borde bg-white px-3.5 text-base outline-none transition focus:border-marca focus:ring-2 focus:ring-marca/15";
const etiqueta = "mb-1 block text-sm font-semibold text-titulo";

/**
 * Pedir presupuesto: usa los productos del carrito como lista, pide los datos de la empresa
 * y genera el presupuesto (no es una compra). Después muestra la hoja A4 para imprimir o
 * guardar como PDF.
 */
export default function NuevoPresupuesto() {
  const { cuenta } = usePortal();
  // Usuario del portal de empresas: el formulario arranca con los datos de su empresa
  return <Formulario key={cuenta?.cod_cliente ?? "sin-cuenta"} cuenta={cuenta} />;
}

function Formulario({ cuenta }: { cuenta: Cuenta | null }) {
  const items = useCarrito();
  const router = useRouter();
  const [f, setF] = useState(() => ({
    razon_social: cuenta?.razon_social ?? "",
    ruc: cuenta?.ruc ?? "",
    contacto: cuenta?.usuario?.nombre ?? "",
    email: cuenta?.usuario?.email ?? "",
    telefono: "",
    observaciones: "",
    web: "",
  }));
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (f.web) return; // robot
    setEnviando(true);
    setError(null);
    const { data, error } = await sb.rpc("crear_presupuesto", {
      p: { ...f, items: items.map((x) => ({ cod: x.cod, cantidad: x.cantidad })) },
    });
    if (error || !data?.ok) {
      setEnviando(false);
      setError(error?.message ?? "No pudimos generar el presupuesto. Probá de nuevo o escribinos por WhatsApp.");
      return;
    }
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer?.push({ event: "generate_lead", value: totalCarrito(items), currency: "PYG", lead_type: "presupuesto" });
    router.push(`/presupuesto/${data.numero}?t=${data.token}&nuevo=1`);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-borde bg-white p-6 md:p-8">
        <h1 className="text-2xl font-bold">Pedí tu presupuesto</h1>
        <p className="text-suave">Es muy simple y lo recibís al instante:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Buscá los productos y tocá «Agregar al carrito» con las cantidades que necesitás.</li>
          <li>En el carrito, tocá «Pedir presupuesto».</li>
          <li>Completá los datos de tu empresa y listo: lo descargás en PDF y te llega por correo.</li>
        </ol>
        <Link href="/" className="inline-flex h-12 items-center rounded-lg bg-acento px-5 font-bold text-white hover:bg-acento-oscuro">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5 rounded-2xl border border-borde bg-white p-5 md:p-7">
        <div>
          <h1 className="text-2xl font-bold">Pedir presupuesto</h1>
          <p className="mt-1 text-suave">No es una compra: te generamos un presupuesto con validez de 3 días para que lo revises o lo presentes.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className={etiqueta}>Razón social *</span>
            <input required minLength={3} maxLength={150} value={f.razon_social} onChange={set("razon_social")} className={campo} />
          </label>
          <label className="block">
            <span className={etiqueta}>RUC o cédula *</span>
            <input required value={f.ruc} onChange={set("ruc")} placeholder="80000000-0" className={campo} />
          </label>
          <label className="block">
            <span className={etiqueta}>Nombre de contacto</span>
            <input maxLength={120} value={f.contacto} onChange={set("contacto")} className={campo} />
          </label>
          <label className="block">
            <span className={etiqueta}>Correo electrónico *</span>
            <input required type="email" value={f.email} onChange={set("email")} className={campo} />
          </label>
          <label className="block">
            <span className={etiqueta}>Teléfono / WhatsApp *</span>
            <input required type="tel" value={f.telefono} onChange={set("telefono")} placeholder="0981 000 000" className={campo} />
          </label>
          <label className="block md:col-span-2">
            <span className={etiqueta}>Observaciones</span>
            <textarea rows={3} maxLength={1000} value={f.observaciones} onChange={set("observaciones")} className={`${campo} h-auto py-3`} />
          </label>
          <label className="hidden" aria-hidden>
            Sitio web
            <input tabIndex={-1} autoComplete="off" value={f.web} onChange={set("web")} />
          </label>
        </div>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={enviando} className="h-12 w-full rounded-lg bg-marca font-bold text-white hover:bg-marca-oscuro disabled:opacity-60 md:w-auto md:px-8">
          {enviando ? "Generando…" : "Generar presupuesto"}
        </button>
      </div>

      <aside className="h-fit space-y-3 rounded-2xl border border-borde bg-white p-4 lg:sticky lg:top-32">
        <p className="font-bold">Productos ({items.length})</p>
        <ul className="divide-y divide-borde text-sm">
          {items.map((x) => (
            <li key={x.cod} className="flex items-center gap-2 py-2">
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 font-semibold">{x.nombre}</span>
                <span className="text-xs text-suave">{gs(x.precio)} c/u</span>
              </span>
              <span className="flex items-center rounded-lg border border-borde">
                <button type="button" className="h-8 w-8 text-marca" onClick={() => cambiarCantidad(x.cod, x.cantidad - 1)} aria-label="Restar uno">
                  −
                </button>
                <span className="w-9 text-center font-semibold">{x.cantidad}</span>
                <button type="button" className="h-8 w-8 text-marca" onClick={() => cambiarCantidad(x.cod, x.cantidad + 1)} aria-label="Sumar uno">
                  +
                </button>
              </span>
              <button type="button" onClick={() => quitar(x.cod)} className="text-xs text-suave underline" aria-label={`Quitar ${x.nombre}`}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t border-borde pt-3">
          <span className="text-suave">Total estimado</span>
          <span className="text-xl font-extrabold text-marca">{gs(totalCarrito(items))}</span>
        </div>
        {cuenta && <p className="text-xs text-suave">El presupuesto se arma con los precios acordados de tu empresa.</p>}
        <Link href="/" className="block text-center text-sm text-marca underline">
          Agregar más productos
        </Link>
      </aside>
    </form>
  );
}
