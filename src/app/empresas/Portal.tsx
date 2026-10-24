"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SITE } from "@/lib/config";
import { gs, linkWhatsApp } from "@/lib/format";
import { cargarEnCarrito, salir, sb, usePortal, type Cuenta } from "@/lib/portal";

interface PedidoPortal {
  numero: string;
  creado_at: string;
  estado: string;
  total: number;
  orden_compra: string | null;
  usuario: string | null;
  destino: string | null;
  items: { cod: string; nombre: string; cantidad: number; precio: number; subtotal: number }[];
}
interface CarritoGuardado {
  id: number;
  nombre: string;
  items: { cod: string; cantidad: number }[];
  actualizado_at: string;
}

const campo = "h-12 w-full rounded-[10px] border border-borde bg-white px-3.5 text-base outline-none focus:border-marca focus:ring-2 focus:ring-marca/15";
const fecha = (s: string) => new Date(s).toLocaleDateString("es-PY", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Asuncion" });
const ESTADO: Record<string, string> = {
  nuevo: "Recibido",
  confirmado: "Confirmado",
  pagado: "Pagado",
  facturado: "Facturado",
  enviado: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default function Portal() {
  const { cargando, sesion, cuenta } = usePortal();
  if (cargando) return <p className="py-16 text-center text-suave">Cargando…</p>;
  if (!sesion) return <Ingreso />;
  if (!cuenta)
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-borde bg-white p-6 text-center">
        <p className="mb-4">Este usuario no tiene acceso al portal de empresas.</p>
        <button onClick={salir} className="h-11 rounded-lg border border-borde px-5 font-semibold">
          Cerrar sesión
        </button>
      </div>
    );
  return <Inicio cuenta={cuenta} />;
}

function Ingreso() {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: clave });
    setEnviando(false);
    if (error) setError("Email o contraseña incorrectos.");
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      <form onSubmit={entrar} className="space-y-4 rounded-2xl border border-borde bg-white p-6 md:p-8">
        <h1 className="text-2xl font-bold">Portal para empresas</h1>
        <p className="text-sm text-suave">Ingresá con el usuario que te dio RPM.</p>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Email</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={campo} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Contraseña</span>
          <input type="password" required autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} className={campo} />
        </label>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={enviando} className="h-12 w-full rounded-lg bg-marca font-bold text-white hover:bg-marca-oscuro disabled:opacity-60">
          {enviando ? "Ingresando…" : "Ingresar"}
        </button>
        <a
          href={linkWhatsApp(SITE.whatsapp, "Hola RPM, olvidé la contraseña del portal de empresas. Mi email es: ")}
          target="_blank"
          rel="noopener"
          className="block text-center text-sm text-marca underline"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </form>
      <div className="rounded-2xl bg-marca p-6 text-white md:p-8">
        <h2 className="text-xl font-bold !text-white">¿Qué podés hacer?</h2>
        <ul className="mt-4 space-y-2.5 text-[15px] text-[#dbe3f5]">
          <li>✓ Ver tus precios acordados en todo el catálogo</li>
          <li>✓ Comprar con tus condiciones y tus direcciones de entrega</li>
          <li>✓ Ver tus pedidos anteriores y repetirlos en un clic</li>
          <li>✓ Guardar carritos para la compra de cada mes</li>
          <li>✓ Varios usuarios por empresa</li>
        </ul>
        <p className="mt-6 text-sm text-[#dbe3f5]">¿Tu empresa todavía no tiene acceso?</p>
        <a
          href={linkWhatsApp(SITE.whatsapp, "Hola RPM, quiero acceso al portal de empresas para mi empresa.")}
          target="_blank"
          rel="noopener"
          className="mt-2 inline-flex h-11 items-center rounded-[10px] bg-white px-5 font-bold text-marca"
        >
          Pedir acceso
        </a>
      </div>
    </div>
  );
}

