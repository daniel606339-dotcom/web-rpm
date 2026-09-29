"use client";

import { createClient, type Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SUPABASE } from "@/lib/config";
import { gs, linkWhatsApp } from "@/lib/format";
import { COLUMNAS_EXCEL, hojaPedido } from "@/lib/excelPedido";

const sb = createClient(SUPABASE.url, SUPABASE.key, { db: { schema: "web" } });

interface Item {
  linea: number;
  cod_articulo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}
interface Pedido {
  id: number;
  numero: string;
  creado_at: string;
  estado: string;
  nombre: string;
  ruc: string;
  telefono: string;
  email: string | null;
  localidad: string;
  direccion: string | null;
  referencias: string | null;
  lat: number | null;
  lng: number | null;
  metodo_pago: string;
  observaciones: string | null;
  subtotal: number;
  costo_envio: number;
  total: number;
  nota_interna: string | null;
  actualizado_por: string | null;
  pedido_items: Item[];
}

const ESTADOS = ["nuevo", "confirmado", "pagado", "facturado", "enviado", "entregado", "cancelado"] as const;
const COLOR: Record<string, string> = {
  nuevo: "bg-acento text-white",
  confirmado: "bg-marca text-white",
  pagado: "bg-[#0b7a75] text-white",
  facturado: "bg-[#5b3fa8] text-white",
  enviado: "bg-[#b36b00] text-white",
  entregado: "bg-ok text-white",
  cancelado: "bg-[#c9cedb] text-texto",
};

