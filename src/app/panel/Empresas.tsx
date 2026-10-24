"use client";

import { useCallback, useEffect, useState } from "react";
import { SUPABASE } from "@/lib/config";
import { linkWhatsApp } from "@/lib/format";
import { sb } from "./cliente";

interface Cliente {
  cod_cliente: string;
  razon_social: string | null;
  ruc: string | null;
  tip_cliente: string | null;
  cod_lista_precio: string | null;
  email: string | null;
  telefono: string | null;
}
interface Usuario {
  user_id: string;
  email: string;
  nombre: string | null;
  rol: string;
  activo: boolean;
  creado_at: string;
}
interface Direccion {
  id: number;
  nombre: string;
  direccion: string;
  localidad_id: number | null;
  referencias: string | null;
  contacto: string | null;
  telefono: string | null;
  activa: boolean;
}
interface Localidad {
  id: number;
  nombre: string;
  tipo: string;
}

const campo = "h-10 w-full rounded-lg border border-borde bg-white px-3 text-sm outline-none focus:border-marca";

async function llamarAcceso(body: Record<string, string>) {
  const token = (await sb.auth.getSession()).data.session?.access_token;
  const r = await fetch(`${SUPABASE.url}/functions/v1/portal-acceso`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE.key, "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, sitio: window.location.origin }),
  });
  const data = (await r.json().catch(() => ({}))) as { ok?: boolean; enlace?: string; error?: string };
  if (!r.ok || !data.ok) throw new Error(data.error ?? `Error ${r.status}`);
  return data.enlace!;
}

export default function Empresas() {
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState<Cliente[]>([]);
  const [conAcceso, setConAcceso] = useState<(Cliente & { usuarios: number })[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);

  const cargarConAcceso = useCallback(async () => {
    const { data: us } = await sb.from("portal_usuarios").select("cod_cliente");
    const cods = [...new Set((us ?? []).map((u) => u.cod_cliente as string))];
    if (!cods.length) return setConAcceso([]);
    const { data: cs } = await sb.from("clientes").select("cod_cliente,razon_social,ruc,tip_cliente,cod_lista_precio,email,telefono").in("cod_cliente", cods);
    setConAcceso(
      ((cs ?? []) as Cliente[])
        .map((c) => ({ ...c, usuarios: (us ?? []).filter((u) => u.cod_cliente === c.cod_cliente).length }))
        .sort((a, b) => (a.razon_social ?? "").localeCompare(b.razon_social ?? "")),
    );
  }, []);
  useEffect(() => {
    const t = setTimeout(cargarConAcceso, 0);
    return () => clearTimeout(t);
  }, [cargarConAcceso]);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    const t = q.trim().replace(/[,()*]/g, " ");
    if (t.length < 2) return;
    const { data } = await sb
      .from("clientes")
      .select("cod_cliente,razon_social,ruc,tip_cliente,cod_lista_precio,email,telefono")
      .or(`razon_social.ilike.*${t}*,ruc.ilike.*${t}*,cod_cliente.eq.${t}`)
      .order("razon_social")
      .limit(25);
    setResultados((data as Cliente[]) ?? []);
  }

  if (cliente)
    return (
      <div className="contenedor py-4 md:py-6">
        <button onClick={() => (setCliente(null), cargarConAcceso())} className="mb-3 text-sm text-marca underline">
          ← Volver
        </button>
        <FichaCliente c={cliente} />
      </div>
    );

  return (
    <div className="contenedor space-y-6 py-4 md:py-6">
      <div>
        <h1 className="text-2xl font-bold">Empresas en el portal</h1>
        <p className="text-sm text-suave">Buscá un cliente del ERP para darle acceso, ver sus usuarios y cargar sus direcciones de entrega.</p>
      </div>
      <form onSubmit={buscar} className="flex max-w-xl gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Razón social, RUC o código de cliente" className={campo} />
        <button className="h-10 shrink-0 rounded-lg bg-marca px-4 text-sm font-bold text-white">Buscar</button>
      </form>
      {resultados.length > 0 && <ListaClientes clientes={resultados} onElegir={setCliente} />}
      <section>
        <h2 className="mb-2 font-bold">Con acceso ({conAcceso.length})</h2>
        {conAcceso.length === 0 ? (
          <p className="text-sm text-suave">Todavía no hay empresas con acceso.</p>
        ) : (
          <ListaClientes clientes={conAcceso} onElegir={setCliente} />
        )}
      </section>
    </div>
  );
}

