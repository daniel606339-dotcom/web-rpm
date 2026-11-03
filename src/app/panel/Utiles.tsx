"use client";

import { useCallback, useEffect, useState } from "react";
import { gs, linkWhatsApp } from "@/lib/format";
import { sb } from "./cliente";

interface Item {
  linea: number;
  texto: string;
  cod_articulo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  con_stock: boolean;
}
interface Reserva {
  id: number;
  numero: string;
  token: string;
  creado_at: string;
  colegio: string;
  grado: string;
  nombre: string;
  telefono: string;
  email: string | null;
  alumno: string | null;
  entrega: "retiro" | "delivery";
  direccion: string | null;
  observaciones: string | null;
  total_con_stock: number;
  total_encargo: number;
  total: number;
  estado: (typeof ESTADOS)[number];
  nota_interna: string | null;
  actualizado_por: string | null;
  utiles_reserva_items: Item[];
}

const ESTADOS = ["nueva", "contactada", "confirmada", "lista", "entregada", "cancelada"] as const;
const ABIERTOS = ["nueva", "contactada", "confirmada", "lista"];
const COLOR: Record<string, string> = {
  nueva: "bg-acento text-white",
  contactada: "bg-marca text-white",
  confirmada: "bg-marca-oscuro text-white",
  lista: "bg-ok text-white",
  entregada: "bg-[#c9cedb] text-texto",
  cancelada: "bg-[#c9cedb] text-texto line-through",
};
const fecha = (s: string) =>
  new Date(s).toLocaleString("es-PY", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Asuncion" });
const telWa = (t: string) => {
  const d = t.replace(/\D/g, "");
  return d.startsWith("0") ? `595${d.slice(1)}` : d.startsWith("595") ? d : `595${d}`;
};

/** Pestaña "Útiles" del panel: reservas de listas escolares hechas por los padres en /utiles. */
export default function Utiles({ email }: { email: string }) {
  const [lista, setLista] = useState<Reserva[]>([]);
  const [filtro, setFiltro] = useState("abiertas");
  const [abierto, setAbierto] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    const { data, error } = await sb
      .from("utiles_reservas")
      .select("*, utiles_reserva_items(*)")
      .order("creado_at", { ascending: false })
      .limit(500);
    if (error) setError(error.message);
    else {
      setError(null);
      setLista((data ?? []) as Reserva[]);
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

  async function actualizar(r: Reserva, cambios: Partial<Pick<Reserva, "estado" | "nota_interna">>) {
    const { error } = await sb
      .from("utiles_reservas")
      .update({ ...cambios, actualizado_at: new Date().toISOString(), actualizado_por: email })
      .eq("id", r.id);
    if (error) alert(`No se pudo guardar: ${error.message}`);
    else setLista((xs) => xs.map((x) => (x.id === r.id ? { ...x, ...cambios, actualizado_por: email } : x)));
  }

  const visibles = lista.filter((r) => (filtro === "todas" ? true : filtro === "abiertas" ? ABIERTOS.includes(r.estado) : r.estado === filtro));
  const nuevas = lista.filter((r) => r.estado === "nueva").length;
  const abiertas = lista.filter((r) => ABIERTOS.includes(r.estado));

  return (
    <div className="contenedor py-4 md:py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          Reservas de útiles {nuevas > 0 && <span className="ml-2 rounded-full bg-acento px-2.5 py-0.5 text-sm text-white">{nuevas} nuevas</span>}
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="h-10 rounded-lg border border-borde bg-white px-3">
            <option value="abiertas">Abiertas</option>
            <option value="todas">Todas</option>
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
      {abiertas.length > 0 && (
        <p className="mb-3 text-sm text-suave">
          Abiertas: {abiertas.length} · {gs(abiertas.reduce((a, r) => a + r.total, 0))} · a encargar{" "}
          {gs(abiertas.reduce((a, r) => a + r.total_encargo, 0))}
        </p>
      )}
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {cargando ? (
        <p className="text-suave">Cargando…</p>
      ) : visibles.length === 0 ? (
        <p className="rounded-xl border border-borde bg-white p-8 text-center text-suave">No hay reservas en esta vista.</p>
      ) : (
        <ul className="space-y-2">
          {visibles.map((r) => (
            <li key={r.id} className="overflow-hidden rounded-xl border border-borde bg-white">
              <button
                onClick={() => setAbierto(abierto === r.id ? null : r.id)}
                className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 p-3 text-left md:grid-cols-[90px_110px_1fr_130px_110px]"
              >
                <span className="font-bold text-marca">{r.numero}</span>
                <span className="hidden text-sm text-suave md:block">{fecha(r.creado_at)}</span>
                <span className="truncate">
                  <b>{r.nombre}</b>{" "}
                  <span className="text-sm text-suave">
                    · {r.colegio} · {r.grado}
                  </span>
                </span>
                <span className="hidden text-right font-bold md:block">{gs(r.total)}</span>
                <span className={`rounded-full px-2.5 py-1 text-center text-xs font-bold ${COLOR[r.estado]}`}>{r.estado}</span>
              </button>
              {abierto === r.id && <Detalle r={r} onCambio={(c) => actualizar(r, c)} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Detalle({ r, onCambio }: { r: Reserva; onCambio: (c: Partial<Pick<Reserva, "estado" | "nota_interna">>) => void }) {
  const [nota, setNota] = useState(r.nota_interna ?? "");
  const items = [...r.utiles_reserva_items].sort((a, b) => a.linea - b.linea);
  const enlace = `/utiles/reserva/${r.numero}?t=${r.token}`;
  const saludo = `Hola ${r.nombre.split(" ")[0]}, te escribimos de Distribuidora RPM por tu reserva de útiles ${r.numero} (${r.grado}).`;
  return (
    <div className="grid gap-5 border-t border-borde bg-fondo/60 p-4 md:grid-cols-[1fr_320px]">
      <div>
        <table className="w-full text-sm">
          <thead className="text-left text-suave">
            <tr>
              <th className="py-1 font-semibold">Código</th>
              <th className="py-1 font-semibold">Pide la lista / damos</th>
              <th className="py-1 text-right font-semibold">Cant.</th>
              <th className="py-1 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.linea} className="border-t border-borde">
                <td className="py-1.5 pr-2 align-top font-mono text-xs">{i.cod_articulo}</td>
                <td className="py-1.5 pr-2">
                  {i.texto}
                  <span className="block text-xs text-suave">{i.nombre}</span>
                </td>
                <td className="py-1.5 text-right align-top">
                  {i.cantidad}
                  {!i.con_stock && <span className="ml-1 rounded bg-acento px-1 text-[10px] font-bold text-white">ENC</span>}
                </td>
                <td className="py-1.5 text-right align-top font-semibold">{gs(i.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-borde">
              <td colSpan={3} className="py-1 text-right">
                Con stock {gs(r.total_con_stock)} · A encargar {gs(r.total_encargo)} · <b>Total</b>
              </td>
              <td className="py-1 text-right text-lg font-extrabold text-marca">{gs(r.total)}</td>
            </tr>
          </tfoot>
        </table>
        {r.observaciones && (
          <p className="mt-3 rounded-lg bg-white p-3 text-sm">
            <b>Comentario:</b> {r.observaciones}
          </p>
        )}
        <a href={enlace} target="_blank" rel="noopener" className="mt-3 inline-flex h-10 items-center rounded-lg border-[1.5px] border-marca px-4 text-sm font-bold text-marca">
          Ver la reserva como la ve el cliente
        </a>
      </div>
      <div className="space-y-3 text-sm">
        <div className="rounded-lg bg-white p-3 leading-relaxed">
          <p className="font-bold">{r.nombre}</p>
          {r.alumno && <p>Alumno: {r.alumno}</p>}
          <p>
            WhatsApp:{" "}
            <a className="text-marca underline" href={linkWhatsApp(telWa(r.telefono), saludo)} target="_blank" rel="noopener">
              {r.telefono}
            </a>
          </p>
          {r.email && <p>{r.email}</p>}
          <p>Entrega: {r.entrega === "delivery" ? `Delivery — ${r.direccion ?? ""}` : "Retiro en el local"}</p>
        </div>
        <label className="block">
          <span className="mb-1 block font-semibold">Estado</span>
          <select
            value={r.estado}
            onChange={(e) => onCambio({ estado: e.target.value as Reserva["estado"] })}
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
          <textarea
            rows={3}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            onBlur={() => nota !== (r.nota_interna ?? "") && onCambio({ nota_interna: nota })}
            className="w-full rounded-lg border border-borde bg-white p-2"
          />
        </label>
        {r.actualizado_por && <p className="text-xs text-suave">Último cambio: {r.actualizado_por}</p>}
      </div>
    </div>
  );
}
