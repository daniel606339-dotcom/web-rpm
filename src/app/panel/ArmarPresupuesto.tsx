"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SUPABASE } from "@/lib/config";
import { gs } from "@/lib/format";
import { sb } from "./cliente";

interface Cliente {
  cod_cliente: string;
  razon_social: string;
  ruc: string;
  tip_cliente: string | null;
  cod_lista_precio: string | null;
  email: string | null;
  telefono: string | null;
}
interface Candidato {
  cod_articulo: string;
  nombre: string;
  precio_lista: number;
  precio: number;
  regla: string;
  cant_dispon: number;
  porc_iva: number;
}
interface Fila {
  clave: string;
  texto: string;
  cod: string | null;
  cantidad: number;
  coincidencia: "igual" | "equivalente" | "no_trabajamos" | "manual";
  nota: string;
  candidatos: Candidato[];
  precio: number | null;
  precioManual: boolean;
}

const campo = "h-10 w-full rounded-lg border border-borde bg-white px-3 text-sm outline-none focus:border-marca";
const clave = () => Math.random().toString(36).slice(2);
/** Artículo "Servicio de Envio" de Inventiva: no está en la tienda, el monto lo escribe la vendedora. */
const ENVIO = "0000000000736";
const filaEnvio = (): Fila => ({
  clave: clave(),
  texto: "",
  cod: ENVIO,
  cantidad: 1,
  coincidencia: "manual",
  nota: "",
  candidatos: [{ cod_articulo: ENVIO, nombre: "Servicio de Envío", precio_lista: 0, precio: 0, regla: "Envío: escribí el monto", cant_dispon: 1, porc_iva: 10 }],
  precio: null,
  precioManual: true,
});
const ETIQUETA: Record<Fila["coincidencia"], string> = {
  igual: "bg-ok/10 text-ok",
  equivalente: "bg-[#fff4ed] text-[#a33600]",
  no_trabajamos: "bg-red-50 text-red-700",
  manual: "bg-marca-suave text-marca",
};
const TEXTO_ETIQUETA: Record<Fila["coincidencia"], string> = {
  igual: "Igual",
  equivalente: "Equivalente",
  no_trabajamos: "No trabajamos",
  manual: "Elegido a mano",
};

function aBase64(f: File): Promise<string> {
  return new Promise((ok, mal) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(",")[1] ?? "");
    r.onerror = () => mal(r.error);
    r.readAsDataURL(f);
  });
}

/**
 * Generador de presupuestos para vendedoras: lee el mensaje del cliente con IA, sugiere los artículos,
 * calcula los precios de la lista del cliente y guarda el presupuesto con la hoja A4 de siempre.
 * Se puede editar hasta que se envíe al ERP.
 */
