"use client";

import { useCallback, useEffect, useState } from "react";
import { gs, linkWhatsApp } from "@/lib/format";
import { sb } from "./cliente";

interface Item {
  linea: number;
  cod_articulo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  porc_iva: number;
}
interface Presupuesto {
  id: number;
  numero: string;
  token: string;
  creado_at: string;
  vence_at: string;
  razon_social: string;
  ruc: string;
  contacto: string | null;
  email: string;
  telefono: string;
  observaciones: string | null;
  cod_cliente: string | null;
  total: number;
  estado: "nuevo" | "contactado" | "ganado" | "perdido";
  nota_interna: string | null;
  actualizado_por: string | null;
  presupuesto_items: Item[];
}

const ESTADOS = ["nuevo", "contactado", "ganado", "perdido"] as const;
const COLOR: Record<string, string> = {
  nuevo: "bg-acento text-white",
  contactado: "bg-marca text-white",
  ganado: "bg-ok text-white",
  perdido: "bg-[#c9cedb] text-texto",
};
const fecha = (s: string) =>
  new Date(s).toLocaleString("es-PY", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Asuncion" });
const telWa = (t: string) => {
  const d = t.replace(/\D/g, "");
  return d.startsWith("0") ? `595${d.slice(1)}` : d.startsWith("595") ? d : `595${d}`;
};

/** Pestaña "Presupuestos" del panel: los que piden los clientes desde la web, para seguirlos. */
export default function Presupuestos({ email }: { email: string }) {
  const [lista, setLista] = useState<Presupuesto[]>([]);
  const [filtro, setFiltro] = useState("abiertos");
  const [abierto, setAbierto] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    const { data, error } = await sb.from("presupuestos").select("*, presupuesto_items(*)").order("creado_at", { ascending: false }).limit(300);
    if (error) setError(error.message);
    else {
      setError(null);
      setLista((data ?? []) as Presupuesto[]);
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    const primero = setTimeout(cargar, 0);
    const t = setInterval(cargar, 60000);
    return () => {
      clearTimeout(primero);
      clearInterval(t);
    };
  }, [cargar]);

  async function actualizar(p: Presupuesto, cambios: Partial<Pick<Presupuesto, "estado" | "nota_interna">>) {
    const { error } = await sb
      .from("presupuestos")
      .update({ ...cambios, actualizado_at: new Date().toISOString(), actualizado_por: email })
      .eq("id", p.id);
    if (error) alert(`No se pudo guardar: ${error.message}`);
    else setLista((xs) => xs.map((x) => (x.id === p.id ? { ...x, ...cambios, actualizado_por: email } : x)));
  }

  const visibles = lista.filter((p) =>
    filtro === "todos" ? true : filtro === "abiertos" ? ["nuevo", "contactado"].includes(p.estado) : p.estado === filtro,
  );
  const nuevos = lista.filter((p) => p.estado === "nuevo").length;

  return (
    <div className="contenedor py-4 md:py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          Presupuestos web {nuevos > 0 && <span className="ml-2 rounded-full bg-acento px-2.5 py-0.5 text-sm text-white">{nuevos} nuevos</span>}
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="h-10 rounded-lg border border-borde bg-white px-3">
            <option value="abiertos">Abiertos</option>
            <option value="todos">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e[0].toUpperCase() + e.slice(1)}
              </option>
            ))}
          </select>
          <button onClick={cargar} className="h-10 rounded-lg border border-borde bg-white px-3">
            Actualizar
          </button>
        </div>
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {cargando ? (
        <p className="text-suave">Cargando…</p>
      ) : visibles.length === 0 ? (
        <p className="rounded-xl border border-borde bg-white p-8 text-center text-suave">No hay presupuestos en esta vista.</p>
      ) : (
        <ul className="space-y-2">
          {visibles.map((p) => (
            <li key={p.id} className="overflow-hidden rounded-xl border border-borde bg-white">
              <button
                onClick={() => setAbierto(abierto === p.id ? null : p.id)}
                className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 p-3 text-left md:grid-cols-[90px_110px_1fr_130px_110px]"
              >
                <span className="font-bold text-marca">{p.numero}</span>
                <span className="hidden text-sm text-suave md:block">{fecha(p.creado_at)}</span>
                <span className="truncate">
                  {p.cod_cliente && <span className="mr-1.5 rounded bg-marca px-1.5 py-0.5 text-[11px] font-bold text-white">EMPRESA</span>}
                  <b>{p.razon_social}</b> <span className="text-sm text-suave">· RUC {p.ruc}</span>
                </span>
                <span className="hidden text-right font-bold md:block">{gs(p.total)}</span>
                <span className={`rounded-full px-2.5 py-1 text-center text-xs font-bold ${COLOR[p.estado]}`}>{p.estado}</span>
              </button>
              {abierto === p.id && <Detalle p={p} onCambio={(c) => actualizar(p, c)} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Detalle({ p, onCambio }: { p: Presupuesto; onCambio: (c: Partial<Pick<Presupuesto, "estado" | "nota_interna">>) => void }) {
  const [nota, setNota] = useState(p.nota_interna ?? "");
  const items = [...p.presupuesto_items].sort((a, b) => a.linea - b.linea);
  const enlace = `/presupuesto/${p.numero}?t=${p.token}`;
  return (
    <div className="grid gap-5 border-t border-borde bg-fondo/60 p-4 md:grid-cols-[1fr_320px]">
      <div>
        <table className="w-full text-sm">
          <thead className="text-left text-suave">
            <tr>
              <th className="py-1 font-semibold">Código</th>
              <th className="py-1 font-semibold">Artículo</th>
              <th className="py-1 text-right font-semibold">Cant.</th>
              <th className="py-1 text-right font-semibold">Precio</th>
              <th className="py-1 text-right font-semibold">IVA</th>
              <th className="py-1 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.linea} className="border-t border-borde">
                <td className="py-1.5 pr-2 font-mono text-xs">{i.cod_articulo}</td>
                <td className="py-1.5 pr-2">{i.nombre}</td>
                <td className="py-1.5 text-right">{i.cantidad}</td>
                <td className="py-1.5 text-right">{gs(i.precio)}</td>
                <td className="py-1.5 text-right">{Number(i.porc_iva) >= 10 ? "10%" : Number(i.porc_iva) > 0 ? "5%" : "Ex."}</td>
                <td className="py-1.5 text-right font-semibold">{gs(i.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-borde">
              <td colSpan={5} className="py-1 text-right font-bold">
                Total
              </td>
              <td className="py-1 text-right text-lg font-extrabold text-marca">{gs(p.total)}</td>
            </tr>
          </tfoot>
        </table>
        {p.observaciones && (
          <p className="mt-3 rounded-lg bg-white p-3 text-sm">
            <b>Observaciones del cliente:</b> {p.observaciones}
          </p>
        )}
        <a href={enlace} target="_blank" rel="noopener" className="mt-3 inline-flex h-10 items-center rounded-lg border-[1.5px] border-marca px-4 text-sm font-bold text-marca">
          Ver la hoja del presupuesto (PDF)
        </a>
      </div>
      <div className="space-y-3 text-sm">
        <div className="rounded-lg bg-white p-3 leading-relaxed">
          <p className="font-bold">{p.razon_social}</p>
          <p>RUC: {p.ruc}</p>
          {p.cod_cliente && <p className="text-marca">Cliente del portal · código {p.cod_cliente}</p>}
          {p.contacto && <p>Contacto: {p.contacto}</p>}
          <p>
            Tel.:{" "}
            <a
              className="text-marca underline"
              href={linkWhatsApp(telWa(p.telefono), `Hola ${p.contacto ?? p.razon_social}, te escribimos de RPM por tu presupuesto ${p.numero}.`)}
              target="_blank"
              rel="noopener"
            >
              {p.telefono} (WhatsApp)
            </a>
          </p>
          <p>
            Email:{" "}
            <a className="text-marca underline" href={`mailto:${p.email}?subject=Presupuesto ${p.numero} - Distribuidora RPM`}>
              {p.email}
            </a>
          </p>
          <p className="mt-2 text-suave">Vence: {fecha(p.vence_at)}</p>
        </div>
        <label className="block">
          <span className="mb-1 block font-semibold">Estado</span>
          <select
            value={p.estado}
            onChange={(e) => onCambio({ estado: e.target.value as Presupuesto["estado"] })}
            className="h-10 w-full rounded-lg border border-borde bg-white px-3"
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block font-semibold">Nota interna</span>
          <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={3} className="w-full rounded-lg border border-borde bg-white p-2" />
        </label>
        <button onClick={() => onCambio({ nota_interna: nota })} className="h-9 rounded-lg bg-marca px-4 font-semibold text-white">
          Guardar nota
        </button>
        {p.actualizado_por && <p className="text-xs text-suave">Último cambio: {p.actualizado_por}</p>}
      </div>
    </div>
  );
}
