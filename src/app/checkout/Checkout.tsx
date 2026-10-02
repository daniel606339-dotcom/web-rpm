"use client";

import Link from "next/link";
import { useState } from "react";
import { totalCarrito, useCarrito, vaciar, cambiarCantidad, guardarUltimoPedido } from "@/components/carrito";
import { BANCO, HORARIO_ENTREGA, SITE, SUPABASE } from "@/lib/config";
import { gs, linkWhatsApp } from "@/lib/format";
import { IconoWhatsApp } from "@/components/iconos";

export interface Localidad {
  id: number;
  nombre: string;
  costo_envio: number;
  tipo: "envio" | "interior" | "retiro";
}

interface Resultado {
  ok: boolean;
  numero?: string;
  subtotal?: number;
  costo_envio?: number;
  total?: number;
  localidad?: string;
  tipo?: string;
  error?: string;
  faltan?: { cod: string; nombre: string; disponible: number }[];
}

const campo =
  "h-12 w-full rounded-[10px] border border-borde bg-white px-3.5 text-base outline-none transition focus:border-marca focus:ring-2 focus:ring-marca/15";
const etiqueta = "mb-1 block text-sm font-semibold text-titulo";

export default function Checkout({ localidades }: { localidades: Localidad[] }) {
  const items = useCarrito();
  const subtotal = totalCarrito(items);

  const [f, setF] = useState({
    nombre: "",
    ruc: "",
    telefono: "",
    email: "",
    localidad_id: "",
    direccion: "",
    referencias: "",
    observaciones: "",
    empresa: "", // campo trampa para robots (oculto)
  });
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [geoEstado, setGeoEstado] = useState<"" | "buscando" | "error">("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faltan, setFaltan] = useState<Resultado["faltan"]>();
  const [hecho, setHecho] = useState<Resultado | null>(null);

  const retiro = localidades.find((l) => l.tipo === "retiro");
  const zonas = localidades.filter((l) => l.tipo !== "retiro");
  const [modo, setModo] = useState<"delivery" | "retiro">("delivery");
  const [zonaElegida, setZonaElegida] = useState("");
  function cambiarModo(m: "delivery" | "retiro") {
    setModo(m);
    if (m === "retiro") {
      setZonaElegida(f.localidad_id);
      setF((x) => ({ ...x, localidad_id: retiro ? String(retiro.id) : "" }));
    } else {
      setF((x) => ({ ...x, localidad_id: zonaElegida }));
    }
  }
  const loc = localidades.find((l) => String(l.id) === f.localidad_id);
  const envio = loc?.costo_envio ?? 0;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((x) => ({ ...x, [k]: e.target.value }));

  function marcarUbicacion() {
    if (!("geolocation" in navigator)) {
      setGeoEstado("error");
      return;
    }
    setGeoEstado("buscando");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoEstado("");
      },
      () => setGeoEstado("error"),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (f.empresa) return; // robot
    setError(null);
    setFaltan(undefined);
    setEnviando(true);
    try {
      const res = await fetch(`${SUPABASE.url}/rest/v1/rpc/crear_pedido`, {
        method: "POST",
        headers: {
          apikey: SUPABASE.key,
          Authorization: `Bearer ${SUPABASE.key}`,
          "Content-Profile": "web",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p: {
            nombre: f.nombre,
            ruc: f.ruc.replace(/\s|\./g, ""),
            telefono: f.telefono,
            email: f.email,
            localidad_id: Number(f.localidad_id),
            direccion: f.direccion,
            referencias: f.referencias,
            observaciones: f.observaciones,
            lat: geo?.lat ?? "",
            lng: geo?.lng ?? "",
            items: items.map((x) => ({ cod: x.cod, cantidad: x.cantidad })),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data?.message === "string" ? data.message : "No pudimos registrar el pedido. Probá de nuevo o escribinos por WhatsApp.");
        return;
      }
      const r = data as Resultado;
      if (!r.ok) {
        setError(r.error ?? "No pudimos registrar el pedido.");
        setFaltan(r.faltan);
        return;
      }
      // Conversión para Google Ads / Analytics (vía Tag Manager)
      const w = window as unknown as { dataLayer?: unknown[] };
      w.dataLayer?.push({
        event: "purchase",
        ecommerce: {
          transaction_id: r.numero,
          value: r.total,
          shipping: r.costo_envio,
          currency: "PYG",
          items: items.map((x) => ({ item_id: x.cod, item_name: x.nombre, price: x.precio, quantity: x.cantidad })),
        },
      });
      setHecho(r);
      if (r.numero) guardarUltimoPedido(r.numero, items);
      vaciar();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Sin conexión. Revisá tu internet y probá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  // ---------- Pedido confirmado ----------
  if (hecho) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-borde bg-white p-6 md:p-8">
        <div>
          <p className="text-sm font-semibold text-ok">✓ Pedido recibido</p>
          <h2 className="mt-1 text-2xl font-bold">Tu número de pedido es {hecho.numero}</h2>
          <p className="mt-2 text-suave">
            {hecho.tipo === "retiro"
              ? "Tu pedido va a estar listo para retirar en 2 horas en 12 de Octubre N° 521 (Barrio Pinozá, Asunción), dentro del horario de atención. Te avisamos por WhatsApp cuando esté preparado."
              : "Te vamos a contactar para confirmar la disponibilidad y la entrega."}{" "}
            Total: <b className="text-texto">{gs(hecho.total)}</b>
            {hecho.costo_envio ? ` (incluye envío ${gs(hecho.costo_envio)})` : ""}.
          </p>
        </div>
        <div className="rounded-xl bg-fondo p-4 text-sm leading-relaxed">
          <p className="mb-2 font-bold text-titulo">Datos para la transferencia</p>
          <p>Banco: {BANCO.banco}</p>
          <p>Alias: {BANCO.alias}</p>
          <p>Cuenta: {BANCO.cuenta} ({BANCO.tipo})</p>
          <p>Razón social: {BANCO.razonSocial} · RUC {BANCO.ruc}</p>
          <p className="mt-2">
            Cuando pagues, enviá el comprobante indicando el pedido <b>{hecho.numero}</b> por WhatsApp o a {BANCO.emailComprobante}.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={linkWhatsApp(SITE.whatsapp, `Hola RPM, hice el pedido ${hecho.numero} en la web. Les envío el comprobante de transferencia.`)}
            target="_blank"
            rel="noopener"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#25d366] font-bold text-white"
          >
            <IconoWhatsApp className="size-5" /> Enviar comprobante
          </a>
          <Link href="/" className="flex h-12 flex-1 items-center justify-center rounded-lg border border-borde font-semibold">
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-borde bg-white p-10 text-center">
        <p className="mb-4 text-suave">Tu carrito está vacío.</p>
        <Link href="/" className="inline-block rounded-lg bg-acento px-5 py-3 font-semibold text-white">
          Ver productos
        </Link>
      </div>
    );
  }

  // ---------- Formulario ----------
  return (
    <form onSubmit={enviar} className="grid gap-6 lg:grid-cols-[1fr_380px]" noValidate={false}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-borde bg-white p-4 md:p-6">
          <h2 className="mb-4 text-lg font-bold">Datos para la factura</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className={etiqueta}>Nombre completo o razón social *</span>
              <input required minLength={3} maxLength={150} autoComplete="name" value={f.nombre} onChange={set("nombre")} className={campo} />
            </label>
            <label>
              <span className={etiqueta}>RUC o cédula de identidad *</span>
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{3,12}(-[0-9])?"
                title="Solo números, con guion y dígito verificador si es RUC (ej. 80012345-6)"
                placeholder="Ej. 80012345-6 o 1234567"
                value={f.ruc}
                onChange={set("ruc")}
                className={campo}
              />
            </label>
            <label>
              <span className={etiqueta}>Teléfono / WhatsApp *</span>
              <input required type="tel" autoComplete="tel" placeholder="09xx xxx xxx" value={f.telefono} onChange={set("telefono")} className={campo} />
            </label>
            <label className="md:col-span-2">
              <span className={etiqueta}>Correo electrónico</span>
              <input type="email" autoComplete="email" placeholder="Para enviarte la factura" value={f.email} onChange={set("email")} className={campo} />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-borde bg-white p-4 md:p-6">
          <h2 className="mb-4 text-lg font-bold">Entrega</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Delivery o retiro: dos opciones visibles, delivery por defecto */}
            <div className="grid grid-cols-2 gap-2 md:col-span-2" role="radiogroup" aria-label="Forma de entrega">
              {(
                [
                  ["delivery", "Delivery", "Te lo llevamos"],
                  ["retiro", "Pasar a retirar", "Pickup en nuestro depósito, sin costo"],
                ] as const
              ).map(([valor, titulo, sub]) => (
                <label
                  key={valor}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition ${
                    modo === valor ? "border-marca bg-marca-suave/40" : "border-borde hover:border-marca/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="modo"
                    value={valor}
                    checked={modo === valor}
                    onChange={() => cambiarModo(valor)}
                    className="mt-1 size-4 accent-[var(--color-marca)]"
                  />
                  <span>
                    <span className="block font-semibold">{titulo}</span>
                    <span className="text-xs text-suave md:text-sm">{sub}</span>
                  </span>
                </label>
              ))}
            </div>

            {modo === "retiro" && retiro && (
              <div className="space-y-2 rounded-xl bg-fondo p-4 text-sm md:col-span-2">
                <p className="font-semibold text-titulo">Retirás en nuestro Centro de Distribución</p>
                <p>{SITE.direccion.replace("Barrio Pinozá", "entre 14 de Junio e Igualdad, Barrio Pinozá")}</p>
                <p>
                  <a
                    className="font-semibold text-marca underline"
                    target="_blank"
                    rel="noopener"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("12 de Octubre 521, Asunción, Paraguay")}`}
                  >
                    Cómo llegar
                  </a>
                </p>
                <p className="rounded-lg bg-white p-3">
                  ⏱ Tu pedido va a estar <b>listo para retirar en 2 horas</b> desde la confirmación, dentro del horario de atención:{" "}
                  {HORARIO_ENTREGA.join(" · ")}. Te avisamos por WhatsApp cuando esté preparado.
                </p>
              </div>
            )}

            {modo === "delivery" && (
              <label className="md:col-span-2">
                <span className={etiqueta}>Ciudad o zona *</span>
                <select required value={f.localidad_id} onChange={set("localidad_id")} className={campo}>
                  <option value="">Elegí tu ciudad</option>
                  {zonas.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nombre}
                      {l.tipo === "envio" ? ` — envío ${gs(l.costo_envio)}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {modo === "delivery" && (
              <>
                <label className="md:col-span-2">
                  <span className={etiqueta}>Dirección *</span>
                  <input required autoComplete="street-address" maxLength={300} value={f.direccion} onChange={set("direccion")} className={campo} />
                </label>
                <label className="md:col-span-2">
                  <span className={etiqueta}>Referencias</span>
                  <input maxLength={300} placeholder="Ej. portón negro, frente a la farmacia" value={f.referencias} onChange={set("referencias")} className={campo} />
                </label>
                <div className="md:col-span-2">
                  <span className={etiqueta}>Ubicación en el mapa</span>
                  {geo ? (
                    <div className="space-y-2">
                      <p className="text-sm text-ok">
                        ✓ Ubicación registrada ·{" "}
                        <a
                          className="underline"
                          target="_blank"
                          rel="noopener"
                          href={`https://www.google.com/maps?q=${geo.lat},${geo.lng}`}
                        >
                          ver en el mapa
                        </a>{" "}
                        ·{" "}
                        <button type="button" className="underline" onClick={() => setGeo(null)}>
                          quitar
                        </button>
                      </p>
                      <iframe
                        title="Tu ubicación"
                        className="h-48 w-full rounded-xl border border-borde"
                        loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${geo.lng - 0.004},${geo.lat - 0.003},${geo.lng + 0.004},${geo.lat + 0.003}&layer=mapnik&marker=${geo.lat},${geo.lng}`}
                      />
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={marcarUbicacion}
                        className="flex h-11 items-center gap-2 rounded-[10px] border-[1.5px] border-marca px-4 text-sm font-bold text-marca hover:bg-marca-suave"
                      >
                        📍 {geoEstado === "buscando" ? "Buscando tu ubicación…" : "Usar mi ubicación actual"}
                      </button>
                      <p className="mt-1 text-xs text-suave">
                        {geoEstado === "error"
                          ? "No pudimos obtener tu ubicación. Revisá el permiso del navegador; igual podés seguir sin ella."
                          : "Opcional. Ayuda al repartidor a encontrarte. Hacelo desde el lugar de entrega."}
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
            {loc?.tipo === "interior" && (
              <p className="rounded-lg bg-[#fff4ee] p-3 text-sm text-[#8a2e00] md:col-span-2">
                Envíos al interior por transportadora, con cobro a destino. Indicá en observaciones tu transportadora de preferencia.
              </p>
            )}
            {modo === "delivery" && (
              <div className="text-sm text-suave md:col-span-2">
                Las entregas se realizan dentro de las 24 a 48 horas posteriores a la confirmación: {HORARIO_ENTREGA.join(" · ")}.
              </div>
            )}
            <label className="md:col-span-2">
              <span className={etiqueta}>Observaciones</span>
              <textarea rows={3} maxLength={1000} value={f.observaciones} onChange={set("observaciones")} className={`${campo} h-auto py-3`} />
            </label>
            {/* trampa para robots */}
            <input tabIndex={-1} autoComplete="off" value={f.empresa} onChange={set("empresa")} className="hidden" aria-hidden />
          </div>
        </section>

        <section className="rounded-2xl border border-borde bg-white p-4 md:p-6">
          <h2 className="mb-2 text-lg font-bold">Pago</h2>
          <label className="flex items-center gap-3 rounded-xl border-2 border-marca bg-marca-suave/40 p-3">
            <input type="radio" checked readOnly className="size-4 accent-[var(--color-marca)]" />
            <span>
              <span className="block font-semibold">Transferencia bancaria</span>
              <span className="text-sm text-suave">Te mostramos los datos de la cuenta al confirmar el pedido.</span>
            </span>
          </label>
          <p className="mt-2 text-xs text-suave">Pago con tarjeta y QR (uPay): próximamente.</p>
        </section>
      </div>

      <aside className="h-fit space-y-3 rounded-2xl border border-borde bg-white p-4 lg:sticky lg:top-32">
        <h2 className="text-lg font-bold">Tu pedido</h2>
        <ul className="max-h-72 space-y-2 overflow-y-auto text-sm">
          {items.map((x) => (
            <li key={x.cod} className="flex justify-between gap-3">
              <span className="line-clamp-2">
                {x.cantidad} × {x.nombre}
              </span>
              <span className="shrink-0 font-semibold">{gs((x.precio ?? 0) * x.cantidad)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-borde pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-suave">Subtotal</span>
            <span>{gs(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-suave">Envío</span>
            <span>{loc ? (loc.tipo === "envio" ? gs(envio) : loc.tipo === "retiro" ? "Sin costo" : "Cobro a destino") : "Elegí tu ciudad"}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-extrabold text-marca">{gs(subtotal + envio)}</span>
          </div>
          <p className="text-right text-xs text-suave">Precios en guaraníes, IVA incluido</p>
        </div>

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

        <label className="flex items-start gap-2.5 text-sm">
          <input type="checkbox" required className="mt-0.5 size-5 shrink-0 accent-[var(--color-marca)]" />
          <span>
            Leí y acepto los{" "}
            <Link href="/info/terminos-y-condiciones" target="_blank" className="font-semibold text-marca underline">
              Términos y condiciones
            </Link>{" "}
            y la{" "}
            <Link href="/info/politica-de-privacidad" target="_blank" className="font-semibold text-marca underline">
              Política de privacidad
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={enviando}
          className="h-12 w-full rounded-lg bg-acento font-bold text-white hover:bg-acento-oscuro disabled:opacity-60"
        >
          {enviando ? "Enviando…" : "Confirmar pedido"}
        </button>
        <p className="text-xs text-suave">
          Tenés 5 días hábiles desde que recibís el pedido para arrepentirte de la compra (
          <Link href="/info/politicas-de-devolucion" target="_blank" className="underline">
            política de devolución
          </Link>
          ).
        </p>
      </aside>
    </form>
  );
}
