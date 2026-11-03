"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { gs } from "@/lib/format";
import { sb } from "@/lib/portal";
import type { ArticuloUtil, ListaUtiles, Renglon } from "@/lib/utiles";

const campo =
  "h-12 w-full rounded-[10px] border border-borde bg-white px-3.5 text-base outline-none transition focus:border-marca focus:ring-2 focus:ring-marca/15";
const etiqueta = "mb-1 block text-sm font-semibold text-titulo";

type Opcion = "principal" | "alternativa";
interface Eleccion {
  incluido: boolean;
  cantidad: number;
  opcion: Opcion;
}

const hayStock = (a: ArticuloUtil | null, cant: number) => (a?.stock ?? 0) >= cant;

function inicial(r: Renglon): Eleccion {
  const opcion: Opcion = !hayStock(r.principal, r.cantidad) && r.alternativa && hayStock(r.alternativa, r.cantidad) ? "alternativa" : "principal";
  return { incluido: true, cantidad: r.cantidad, opcion };
}

/** Lista editable: tildar/destildar, cantidades, opción A/B, total en vivo y formulario de reserva. */
export default function EditorLista({ lista }: { lista: ListaUtiles }) {
  const router = useRouter();
  const utiles = lista.renglones.filter((r) => r.tipo === "util");
  const vendibles = utiles.filter((r) => r.principal);
  const sinCatalogo = utiles.filter((r) => !r.principal);
  const fuera = lista.renglones.filter((r) => r.tipo === "fuera");

  const [sel, setSel] = useState<Record<number, Eleccion>>(() => Object.fromEntries(vendibles.map((r) => [r.id, inicial(r)])));
  const cambiar = (id: number, c: Partial<Eleccion>) => setSel((s) => ({ ...s, [id]: { ...s[id], ...c } }));

  const elegidos = vendibles
    .filter((r) => sel[r.id]?.incluido)
    .map((r) => {
      const e = sel[r.id];
      const art = (e.opcion === "alternativa" ? r.alternativa : r.principal) ?? r.principal!;
      const subtotal = (art.precio ?? 0) * e.cantidad;
      return { r, e, art, subtotal, conStock: hayStock(art, e.cantidad) };
    });
  const totalStock = elegidos.filter((x) => x.conStock).reduce((a, x) => a + x.subtotal, 0);
  const totalEncargo = elegidos.filter((x) => !x.conStock).reduce((a, x) => a + x.subtotal, 0);
  const total = totalStock + totalEncargo;
  const todos = elegidos.length === vendibles.length;

  const [f, setF] = useState({ nombre: "", telefono: "", alumno: "", entrega: "retiro", direccion: "", observaciones: "", web: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((x) => ({ ...x, [k]: e.target.value }));
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reservar(ev: React.FormEvent) {
    ev.preventDefault();
    if (f.web) return; // robot
    if (elegidos.length === 0) return setError("Marcá al menos un artículo de la lista.");
    setEnviando(true);
    setError(null);
    const { data, error } = await sb.rpc("crear_reserva_utiles", {
      p: {
        lista_id: lista.id,
        nombre: f.nombre,
        telefono: f.telefono,
        alumno: f.alumno || null,
        entrega: f.entrega,
        direccion: f.entrega === "delivery" ? f.direccion : null,
        observaciones: f.observaciones || null,
        items: elegidos.map((x) => ({ renglon_id: x.r.id, cod: x.art.cod, cantidad: x.e.cantidad })),
      },
    });
    if (error || !data?.ok) {
      setEnviando(false);
      setError(error?.message ?? "No pudimos guardar la reserva. Probá de nuevo o escribinos por WhatsApp.");
      return;
    }
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer?.push({ event: "generate_lead", value: data.total, currency: "PYG", lead_type: "utiles" });
    router.push(`/utiles/reserva/${data.numero}?t=${data.token}&nuevo=1`);
  }

  return (
    <div className="grid gap-6 pb-20 lg:grid-cols-[1fr_360px] lg:pb-0">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-borde bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-borde px-4 py-3">
            <p className="font-bold">
              {elegidos.length} de {vendibles.length} artículos
            </p>
            <button
              type="button"
              className="text-sm font-semibold text-marca underline"
              onClick={() => setSel((s) => Object.fromEntries(vendibles.map((r) => [r.id, { ...s[r.id], incluido: !todos }])))}
            >
              {todos ? "Destildar todo" : "Marcar todo"}
            </button>
          </div>
          <ul className="divide-y divide-borde">
            {vendibles.map((r) => (
              <Fila key={r.id} r={r} e={sel[r.id]} onCambio={(c) => cambiar(r.id, c)} />
            ))}
          </ul>
        </section>

        {sinCatalogo.length > 0 && (
          <section className="rounded-2xl border border-borde bg-white p-4">
            <p className="font-bold">No los tenemos por ahora</p>
            <p className="text-sm text-suave">Estos ítems de la lista no están en nuestro catálogo; conseguilos en otro lado o consultanos.</p>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {sinCatalogo.map((r) => (
                <li key={r.id}>
                  {r.cantidad > 1 && `${r.cantidad} × `}
                  {r.texto}
                </li>
              ))}
            </ul>
          </section>
        )}

        {fuera.length > 0 && (
          <details className="rounded-2xl border border-borde bg-white p-4">
            <summary className="cursor-pointer font-bold">Otros pedidos del colegio que no vendemos ({fuera.length})</summary>
            <ul className="mt-2 list-disc pl-5 text-sm text-suave">
              {fuera.map((r) => (
                <li key={r.id}>{r.texto}</li>
              ))}
            </ul>
          </details>
        )}

        <form id="reservar" onSubmit={reservar} className="space-y-4 rounded-2xl border border-borde bg-white p-5 md:p-7">
          <div>
            <h2 className="text-xl font-bold">Reservar esta lista</h2>
            <p className="text-sm text-suave">
              No pagás nada ahora. Te escribimos por WhatsApp para confirmar y coordinar el retiro o el delivery.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className={etiqueta}>Tu nombre *</span>
              <input required minLength={3} maxLength={120} value={f.nombre} onChange={set("nombre")} className={campo} autoComplete="name" />
            </label>
            <label className="block">
              <span className={etiqueta}>WhatsApp *</span>
              <input required type="tel" value={f.telefono} onChange={set("telefono")} placeholder="0981 000 000" className={campo} autoComplete="tel" />
            </label>
            <label className="block">
              <span className={etiqueta}>Nombre del alumno</span>
              <input maxLength={120} value={f.alumno} onChange={set("alumno")} className={campo} />
            </label>
            <label className="block">
              <span className={etiqueta}>Entrega</span>
              <select value={f.entrega} onChange={set("entrega")} className={campo}>
                <option value="retiro">Retiro en el local (12 de Octubre 521)</option>
                <option value="delivery">Delivery</option>
              </select>
            </label>
            {f.entrega === "delivery" && (
              <label className="block md:col-span-2">
                <span className={etiqueta}>Dirección de entrega *</span>
                <input required minLength={5} maxLength={300} value={f.direccion} onChange={set("direccion")} className={campo} autoComplete="street-address" />
              </label>
            )}
            <label className="block md:col-span-2">
              <span className={etiqueta}>Comentarios</span>
              <textarea rows={2} maxLength={1000} value={f.observaciones} onChange={set("observaciones")} className={`${campo} h-auto py-3`} />
            </label>
            <label className="hidden" aria-hidden>
              Sitio web
              <input tabIndex={-1} autoComplete="off" value={f.web} onChange={set("web")} />
            </label>
          </div>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button
            disabled={enviando || elegidos.length === 0}
            className="h-12 w-full rounded-lg bg-acento font-bold text-white hover:bg-acento-oscuro disabled:opacity-60 md:w-auto md:px-8"
          >
            {enviando ? "Guardando…" : `Reservar · ${gs(total)}`}
          </button>
        </form>
      </div>

      <aside className="hidden h-fit space-y-3 rounded-2xl border border-borde bg-white p-5 lg:sticky lg:top-32 lg:block">
        <Resumen stock={totalStock} encargo={totalEncargo} total={total} n={elegidos.length} />
        <a href="#reservar" className="flex h-12 items-center justify-center rounded-lg bg-acento font-bold text-white hover:bg-acento-oscuro">
          Reservar
        </a>
      </aside>

      {/* Barra fija en el celular */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0 z-30 border-t border-borde bg-white px-4 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,.06)] lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-suave">{elegidos.length} artículos</p>
            <p className="text-lg font-extrabold text-marca">{gs(total)}</p>
          </div>
          <a href="#reservar" className="flex h-11 items-center rounded-lg bg-acento px-5 font-bold text-white">
            Reservar
          </a>
        </div>
      </div>
    </div>
  );
}

function Resumen({ stock, encargo, total, n }: { stock: number; encargo: number; total: number; n: number }) {
  return (
    <div className="space-y-2">
      <p className="font-bold">Tu lista ({n} artículos)</p>
      <div className="flex justify-between text-sm">
        <span className="text-ok">● Con stock</span>
        <span className="font-semibold">{gs(stock)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-acento">● A encargar</span>
        <span className="font-semibold">{gs(encargo)}</span>
      </div>
      <div className="flex items-baseline justify-between border-t border-borde pt-2">
        <span className="text-suave">Total</span>
        <span className="text-2xl font-extrabold text-marca">{gs(total)}</span>
      </div>
      <p className="text-xs text-suave">Precios al público con IVA incluido. Lo que está «a encargar» te lo confirmamos por WhatsApp.</p>
    </div>
  );
}

function Fila({ r, e, onCambio }: { r: Renglon; e: Eleccion; onCambio: (c: Partial<Eleccion>) => void }) {
  const art = (e.opcion === "alternativa" ? r.alternativa : r.principal) ?? r.principal!;
  const conStock = hayStock(art, e.cantidad);
  return (
    <li className={`flex gap-3 px-4 py-3 ${e.incluido ? "" : "bg-fondo/70 opacity-60"}`}>
      <input
        type="checkbox"
        checked={e.incluido}
        onChange={(ev) => onCambio({ incluido: ev.target.checked })}
        aria-label={`Incluir ${r.texto}`}
        className="mt-1 size-5 shrink-0 accent-marca"
      />
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-borde bg-white">
        {art.foto && <Image src={art.foto} alt="" fill sizes="56px" className="object-contain p-1" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug">{r.texto}</p>
        <p className="text-sm text-suave">
          <a href={art.url} target="_blank" rel="noopener" className="hover:underline">
            {art.nombre}
          </a>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
          <span className={`rounded-full px-2 py-0.5 font-bold ${conStock ? "bg-ok/10 text-ok" : "bg-acento/10 text-acento"}`}>
            {conStock ? "Con stock" : "A encargar"}
          </span>
          {r.nota && <span className="rounded-full bg-marca-suave px-2 py-0.5 text-marca">{r.nota}</span>}
        </div>
        {r.alternativa && (
          <div className="mt-2 inline-flex rounded-lg border border-borde p-0.5 text-xs" role="group" aria-label="Elegir opción">
            {(["principal", "alternativa"] as const).map((o, i) => {
              const a = o === "principal" ? r.principal! : r.alternativa!;
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => onCambio({ opcion: o })}
                  className={`rounded-md px-2.5 py-1 font-semibold ${e.opcion === o ? "bg-marca text-white" : "text-suave"}`}
                >
                  Opción {i === 0 ? "A" : "B"} · {gs(a.precio)}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="font-bold">{gs((art.precio ?? 0) * e.cantidad)}</span>
        <span className="flex items-center rounded-lg border border-borde">
          <button type="button" className="h-8 w-8 text-marca" onClick={() => onCambio({ cantidad: Math.max(1, e.cantidad - 1) })} aria-label="Restar uno">
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold">{e.cantidad}</span>
          <button type="button" className="h-8 w-8 text-marca" onClick={() => onCambio({ cantidad: Math.min(999, e.cantidad + 1) })} aria-label="Sumar uno">
            +
          </button>
        </span>
        <span className="text-[11px] text-suave">{gs(art.precio)} c/u</span>
      </div>
    </li>
  );
}