export default function ArmarPresupuesto({ presupuestoId, onListo }: { presupuestoId: number | null; onListo: () => void }) {
  const [vendedor, setVendedor] = useState<{ nombre: string | null; cod_vendedor: string | null } | null>(null);
  const [id, setId] = useState<number | null>(presupuestoId);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [sinCliente, setSinCliente] = useState({ razon_social: "", ruc: "" });
  const [datos, setDatos] = useState({ contacto: "", email: "", telefono: "", observaciones: "" });
  const [q, setQ] = useState("");
  const [encontrados, setEncontrados] = useState<Cliente[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [filas, setFilas] = useState<Fila[]>([]);
  const [leyendo, setLeyendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enlace, setEnlace] = useState<string | null>(null);
  const archivoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    sb.rpc("mi_staff").then(({ data }) => setVendedor((data as { nombre: string | null; cod_vendedor: string | null }) ?? null));
  }, []);

  // Editar uno existente
  useEffect(() => {
    if (!presupuestoId) return;
    (async () => {
      const { data: p } = await sb.from("presupuestos").select("*, presupuesto_items(*)").eq("id", presupuestoId).single();
      if (!p) return;
      if (p.cod_cliente) {
        const { data: c } = await sb.from("clientes").select("cod_cliente,razon_social,ruc,tip_cliente,cod_lista_precio,email,telefono").eq("cod_cliente", p.cod_cliente).maybeSingle();
        setCliente((c as Cliente) ?? null);
      } else setSinCliente({ razon_social: p.razon_social ?? "", ruc: p.ruc ?? "" });
      setDatos({ contacto: p.contacto ?? "", email: p.email ?? "", telefono: p.telefono ?? "", observaciones: p.observaciones ?? "" });
      setMensaje(p.mensaje_cliente ?? "");
      setEnlace(`/presupuesto/${p.numero}?t=${p.token}`);
      const items = [...(p.presupuesto_items ?? [])].sort((a: { linea: number }, b: { linea: number }) => a.linea - b.linea);
      setFilas(
        items.map((i: { texto_cliente: string | null; cod_articulo: string; nombre: string; cantidad: number; precio: number; coincidencia: string | null; nota: string | null; precio_manual: boolean; porc_iva: number }) => ({
          clave: clave(),
          texto: i.texto_cliente ?? "",
          cod: i.cod_articulo,
          cantidad: i.cantidad,
          coincidencia: (i.coincidencia as Fila["coincidencia"]) ?? "manual",
          nota: i.nota ?? "",
          candidatos: [{ cod_articulo: i.cod_articulo, nombre: i.nombre, precio_lista: i.precio, precio: i.precio, regla: "", cant_dispon: 0, porc_iva: i.porc_iva }],
          precio: i.precio,
          precioManual: i.precio_manual,
        })),
      );
    })();
  }, [presupuestoId]);

  async function buscarCliente() {
    const t = q.trim();
    if (t.length < 2) return;
    const base = t.replace(/\D/g, "");
    let consulta = sb.from("clientes").select("cod_cliente,razon_social,ruc,tip_cliente,cod_lista_precio,email,telefono").limit(15);
    consulta = /^\d+$/.test(t) && t.length <= 6 ? consulta.or(`cod_cliente.eq.${t},ruc.like.${t}*`) : base.length >= 5 && /^[\d.\-\s]+$/.test(t) ? consulta.like("ruc", `${base}*`) : consulta.ilike("razon_social", `%${t}%`);
    const { data } = await consulta;
    setEncontrados((data ?? []) as Cliente[]);
    if (!data?.length) setAviso("No está en la copia de Inventiva. Si es nuevo, cargalo en el ERP: aparece acá en la próxima sincronización (cada hora). Mientras, podés armarlo sin cliente con lista 6.");
    else setAviso(null);
  }

  // Precios según cliente y cantidad (lo calcula Supabase con las reglas de cada lista)
  const recalcular = useCallback(
    async (lista: Fila[], cli: Cliente | null) => {
      const items = lista.filter((f) => f.cod).map((f) => ({ cod: f.cod, cantidad: f.cantidad }));
      if (!items.length) return;
      const { data } = await sb.rpc("precios_cliente_vendedor", { p_cod_cliente: cli?.cod_cliente ?? "", p_items: items });
      const precios = new Map(((data ?? []) as { cod: string; cantidad: number; precio: number; cant_dispon: number; nombre: string; regla: string; porc_iva: number; precio_lista: number }[]).map((r) => [`${r.cod}|${r.cantidad}`, r]));
      setFilas((xs) =>
        xs.map((f) => {
          const p = f.cod ? precios.get(`${f.cod}|${f.cantidad}`) : undefined;
          if (!p) return f;
          const cands = f.candidatos.some((c) => c.cod_articulo === f.cod)
            ? f.candidatos.map((c) => (c.cod_articulo === f.cod ? { ...c, precio: p.precio, regla: p.regla, cant_dispon: p.cant_dispon } : c))
            : [{ cod_articulo: f.cod!, nombre: p.nombre, precio_lista: p.precio_lista, precio: p.precio, regla: p.regla, cant_dispon: p.cant_dispon, porc_iva: p.porc_iva }, ...f.candidatos];
          return { ...f, candidatos: cands, precio: f.precioManual ? f.precio : Number(p.precio) };
        }),
      );
    },
    [],
  );

  useEffect(() => {
    const t = setTimeout(() => recalcular(filas, cliente), 400);
    return () => clearTimeout(t);
    // solo cuando cambian cliente, artículos o cantidades
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente, filas.map((f) => `${f.cod}|${f.cantidad}`).join(",")]);

  async function leerConIA() {
    setError(null);
    setLeyendo(true);
    try {
      const token = (await sb.auth.getSession()).data.session?.access_token;
      const body: Record<string, unknown> = { texto: mensaje, cod_cliente: cliente?.cod_cliente ?? null };
      if (archivo) {
        if (archivo.size > 8 * 1024 * 1024) throw new Error("El archivo pesa más de 8 MB");
        body.archivo = { data: await aBase64(archivo), tipo: archivo.type };
      }
      const r = await fetch(`${SUPABASE.url}/functions/v1/presupuesto-ia`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE.key, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? `Error ${r.status}`);
      const nuevas: Fila[] = (d.renglones ?? []).map((x: { texto: string; cantidad: number; cod: string | null; coincidencia: Fila["coincidencia"]; nota: string; candidatos: Candidato[] }) => ({
        clave: clave(),
        texto: x.texto,
        cod: x.cod,
        cantidad: x.cantidad,
        coincidencia: x.coincidencia,
        nota: x.nota,
        candidatos: x.candidatos,
        precio: x.candidatos.find((c) => c.cod_articulo === x.cod)?.precio ?? null,
        precioManual: false,
      }));
      setFilas((xs) => [...xs, ...nuevas]);
      if (d.cliente && !cliente) {
        setSinCliente((s) => ({ razon_social: s.razon_social || d.cliente.razon_social || "", ruc: s.ruc || d.cliente.ruc || "" }));
        setDatos((s) => ({ ...s, contacto: s.contacto || d.cliente.contacto || "", email: s.email || d.cliente.email || "", telefono: s.telefono || d.cliente.telefono || "" }));
        if (d.cliente.ruc) setQ(d.cliente.ruc);
      }
      if (!nuevas.length) setAviso("La IA no encontró productos en el mensaje.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLeyendo(false);
    }
  }

  const cambiar = (k: string, c: Partial<Fila>) => setFilas((xs) => xs.map((f) => (f.clave === k ? { ...f, ...c } : f)));

  // Mismo artículo en más de un renglón: casi siempre es un error de elección (otra medida, otro color)
  const primeraFila = new Map<string, { clave: string; pos: number }>();
  filas.forEach((f, i) => {
    if (f.cod && !primeraFila.has(f.cod)) primeraFila.set(f.cod, { clave: f.clave, pos: i + 1 });
  });
  const repetidas = filas.filter((f) => f.cod && primeraFila.get(f.cod)?.clave !== f.clave).length;

  function unir(f: Fila) {
    const primera = f.cod ? primeraFila.get(f.cod) : undefined;
    if (!primera || primera.clave === f.clave) return;
    setFilas((xs) =>
      xs.filter((x) => x.clave !== f.clave).map((x) => (x.clave === primera.clave ? { ...x, cantidad: x.cantidad + f.cantidad } : x)),
    );
  }

  async function guardar(final: boolean) {
    setError(null);
    const validas = filas.filter((f) => f.cod);
    if (!validas.length) return setError("No hay artículos elegidos.");
    if (validas.some((f) => f.cod === ENVIO && !f.precio)) return setError("Escribí el monto del envío.");
    if (final && repetidas > 0)
      return setError("Hay artículos repetidos (marcados en rojo). Elegí otro artículo si es un producto distinto, o tocá «Unir cantidades».");
    if (!cliente && (!sinCliente.razon_social.trim() || !sinCliente.ruc.trim())) return setError("Elegí el cliente o escribí razón social y RUC.");
    setGuardando(true);
    const { data, error } = await sb.rpc("guardar_presupuesto_vendedor", {
      p: {
        id,
        final,
        cod_cliente: cliente?.cod_cliente ?? null,
        razon_social: sinCliente.razon_social,
        ruc: sinCliente.ruc,
        ...datos,
        mensaje_cliente: mensaje,
        items: validas.map((f) => ({
          cod: f.cod,
          cantidad: f.cantidad,
          texto_cliente: f.cod === ENVIO ? "" : f.texto,
          coincidencia: f.coincidencia,
          nota: f.nota,
          precio_manual: f.precioManual,
          precio: f.precio,
        })),
      },
    });
    setGuardando(false);
    if (error) return setError(error.message);
    setId(data.id);
    setEnlace(`/presupuesto/${data.numero}?t=${data.token}`);
    setAviso(final ? `Presupuesto ${data.numero} listo. Abrilo para descargar el PDF o enviarle el enlace al cliente.` : `Borrador ${data.numero} guardado.`);
    if (final) onListo();
  }

  const total = filas.reduce((s, f) => s + (f.cod && f.precio ? f.precio * f.cantidad : 0), 0);
  const sinArticulo = filas.filter((f) => !f.cod).length;

  return (
    <div className="space-y-5">
      {vendedor && !vendedor.cod_vendedor && (
        <p className="rounded-lg bg-[#fff4ed] p-3 text-sm text-[#8a2e00]">Tu usuario no tiene código de vendedor asignado: pedile a sistemas que lo cargue.</p>
      )}

      {/* 1. Cliente */}
      <section className="space-y-3 rounded-xl border border-borde bg-white p-4">
        <h2 className="font-bold">1. Cliente</h2>
        {cliente ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-fondo p-3 text-sm">
            <span>
              <b>{cliente.cod_cliente}</b> · {cliente.razon_social} · RUC {cliente.ruc}
              <span className="ml-2 rounded bg-marca px-1.5 py-0.5 text-[11px] font-bold text-white">
                {cliente.cod_lista_precio && cliente.cod_lista_precio !== "6" ? `Lista ${cliente.cod_lista_precio}` : "Lista 6"}
              </span>
            </span>
            <button onClick={() => setCliente(null)} className="text-suave underline">
              Cambiar
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && buscarCliente()} placeholder="RUC, razón social o código de cliente" className={campo} />
              <button onClick={buscarCliente} className="h-10 rounded-lg bg-marca px-4 text-sm font-bold text-white">
                Buscar
              </button>
            </div>
            {encontrados.length > 0 && (
              <ul className="divide-y divide-borde rounded-lg border border-borde text-sm">
                {encontrados.map((c) => (
                  <li key={c.cod_cliente}>
                    <button
                      onClick={() => {
                        setCliente(c);
                        setEncontrados([]);
                        setDatos((d) => ({ ...d, email: d.email || c.email || "", telefono: d.telefono || c.telefono || "" }));
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-fondo"
                    >
                      <b>{c.cod_cliente}</b> · {c.razon_social} · {c.ruc} {c.cod_lista_precio && c.cod_lista_precio !== "6" ? `· Lista ${c.cod_lista_precio}` : ""}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid gap-2 md:grid-cols-2">
              <input value={sinCliente.razon_social} onChange={(e) => setSinCliente((s) => ({ ...s, razon_social: e.target.value }))} placeholder="Sin cliente en el ERP: razón social" className={campo} />
              <input value={sinCliente.ruc} onChange={(e) => setSinCliente((s) => ({ ...s, ruc: e.target.value }))} placeholder="RUC" className={campo} />
            </div>
            <p className="text-xs text-suave">Sin cliente elegido, el presupuesto sale con lista 6. Para enviarlo al ERP hace falta el cliente cargado en Inventiva.</p>
          </>
        )}
        <div className="grid gap-2 md:grid-cols-3">
          <input value={datos.contacto} onChange={(e) => setDatos((d) => ({ ...d, contacto: e.target.value }))} placeholder="Contacto (atención a)" className={campo} />
          <input value={datos.email} onChange={(e) => setDatos((d) => ({ ...d, email: e.target.value }))} placeholder="Correo" className={campo} />
          <input value={datos.telefono} onChange={(e) => setDatos((d) => ({ ...d, telefono: e.target.value }))} placeholder="Teléfono" className={campo} />
        </div>
      </section>

      {/* 2. Mensaje */}
      <section className="space-y-3 rounded-xl border border-borde bg-white p-4">
        <h2 className="font-bold">2. Pedido del cliente</h2>
        <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={5} placeholder="Pegá acá el mensaje de WhatsApp o del correo…" className="w-full rounded-lg border border-borde p-3 text-sm outline-none focus:border-marca" />
        <div className="flex flex-wrap items-center gap-2">
          <input ref={archivoRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
          <button onClick={() => archivoRef.current?.click()} className="h-10 rounded-lg border border-borde px-3 text-sm">
            {archivo ? `📎 ${archivo.name}` : "Adjuntar PDF o foto"}
          </button>
          {archivo && (
            <button onClick={() => setArchivo(null)} className="text-xs text-suave underline">
              Quitar archivo
            </button>
          )}
          <button onClick={leerConIA} disabled={leyendo || (!mensaje.trim() && !archivo)} className="h-10 rounded-lg bg-acento px-4 text-sm font-bold text-white disabled:opacity-50">
            {leyendo ? "Leyendo y buscando artículos…" : "Leer con IA y sugerir artículos"}
          </button>
          <button onClick={() => setFilas((xs) => [...xs, { clave: clave(), texto: "", cod: null, cantidad: 1, coincidencia: "manual", nota: "", candidatos: [], precio: null, precioManual: false }])} className="h-10 rounded-lg border border-borde px-3 text-sm">
            + Renglón a mano
          </button>
          <button onClick={() => setFilas((xs) => [...xs, filaEnvio()])} className="h-10 rounded-lg border border-borde px-3 text-sm">
            + Costo de envío
          </button>
        </div>
      </section>

      {/* 3. Renglones */}
      {filas.length > 0 && (
        <section className="space-y-3 rounded-xl border border-borde bg-white p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">3. Revisá los artículos</h2>
            {sinArticulo > 0 && <span className="text-sm text-red-700">{sinArticulo} renglón(es) sin artículo: no van al presupuesto</span>}
            {repetidas > 0 && <span className="text-sm font-bold text-red-700">{repetidas} artículo(s) repetido(s): revisalos antes de generar</span>}
          </div>
          <ul className="space-y-3">
            {filas.map((f) => (
              <FilaEditor
                key={f.clave}
                f={f}
                codCliente={cliente?.cod_cliente ?? null}
                repetidoDe={f.cod && primeraFila.get(f.cod)?.clave !== f.clave ? primeraFila.get(f.cod)?.pos : undefined}
                onCambio={(c) => cambiar(f.clave, c)}
                onQuitar={() => setFilas((xs) => xs.filter((x) => x.clave !== f.clave))}
                onUnir={() => unir(f)}
              />
            ))}
          </ul>
          <div className="flex items-baseline justify-end gap-3 border-t border-borde pt-3">
            <span className="text-suave">Total (IVA incluido)</span>
            <span className="text-2xl font-extrabold text-marca">{gs(total)}</span>
          </div>
          <textarea value={datos.observaciones} onChange={(e) => setDatos((d) => ({ ...d, observaciones: e.target.value }))} rows={2} placeholder="Observaciones que salen en el presupuesto" className="w-full rounded-lg border border-borde p-3 text-sm" />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => guardar(false)} disabled={guardando} className="h-11 rounded-lg border-2 border-marca px-4 font-bold text-marca disabled:opacity-50">
              Guardar borrador
            </button>
            <button onClick={() => guardar(true)} disabled={guardando} className="h-11 rounded-lg bg-marca px-5 font-bold text-white disabled:opacity-50">
              {guardando ? "Guardando…" : "Generar presupuesto"}
            </button>
            {enlace && (
              <a href={enlace} target="_blank" rel="noopener" className="flex h-11 items-center rounded-lg border border-borde px-4 font-semibold">
                Ver hoja A4 / PDF
              </a>
            )}
          </div>
        </section>
      )}
      {aviso && <p className="rounded-lg bg-fondo p-3 text-sm">{aviso}</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}

function FilaEditor({
  f,
  codCliente,
  repetidoDe,
  onCambio,
  onQuitar,
  onUnir,
}: {
  f: Fila;
  codCliente: string | null;
  repetidoDe?: number;
  onCambio: (c: Partial<Fila>) => void;
  onQuitar: () => void;
  onUnir: () => void;
}) {
  const [busca, setBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const elegido = f.candidatos.find((c) => c.cod_articulo === f.cod);
  const esRepetido = repetidoDe !== undefined;

  async function buscar() {
    if (busca.trim().length < 2) return;
    setBuscando(true);
    const { data } = await sb.rpc("buscar_articulos_vendedor", { p_q: busca, p_cod_cliente: codCliente, p_limite: 12 });
    setBuscando(false);
    const nuevos = (data ?? []) as Candidato[];
    if (nuevos.length) onCambio({ candidatos: [...nuevos, ...f.candidatos.filter((c) => !nuevos.some((n) => n.cod_articulo === c.cod_articulo))], cod: nuevos[0].cod_articulo, coincidencia: "manual", precio: Number(nuevos[0].precio), precioManual: false });
  }

  return (
    <li className={`rounded-lg border p-3 ${esRepetido ? "border-2 border-red-600 bg-red-50/40" : "border-borde"}`}>
      {esRepetido && (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
          <span>Este artículo ya está en el renglón {repetidoDe}. Si el cliente pidió otro producto (otra medida o color), elegí otro.</span>
          <button onClick={onUnir} className="rounded bg-white px-2 py-0.5 text-red-700">
            Unir cantidades
          </button>
        </div>
      )}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        {f.cod === ENVIO ? (
          <span className="text-suave">Costo de envío</span>
        ) : (
          <label className="flex min-w-0 flex-1 items-center gap-1.5 text-suave" title="Lo que escribió el cliente. Con esto el sistema aprende qué artículo corresponde.">
            Pidió:
            <input
              value={f.texto}
              onChange={(e) => onCambio({ texto: e.target.value })}
              placeholder="Lo que escribió el cliente (para que el sistema aprenda)"
              className={`h-8 min-w-0 flex-1 rounded border px-2 font-bold text-texto ${f.texto ? "border-transparent bg-transparent hover:border-borde focus:border-marca" : "border-acento bg-white"}`}
            />
          </label>
        )}
        <span className="flex items-center gap-2">
          {elegido && Number(elegido.cant_dispon) <= 0 && f.candidatos.length > 1 && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">Sin stock</span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${ETIQUETA[f.coincidencia]}`}>{TEXTO_ETIQUETA[f.coincidencia]}</span>
          <button onClick={onQuitar} className="text-xs text-suave underline">
            Quitar
          </button>
        </span>
      </div>
      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_90px_130px]">
        <select
          value={f.cod ?? ""}
          onChange={(e) => {
            const c = f.candidatos.find((x) => x.cod_articulo === e.target.value);
            onCambio({ cod: e.target.value || null, coincidencia: "manual", precio: c ? Number(c.precio) : null, precioManual: false });
          }}
          className={campo}
        >
          <option value="">— Sin artículo —</option>
          {f.candidatos.map((c) => (
            <option key={c.cod_articulo} value={c.cod_articulo}>
              {c.cod_articulo === ENVIO
                ? `${c.nombre} · ${c.cod_articulo}`
                : `${c.nombre} · ${gs(c.precio)} · ${Number(c.cant_dispon) > 0 ? `${Math.floor(Number(c.cant_dispon))} disp.` : "sin stock"} · ${c.cod_articulo}`}
            </option>
          ))}
        </select>
        <input type="number" min={1} value={f.cantidad} onChange={(e) => onCambio({ cantidad: Math.max(1, Math.floor(Number(e.target.value) || 1)) })} className={campo} aria-label="Cantidad" />
        <input
          type="number"
          min={0}
          value={f.precio ?? ""}
          onChange={(e) => onCambio({ precio: Number(e.target.value) || null, precioManual: true })}
          className={`${campo} ${f.precioManual ? "border-acento" : ""}`}
          aria-label="Precio unitario"
          title={f.precioManual ? "Precio cambiado a mano" : elegido?.regla}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-suave">
        {elegido && <span>{elegido.regla}{f.precioManual ? " · precio a mano" : ""}</span>}
        {f.precioManual && f.cod !== ENVIO && (
          <button onClick={() => onCambio({ precioManual: false, precio: elegido ? Number(elegido.precio) : null })} className="underline">
            volver al precio de lista
          </button>
        )}
        {f.nota && <span className="text-[#a33600]">· {f.nota}</span>}
      </div>
      <div className="mt-2 flex gap-2">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} onKeyDown={(e) => e.key === "Enter" && buscar()} placeholder="Cambiar artículo: buscá por nombre o código" className={`${campo} h-9`} />
        <button onClick={buscar} className="h-9 rounded-lg border border-borde px-3 text-sm">
          {buscando ? "…" : "Buscar"}
        </button>
      </div>
    </li>
  );
}