function Inicio({ cuenta }: { cuenta: Cuenta }) {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<PedidoPortal[] | null>(null);
  const [carritos, setCarritos] = useState<CarritoGuardado[] | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    const [p, c] = await Promise.all([sb.rpc("mis_pedidos", { p_limite: 30 }), sb.rpc("mis_carritos")]);
    setPedidos((p.data as PedidoPortal[]) ?? []);
    setCarritos((c.data as CarritoGuardado[]) ?? []);
  }, []);
  useEffect(() => {
    const t = setTimeout(cargar, 0);
    return () => clearTimeout(t);
  }, [cargar]);

  async function aCarrito(items: { cod: string; cantidad: number; nombre?: string }[]) {
    setOcupado(true);
    const faltan = await cargarEnCarrito(items);
    setOcupado(false);
    if (faltan.length) {
      setAviso(
        "Se cargó el carrito, pero algunos artículos no tienen stock suficiente: " +
          faltan.map((f) => `${f.nombre} (${f.agregado} de ${f.pedido})`).join(", "),
      );
      setTimeout(() => router.push("/carrito"), 2500);
    } else router.push("/carrito");
  }

  async function borrarCarrito(c: CarritoGuardado) {
    if (!confirm(`¿Borrar el carrito "${c.nombre}"?`)) return;
    await sb.rpc("borrar_carrito", { p_id: c.id });
    cargar();
  }

  const ultimo = pedidos?.[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-suave">Portal para empresas</p>
          <h1 className="text-2xl font-bold md:text-3xl">{cuenta.razon_social}</h1>
          <p className="text-sm text-suave">
            RUC {cuenta.ruc} · {cuenta.usuario?.nombre || cuenta.usuario?.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="flex h-11 items-center rounded-lg bg-acento px-5 text-sm font-bold text-white hover:bg-acento-oscuro">
            Ir al catálogo
          </Link>
          <button onClick={salir} className="h-11 rounded-lg border border-borde px-4 text-sm font-semibold">
            Salir
          </button>
        </div>
      </div>

      <p className="rounded-xl bg-marca-suave px-4 py-3 text-sm text-marca">
        En todo el sitio ves <b>tus precios</b>{cuenta.tiene_lista ? " acordados" : ""}. Armá el pedido en el catálogo y confirmalo desde el carrito.
      </p>

      {aviso && <p className="rounded-lg bg-[#fff1d6] p-3 text-sm text-[#7a4b00]">{aviso}</p>}

      {ultimo && (
        <section className="flex flex-col gap-3 rounded-2xl border border-borde bg-white p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
          <div>
            <h2 className="font-bold">Repetir el último pedido</h2>
            <p className="text-sm text-suave">
              {ultimo.numero} del {fecha(ultimo.creado_at)} · {ultimo.items.length} artículos · {gs(ultimo.total)}
            </p>
          </div>
          <button
            disabled={ocupado}
            onClick={() => aCarrito(ultimo.items)}
            className="h-11 shrink-0 rounded-lg bg-marca px-5 text-sm font-bold text-white disabled:opacity-60"
          >
            Cargar al carrito
          </button>
        </section>
      )}

      <section className="rounded-2xl border border-borde bg-white p-4 md:p-5">
        <h2 className="mb-3 font-bold">Carritos guardados</h2>
        {carritos === null ? (
          <p className="text-sm text-suave">Cargando…</p>
        ) : carritos.length === 0 ? (
          <p className="text-sm text-suave">Todavía no guardaste carritos. En el carrito usá “Guardar este carrito para repetirlo”.</p>
        ) : (
          <ul className="divide-y divide-borde">
            {carritos.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div>
                  <p className="font-semibold">{c.nombre}</p>
                  <p className="text-xs text-suave">
                    {c.items.length} artículos · actualizado {fecha(c.actualizado_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button disabled={ocupado} onClick={() => aCarrito(c.items)} className="h-9 rounded-lg bg-marca px-3 text-sm font-bold text-white disabled:opacity-60">
                    Cargar
                  </button>
                  <button onClick={() => borrarCarrito(c)} className="h-9 px-2 text-sm text-suave underline">
                    Borrar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-borde bg-white p-4 md:p-5">
        <h2 className="mb-3 font-bold">Pedidos anteriores</h2>
        {pedidos === null ? (
          <p className="text-sm text-suave">Cargando…</p>
        ) : pedidos.length === 0 ? (
          <p className="text-sm text-suave">Todavía no hiciste pedidos por el portal.</p>
        ) : (
          <ul className="divide-y divide-borde">
            {pedidos.map((p) => (
              <li key={p.numero} className="py-2.5">
                <button onClick={() => setAbierto(abierto === p.numero ? null : p.numero)} className="flex w-full flex-wrap items-center justify-between gap-2 text-left">
                  <span>
                    <span className="font-semibold">{p.numero}</span>
                    <span className="ml-2 text-sm text-suave">
                      {fecha(p.creado_at)}
                      {p.orden_compra ? ` · OC ${p.orden_compra}` : ""}
                      {p.usuario ? ` · ${p.usuario}` : ""}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="rounded-full bg-fondo px-2.5 py-0.5 text-xs font-semibold">{ESTADO[p.estado] ?? p.estado}</span>
                    <span className="font-bold">{gs(p.total)}</span>
                  </span>
                </button>
                {abierto === p.numero && (
                  <div className="mt-3 space-y-3 rounded-xl bg-fondo p-3 text-sm">
                    {p.destino && <p className="text-suave">Entrega: {p.destino}</p>}
                    <table className="w-full">
                      <tbody>
                        {p.items.map((i) => (
                          <tr key={i.cod} className="border-b border-borde/60 last:border-0">
                            <td className="py-1 pr-2">
                              {i.cantidad} × {i.nombre}
                            </td>
                            <td className="py-1 text-right">{gs(i.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button disabled={ocupado} onClick={() => aCarrito(p.items)} className="h-9 rounded-lg bg-marca px-3 font-bold text-white disabled:opacity-60">
                      Repetir este pedido
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-borde bg-white p-4 md:p-5">
        <h2 className="mb-3 font-bold">Direcciones de entrega</h2>
        {cuenta.direcciones.length === 0 ? (
          <p className="text-sm text-suave">No tenés direcciones cargadas. Podés pedir con retiro en nuestro depósito, o pedile a tu vendedor que las cargue.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {cuenta.direcciones.map((d) => (
              <li key={d.id} className="rounded-xl bg-fondo p-3 text-sm">
                <p className="font-semibold">{d.nombre}</p>
                <p>
                  {d.direccion}
                  {d.localidad ? `, ${d.localidad}` : ""}
                </p>
                {d.contacto && <p className="text-suave">Recibe: {d.contacto}</p>}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-suave">Las direcciones las administra RPM. Para agregar o cambiar una, escribile a tu vendedor.</p>
      </section>
    </div>
  );
}