function ListaClientes({ clientes, onElegir }: { clientes: (Cliente & { usuarios?: number })[]; onElegir: (c: Cliente) => void }) {
  return (
    <ul className="divide-y divide-borde overflow-hidden rounded-xl border border-borde bg-white">
      {clientes.map((c) => (
        <li key={c.cod_cliente}>
          <button onClick={() => onElegir(c)} className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-fondo">
            <span>
              <span className="font-semibold">{c.razon_social}</span>
              <span className="ml-2 text-sm text-suave">
                RUC {c.ruc ?? "—"} · cód. {c.cod_cliente}
              </span>
            </span>
            {c.usuarios != null && <span className="text-xs text-suave">{c.usuarios} usuario(s)</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}

function FichaCliente({ c }: { c: Cliente }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [tipo, setTipo] = useState<{ descripcion: string; categoria: string | null } | null>(null);
  const [enlace, setEnlace] = useState<{ email: string; url: string } | null>(null);
  const [nuevo, setNuevo] = useState({ email: "", nombre: "", rol: "comprador" });
  const [dir, setDir] = useState({ nombre: "", direccion: "", localidad_id: "", referencias: "", contacto: "", telefono: "" });
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    const [u, d, l, t] = await Promise.all([
      sb.from("portal_usuarios").select("user_id,email,nombre,rol,activo,creado_at").eq("cod_cliente", c.cod_cliente).order("creado_at"),
      sb.from("portal_direcciones").select("*").eq("cod_cliente", c.cod_cliente).order("nombre"),
      sb.from("localidades").select("id,nombre,tipo").eq("activa", true).order("orden"),
      c.tip_cliente ? sb.from("tipos_cliente").select("descripcion,categoria").eq("tip_cliente", c.tip_cliente).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    setUsuarios((u.data as Usuario[]) ?? []);
    setDirecciones((d.data as Direccion[]) ?? []);
    setLocalidades(((l.data as Localidad[]) ?? []).filter((x) => x.tipo !== "retiro"));
    setTipo((t.data as { descripcion: string; categoria: string | null } | null) ?? null);
  }, [c.cod_cliente, c.tip_cliente]);
  useEffect(() => {
    const t = setTimeout(cargar, 0);
    return () => clearTimeout(t);
  }, [cargar]);

  async function invitar(e: React.FormEvent) {
    e.preventDefault();
    setOcupado(true);
    try {
      const url = await llamarAcceso({ accion: "invitar", email: nuevo.email, nombre: nuevo.nombre, rol: nuevo.rol, cod_cliente: c.cod_cliente });
      setEnlace({ email: nuevo.email, url });
      setNuevo({ email: "", nombre: "", rol: "comprador" });
      cargar();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  async function nuevoEnlace(u: Usuario) {
    setOcupado(true);
    try {
      setEnlace({ email: u.email, url: await llamarAcceso({ accion: "enlace", email: u.email }) });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  async function activarUsuario(u: Usuario, activo: boolean) {
    const { error } = await sb.from("portal_usuarios").update({ activo }).eq("user_id", u.user_id);
    if (error) alert(error.message);
    cargar();
  }

  async function agregarDireccion(e: React.FormEvent) {
    e.preventDefault();
    if (!dir.nombre.trim() || !dir.direccion.trim()) return alert("Completá nombre y dirección.");
    const { error } = await sb.from("portal_direcciones").insert({
      cod_cliente: c.cod_cliente,
      nombre: dir.nombre.trim(),
      direccion: dir.direccion.trim(),
      localidad_id: dir.localidad_id ? Number(dir.localidad_id) : null,
      referencias: dir.referencias.trim() || null,
      contacto: dir.contacto.trim() || null,
      telefono: dir.telefono.trim() || null,
    });
    if (error) return alert(error.message);
    setDir({ nombre: "", direccion: "", localidad_id: "", referencias: "", contacto: "", telefono: "" });
    cargar();
  }

  async function activarDireccion(d: Direccion, activa: boolean) {
    const { error } = await sb.from("portal_direcciones").update({ activa }).eq("id", d.id);
    if (error) alert(error.message);
    cargar();
  }

  const mensaje = enlace
    ? `Hola, te damos acceso al portal de empresas de Distribuidora RPM para ${c.razon_social}. Entrá a este enlace para elegir tu contraseña: ${enlace.url}\n\nDespués ingresás con tu email (${enlace.email}) en ${window.location.origin}/empresas`
    : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{c.razon_social}</h1>
        <p className="text-sm text-suave">
          RUC {c.ruc ?? "—"} · cód. {c.cod_cliente} · Tipo: {tipo?.descripcion ?? c.tip_cliente ?? "—"}
          {tipo?.categoria ? ` (${tipo.categoria === "EMPRESA" ? "precio empresa" : "precio mayorista"})` : " (precio de lista)"} · Lista de precios:{" "}
          {c.cod_lista_precio && c.cod_lista_precio !== "6" ? c.cod_lista_precio : "general"}
        </p>
      </div>

      {enlace && (
        <div className="space-y-3 rounded-2xl border-2 border-ok/40 bg-[#effaf2] p-4">
          <p className="font-semibold">Enlace de acceso para {enlace.email}</p>
          <p className="break-all rounded-lg bg-white p-2 font-mono text-xs">{enlace.url}</p>
          <p className="text-xs text-suave">Vale por un tiempo limitado y se usa una sola vez. Si vence, generá uno nuevo.</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigator.clipboard.writeText(mensaje)} className="h-9 rounded-lg border border-borde bg-white px-3 text-sm font-semibold">
              Copiar mensaje
            </button>
            {c.telefono && (
              <a href={linkWhatsApp(c.telefono.replace(/\D/g, "").replace(/^0/, "595"), mensaje)} target="_blank" rel="noopener" className="flex h-9 items-center rounded-lg bg-[#177a3b] px-3 text-sm font-bold text-white">
                Enviar por WhatsApp
              </a>
            )}
            <a
              href={`mailto:${enlace.email}?subject=${encodeURIComponent("Acceso al portal de empresas de Distribuidora RPM")}&body=${encodeURIComponent(mensaje)}`}
              className="flex h-9 items-center rounded-lg bg-marca px-3 text-sm font-bold text-white"
            >
              Enviar por email
            </a>
            <button onClick={() => setEnlace(null)} className="h-9 px-2 text-sm text-suave underline">
              Cerrar
            </button>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-borde bg-white p-4 md:p-5">
        <h2 className="mb-3 font-bold">Usuarios</h2>
        {usuarios.length === 0 ? (
          <p className="mb-3 text-sm text-suave">Sin usuarios todavía.</p>
        ) : (
          <ul className="mb-4 divide-y divide-borde">
            {usuarios.map((u) => (
              <li key={u.user_id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <span className={`font-semibold ${u.activo ? "" : "text-suave line-through"}`}>{u.nombre || u.email}</span>
                  <span className="ml-2 text-sm text-suave">
                    {u.email} · {u.rol}
                  </span>
                </span>
                <span className="flex gap-2 text-sm">
                  <button disabled={ocupado} onClick={() => nuevoEnlace(u)} className="h-8 rounded-lg border border-borde px-3">
                    Enlace nuevo / contraseña
                  </button>
                  <button onClick={() => activarUsuario(u, !u.activo)} className="h-8 px-2 text-suave underline">
                    {u.activo ? "Desactivar" : "Activar"}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={invitar} className="grid gap-2 sm:grid-cols-[1.4fr_1fr_auto_auto]">
          <input type="email" required placeholder="Email del usuario" value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} className={campo} />
          <input placeholder="Nombre (opcional)" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} className={campo} />
          <select value={nuevo.rol} onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value })} className={campo}>
            <option value="comprador">Comprador</option>
            <option value="administrador">Administrador</option>
          </select>
          <button disabled={ocupado} className="h-10 rounded-lg bg-acento px-4 text-sm font-bold text-white disabled:opacity-60">
            {ocupado ? "…" : "Dar acceso"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-borde bg-white p-4 md:p-5">
        <h2 className="mb-3 font-bold">Direcciones de entrega</h2>
        {direcciones.length > 0 && (
          <ul className="mb-4 grid gap-2 sm:grid-cols-2">
            {direcciones.map((d) => (
              <li key={d.id} className={`rounded-xl p-3 text-sm ${d.activa ? "bg-fondo" : "bg-fondo/50 text-suave"}`}>
                <p className="font-semibold">
                  {d.nombre} {!d.activa && "(inactiva)"}
                </p>
                <p>
                  {d.direccion}
                  {d.localidad_id ? `, ${localidades.find((l) => l.id === d.localidad_id)?.nombre ?? ""}` : ""}
                </p>
                {(d.contacto || d.telefono) && <p className="text-suave">Recibe: {[d.contacto, d.telefono].filter(Boolean).join(" · ")}</p>}
                {d.referencias && <p className="text-suave">{d.referencias}</p>}
                <button onClick={() => activarDireccion(d, !d.activa)} className="mt-1 text-xs underline">
                  {d.activa ? "Desactivar" : "Activar"}
                </button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={agregarDireccion} className="grid gap-2 sm:grid-cols-2">
          <input placeholder="Nombre (ej.: Casa central)" value={dir.nombre} onChange={(e) => setDir({ ...dir, nombre: e.target.value })} className={campo} />
          <select value={dir.localidad_id} onChange={(e) => setDir({ ...dir, localidad_id: e.target.value })} className={campo}>
            <option value="">Ciudad…</option>
            {localidades.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </select>
          <input placeholder="Dirección" value={dir.direccion} onChange={(e) => setDir({ ...dir, direccion: e.target.value })} className={`${campo} sm:col-span-2`} />
          <input placeholder="Referencias" value={dir.referencias} onChange={(e) => setDir({ ...dir, referencias: e.target.value })} className={campo} />
          <input placeholder="Quién recibe" value={dir.contacto} onChange={(e) => setDir({ ...dir, contacto: e.target.value })} className={campo} />
          <input placeholder="Teléfono de quien recibe" value={dir.telefono} onChange={(e) => setDir({ ...dir, telefono: e.target.value })} className={campo} />
          <button className="h-10 rounded-lg bg-marca px-4 text-sm font-bold text-white">Agregar dirección</button>
        </form>
      </section>
    </div>
  );
}
