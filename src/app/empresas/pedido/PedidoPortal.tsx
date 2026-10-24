"use client";

import Link from "next/link";
import { useState } from "react";
import { cambiarCantidad, guardarUltimoPedido, useCarrito, vaciar } from "@/components/carrito";
import { gs } from "@/lib/format";
import { sb, usePortal } from "@/lib/portal";
import { usePreciosCarrito } from "@/app/carrito/CarritoPortal";

const campo = "h-12 w-full rounded-[10px] border border-borde bg-white px-3.5 text-base outline-none focus:border-marca focus:ring-2 focus:ring-marca/15";

interface Resultado {
  ok: boolean;
  numero?: string;
  total?: number;
  error?: string;
  faltan?: { cod: string; nombre: string; disponible: number }[];
}

export default function PedidoPortal() {
  const { cargando, cuenta } = usePortal();
  const items = useCarrito();
  const { precios, listo, total, sinPrecio } = usePreciosCarrito(items);
  const [destino, setDestino] = useState<string>("");
  const [oc, setOc] = useState("");
  const [obs, setObs] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faltan, setFaltan] = useState<Resultado["faltan"]>();
  const [hecho, setHecho] = useState<Resultado | null>(null);

  if (cargando) return <p className="py-10 text-center text-suave">Cargando…</p>;
  if (!cuenta)
    return (
      <p className="rounded-2xl border border-borde bg-white p-8 text-center">
        Para confirmar pedidos de empresa, <Link href="/empresas" className="font-semibold text-marca underline">ingresá al portal</Link>.
      </p>
    );

  if (hecho)
    return (
      <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-borde bg-white p-6 md:p-8">
        <p className="text-sm font-semibold text-ok">✓ Pedido recibido</p>
        <h2 className="text-2xl font-bold">Pedido {hecho.numero}</h2>
        <p className="text-suave">
          Total {gs(hecho.total)}. Lo vamos a confirmar y coordinar la entrega con las condiciones de {cuenta.razon_social}. Lo ves en{" "}
          <Link href="/empresas" className="font-semibold text-marca underline">Mi cuenta</Link>.
        </p>
      </div>
    );

  if (items.length === 0)
    return (
      <p className="rounded-2xl border border-borde bg-white p-8 text-center">
        Tu carrito está vacío. <Link href="/empresas" className="font-semibold text-marca underline">Volver a Mi cuenta</Link>
      </p>
    );

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!destino) return setError("Elegí dónde entregamos el pedido.");
    setEnviando(true);
    setError(null);
    setFaltan(undefined);
    const { data, error } = await sb.rpc("crear_pedido_portal", {
      p: {
        retiro: destino === "retiro",
        direccion_id: destino === "retiro" ? null : Number(destino),
        orden_compra: oc,
        observaciones: obs,
        items: items.map((x) => ({ cod: x.cod, cantidad: x.cantidad })),
      },
    });
    setEnviando(false);
    if (error) return setError(error.message);
    const r = data as Resultado;
    if (!r.ok) {
      setError(r.error ?? "No se pudo registrar el pedido.");
      setFaltan(r.faltan);
      return;
    }
    guardarUltimoPedido(r.numero!, items);
    vaciar();
    setHecho(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <form onSubmit={enviar} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5 rounded-2xl border border-borde bg-white p-4 md:p-6">
        <div>
          <p className="text-sm text-suave">Comprando como</p>
          <p className="font-bold">
            {cuenta.razon_social} · RUC {cuenta.ruc}
          </p>
        </div>

        <fieldset>
          <legend className="mb-2 font-semibold">¿Dónde lo entregamos?</legend>
          <div className="space-y-2">
            {cuenta.direcciones.map((d) => (
              <label key={d.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${destino === String(d.id) ? "border-marca bg-marca-suave" : "border-borde"}`}>
                <input type="radio" name="destino" value={d.id} checked={destino === String(d.id)} onChange={(e) => setDestino(e.target.value)} className="mt-1" />
                <span>
                  <span className="block font-semibold">{d.nombre}</span>
                  <span className="block text-sm">
                    {d.direccion}
                    {d.localidad ? `, ${d.localidad}` : ""}
                  </span>
                  {d.contacto && <span className="block text-xs text-suave">Recibe: {d.contacto}</span>}
                </span>
              </label>
            ))}
            <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${destino === "retiro" ? "border-marca bg-marca-suave" : "border-borde"}`}>
              <input type="radio" name="destino" value="retiro" checked={destino === "retiro"} onChange={(e) => setDestino(e.target.value)} className="mt-1" />
              <span>
                <span className="block font-semibold">Retiro en nuestro depósito</span>
                <span className="block text-sm text-suave">12 de Octubre N° 521, Asunción · listo en 2 horas</span>
              </span>
            </label>
          </div>
          {cuenta.direcciones.length === 0 && <p className="mt-2 text-xs text-suave">Para recibir en tu empresa, pedile a tu vendedor que cargue tus direcciones de entrega.</p>}
        </fieldset>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold">N° de orden de compra (opcional)</span>
          <input value={oc} onChange={(e) => setOc(e.target.value)} maxLength={60} className={campo} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Observaciones (opcional)</span>
          <textarea rows={3} maxLength={1000} value={obs} onChange={(e) => setObs(e.target.value)} className={`${campo} h-auto py-3`} />
        </label>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-borde bg-white p-4 md:p-5 lg:sticky lg:top-32">
        <h2 className="font-bold">Tu pedido</h2>
        <ul className="max-h-80 space-y-2 overflow-auto text-sm">
          {items.map((x) => (
            <li key={x.cod} className="flex justify-between gap-3">
              <span className="line-clamp-2">
                {x.cantidad} × {x.nombre}
              </span>
              <span className="shrink-0 font-semibold">{precios[x.cod]?.precio ? gs(precios[x.cod]!.precio! * x.cantidad) : "…"}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t border-borde pt-3">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-extrabold text-marca">{listo ? gs(total) : "…"}</span>
        </div>
        <p className="-mt-2 text-right text-xs text-suave">IVA incluido · pago según tus condiciones con RPM</p>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
            {faltan?.length ? (
              <ul className="mt-2 space-y-1">
                {faltan.map((x) => (
                  <li key={x.cod}>
                    {x.nombre}: hay {x.disponible}.{" "}
                    {x.disponible > 0 && (
                      <button type="button" className="font-semibold underline" onClick={() => cambiarCantidad(x.cod, x.disponible)}>
                        Ajustar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando || !listo || sinPrecio}
          className="h-12 w-full rounded-lg bg-acento font-bold text-white hover:bg-acento-oscuro disabled:opacity-60"
        >
          {enviando ? "Enviando…" : "Confirmar pedido"}
        </button>
        <Link href="/carrito" className="block text-center text-sm text-suave underline">
          Volver al carrito
        </Link>
      </aside>
    </form>
  );
}