const fecha = (s: string) =>
  new Date(s).toLocaleString("es-PY", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Asuncion" });

function telWa(t: string) {
  const d = t.replace(/\D/g, "");
  return d.startsWith("0") ? `595${d.slice(1)}` : d.startsWith("595") ? d : `595${d}`;
}

export default function Panel() {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargandoSesion(false);
    });
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSesion(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (cargandoSesion) return <div className="contenedor py-10 text-suave">Cargando…</div>;
  if (!sesion) return <Login />;
  return <Lista email={sesion.user.email ?? ""} />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  return (
    <div className="contenedor py-10">
      <form
        className="mx-auto max-w-sm space-y-4 rounded-2xl border border-borde bg-white p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setEnviando(true);
          setError(null);
          const { error } = await sb.auth.signInWithPassword({ email, password: clave });
          if (error) setError("Email o contraseña incorrectos.");
          setEnviando(false);
        }}
      >
        <h1 className="text-xl font-bold">Panel de pedidos</h1>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Email</span>
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-lg border border-borde px-3" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Contraseña</span>
          <input type="password" required autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} className="h-11 w-full rounded-lg border border-borde px-3" />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button disabled={enviando} className="h-11 w-full rounded-lg bg-marca font-bold text-white disabled:opacity-60">
          {enviando ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

function Lista({ email }: { email: string }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtro, setFiltro] = useState<string>("activos");
  const [abierto, setAbierto] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    const { data, error } = await sb
      .from("pedidos")
      .select("*, pedido_items(*)")
      .order("creado_at", { ascending: false })
      .limit(300);
    if (error) setError(error.message);
    else {
      setError(null);
      setPedidos((data ?? []) as Pedido[]);
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

  const visibles = useMemo(
    () =>
      pedidos.filter((p) =>
        filtro === "todos" ? true : filtro === "activos" ? !["entregado", "cancelado"].includes(p.estado) : p.estado === filtro,
      ),
    [pedidos, filtro],
  );
  const nuevos = pedidos.filter((p) => p.estado === "nuevo").length;

  async function actualizar(p: Pedido, cambios: Partial<Pick<Pedido, "estado" | "nota_interna">>) {
    const { error } = await sb
      .from("pedidos")
      .update({ ...cambios, actualizado_at: new Date().toISOString(), actualizado_por: email })
      .eq("id", p.id);
    if (error) alert(`No se pudo guardar: ${error.message}`);
    else setPedidos((xs) => xs.map((x) => (x.id === p.id ? { ...x, ...cambios, actualizado_por: email } : x)));
  }

  return (
    <div className="contenedor py-4 md:py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          Pedidos web {nuevos > 0 && <span className="ml-2 rounded-full bg-acento px-2.5 py-0.5 text-sm text-white">{nuevos} nuevos</span>}
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="h-10 rounded-lg border border-borde bg-white px-3">
            <option value="activos">Pendientes</option>
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
          <button onClick={() => sb.auth.signOut()} className="h-10 px-2 text-suave underline">
            Salir
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error.includes("permission") || error.includes("denied")
            ? `El usuario ${email} no tiene permiso para ver pedidos. Hay que agregarlo en la tabla web.staff.`
            : error}
        </p>
      )}
      {cargando ? (
        <p className="text-suave">Cargando…</p>
      ) : visibles.length === 0 ? (
        <p className="rounded-xl border border-borde bg-white p-8 text-center text-suave">No hay pedidos en esta vista.</p>
      ) : (
        <ul className="space-y-2">
          {visibles.map((p) => (
            <li key={p.id} className="overflow-hidden rounded-xl border border-borde bg-white">
              <button
                onClick={() => setAbierto(abierto === p.id ? null : p.id)}
                className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 p-3 text-left md:grid-cols-[90px_110px_1fr_160px_130px_110px]"
              >
                <span className="font-bold text-marca">{p.numero}</span>
                <span className="hidden text-sm text-suave md:block">{fecha(p.creado_at)}</span>
                <span className="truncate">
                  <b>{p.nombre}</b> <span className="text-sm text-suave">· RUC {p.ruc}</span>
                </span>
                <span className="hidden truncate text-sm text-suave md:block">{p.localidad}</span>
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

/** Excel para el ERP, mismo formato que el export de Porta (ver lib/excelPedido). */
async function descargarExcel(p: Pedido) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const items = [...p.pedido_items].sort((a, b) => a.linea - b.linea);
  await writeXlsxFile(hojaPedido(items), { sheet: p.numero, columns: COLUMNAS_EXCEL }).toFile(`${p.numero}.xlsx`);
}

function Detalle({ p, onCambio }: { p: Pedido; onCambio: (c: Partial<Pick<Pedido, "estado" | "nota_interna">>) => void }) {
  const [nota, setNota] = useState(p.nota_interna ?? "");
  const items = [...p.pedido_items].sort((a, b) => a.linea - b.linea);
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
                <td className="py-1.5 text-right font-semibold">{gs(i.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-borde">
              <td colSpan={4} className="py-1 text-right text-suave">Envío ({p.localidad})</td>
              <td className="py-1 text-right">{gs(p.costo_envio)}</td>
            </tr>
            <tr>
              <td colSpan={4} className="py-1 text-right font-bold">Total</td>
              <td className="py-1 text-right text-lg font-extrabold text-marca">{gs(p.total)}</td>
            </tr>
          </tfoot>
        </table>
        {p.observaciones && <p className="mt-3 rounded-lg bg-white p-3 text-sm"><b>Observaciones del cliente:</b> {p.observaciones}</p>}
        <button
          onClick={() => descargarExcel(p).catch(() => alert("No se pudo generar el Excel."))}
          className="mt-3 flex h-10 items-center gap-2 rounded-lg border-[1.5px] border-ok px-4 text-sm font-bold text-ok hover:bg-ok/10"
        >
          ⬇ Descargar Excel para el ERP ({p.numero}.xlsx)
        </button>
      </div>
      <div className="space-y-3 text-sm">
        <div className="rounded-lg bg-white p-3 leading-relaxed">
          <p className="font-bold">{p.nombre}</p>
          <p>RUC/CI: {p.ruc}</p>
          <p>
            Tel.:{" "}
            <a className="text-marca underline" href={linkWhatsApp(telWa(p.telefono), `Hola ${p.nombre}, te escribimos de RPM por tu pedido ${p.numero}.`)} target="_blank" rel="noopener">
              {p.telefono} (WhatsApp)
            </a>
          </p>
          {p.email && <p>Email: <a className="text-marca underline" href={`mailto:${p.email}`}>{p.email}</a></p>}
          <p className="mt-2">{p.localidad}</p>
          {p.direccion && <p>{p.direccion}</p>}
          {p.referencias && <p className="text-suave">Ref.: {p.referencias}</p>}
          {p.lat != null && p.lng != null && (
            <a className="text-marca underline" href={`https://www.google.com/maps?q=${p.lat},${p.lng}`} target="_blank" rel="noopener">
              Ver ubicación GPS
            </a>
          )}
          <p className="mt-2 text-suave">Pago: {p.metodo_pago}</p>
        </div>
        <label className="block">
          <span className="mb-1 block font-semibold">Estado</span>
          <select value={p.estado} onChange={(e) => onCambio({ estado: e.target.value })} className="h-10 w-full rounded-lg border border-borde bg-white px-3">
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
