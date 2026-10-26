"use client";

import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { BANCO, SITE } from "@/lib/config";
import { gs } from "@/lib/format";

export interface ItemPresupuesto {
  linea: number;
  cod: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  iva: number;
}

export interface Presupuesto {
  numero: string;
  creado_at: string;
  vence_at: string;
  validez_dias: number;
  razon_social: string;
  ruc: string;
  contacto: string | null;
  email: string;
  telefono: string;
  observaciones: string | null;
  gravado10: number;
  gravado5: number;
  exento: number;
  iva10: number;
  iva5: number;
  total: number;
  items: ItemPresupuesto[];
}

const fecha = (s: string) =>
  new Date(s).toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Asuncion" });
const n = (v: number) => new Intl.NumberFormat("es-PY").format(v);
const textoIva = (v: number) => (v >= 10 ? "10%" : v > 0 ? "5%" : "Exenta");

/**
 * El presupuesto en una hoja A4 (794 x 1123 px), con el diseño aprobado. Se usa en la página
 * pública del presupuesto (imprimir / guardar como PDF) y en el panel.
 * `enlace` es la dirección del presupuesto: se muestra como QR para confirmarlo online.
 */
export default function HojaPresupuesto({ p, enlace }: { p: Presupuesto; enlace: string }) {
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    QRCode.toDataURL(enlace, { margin: 0, width: 200, color: { dark: "#01297e", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(null));
  }, [enlace]);

  const etiqueta = "m-0 text-[11px] font-bold uppercase tracking-[1px] text-suave";
  const cols = "grid grid-cols-[82px_minmax(0,1fr)_46px_80px_54px_92px] gap-2";

  return (
    <div className="hoja-presupuesto relative flex min-h-[1123px] w-[794px] flex-col bg-white text-texto">
      <div className="h-2 bg-marca" />
      <div className="flex items-start justify-between px-14 pt-8">
        <Image src="/logo.png" alt="Distribuidora RPM" width={150} height={73} className="h-[73px] w-[150px] object-contain" priority />
        <div className="flex flex-col items-end gap-1">
          <p className="m-0 font-titulo text-[30px] font-extrabold tracking-[1px] text-marca">PRESUPUESTO</p>
          <p className="m-0 font-titulo text-lg font-bold text-acento">N° {p.numero}</p>
        </div>
      </div>

      <div className="flex gap-2.5 px-14 pt-[18px]">
        {[
          ["Fecha", fecha(p.creado_at)],
          ["Válido hasta", `${fecha(p.vence_at)} · ${p.validez_dias} días`],
          ["Condición", "Contado"],
          ["Entrega", "24/72 hs hábiles"],
        ].map(([t, v]) => (
          <div key={t} className="flex-1 rounded-[10px] bg-fondo px-3.5 py-2.5">
            <p className={etiqueta}>{t}</p>
            <p className="m-0 mt-0.5 text-[15px] font-bold">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5 px-14 pt-3.5">
        <div className="flex flex-col gap-[3px] rounded-[10px] border-[1.5px] border-borde px-3.5 py-3">
          <p className={`${etiqueta} mb-0.5`}>Cliente</p>
          <p className="m-0 text-base font-bold text-titulo">{p.razon_social}</p>
          <p className="m-0 text-[13px]">RUC {p.ruc}</p>
          {p.contacto && <p className="m-0 text-[13px]">Atención: {p.contacto}</p>}
          <p className="m-0 text-[13px]">
            {p.email} · {p.telefono}
          </p>
        </div>
        <div className="flex flex-col gap-[3px] rounded-[10px] border-[1.5px] border-borde px-3.5 py-3">
          <p className={`${etiqueta} mb-0.5`}>Atendido por</p>
          <p className="m-0 text-base font-bold text-titulo">Ventas · Distribuidora RPM</p>
          <p className="m-0 text-[13px]">{SITE.email}</p>
          <p className="m-0 text-[13px]">WhatsApp {SITE.whatsappVisible.replace("+595 ", "0")}</p>
          <p className="m-0 text-[13px]">Sujeto a disponibilidad de stock</p>
        </div>
      </div>

      <div className="px-14 pt-4">
        <div className="overflow-hidden rounded-[10px] border-[1.5px] border-borde">
          <div className={`${cols} bg-marca px-3 py-[9px] text-[11px] font-bold uppercase tracking-[0.6px] text-white`}>
            <span>Código</span>
            <span>Descripción</span>
            <span className="text-right">Cant.</span>
            <span className="text-right">Precio unit.</span>
            <span className="text-right">IVA</span>
            <span className="text-right">Total</span>
          </div>
          {p.items.map((it, i) => (
            <div key={it.linea} className={`${cols} items-center border-t border-[#eef0f4] px-3 py-1.5 text-[13px] leading-snug [break-inside:avoid] ${i % 2 ? "bg-[#f8f9fc]" : "bg-white"}`}>
              <span className="truncate text-suave">{it.cod}</span>
              <span className="font-semibold">{it.nombre}</span>
              <span className="text-right">{n(it.cantidad)}</span>
              <span className="text-right">{n(it.precio)}</span>
              <span className="text-right text-suave">{textoIva(it.iva)}</span>
              <span className="text-right font-bold">{n(it.subtotal)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start justify-between gap-5 px-14 pt-3.5">
        <div className="flex flex-1 flex-col gap-[3px] text-xs leading-normal text-[#3b4458]">
          <p className="m-0 text-[13px] font-bold text-titulo">Condiciones</p>
          <p className="m-0">• Precios en guaraníes, IVA incluido (10%, 5% o exento según el producto).</p>
          <p className="m-0">• Válido por {p.validez_dias} días o hasta agotar stock.</p>
          <p className="m-0">• Pago por transferencia al {BANCO.banco.replace(" S.A.E.C.A.", "")}, alias {BANCO.alias}.</p>
          <p className="m-0">• Garantía de 15 días por fallas de fábrica.</p>
          {p.observaciones && <p className="m-0 mt-1">Observaciones: {p.observaciones}</p>}
        </div>
        <div className="flex w-[270px] flex-col gap-1.5">
          {p.gravado10 > 0 && <Fila t="Gravado 10%" v={p.gravado10} />}
          {p.gravado5 > 0 && <Fila t="Gravado 5%" v={p.gravado5} />}
          {p.exento > 0 && <Fila t="Exento" v={p.exento} />}
          <div className="flex justify-between border-t border-borde pt-[5px] text-xs text-suave">
            <span>
              IVA incluido{p.iva10 > 0 ? `: 10% ${gs(p.iva10)}` : ""}
              {p.iva5 > 0 ? ` · 5% ${gs(p.iva5)}` : ""}
            </span>
            <span>{gs(p.iva10 + p.iva5)}</span>
          </div>
          <div className="mt-0.5 flex items-center justify-between rounded-[10px] bg-marca px-3.5 py-2.5 text-white">
            <span className="text-sm font-bold">TOTAL</span>
            <span className="font-titulo text-[22px] font-extrabold">{gs(p.total)}</span>
          </div>
        </div>
      </div>

      <div className="px-14 pt-4">
        <div className="flex items-center gap-4 rounded-xl bg-[#fff4ed] px-4 py-3.5">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="Código QR del presupuesto" className="size-[76px] shrink-0" />
          ) : (
            <div className="size-[76px] shrink-0" />
          )}
          <div className="flex flex-col gap-[3px]">
            <p className="m-0 font-titulo text-base font-bold text-[#a33600]">¿Lo confirmás? Hacé el pedido en un minuto</p>
            <p className="m-0 text-[13px] leading-[1.45]">
              Escaneá el código o abrí el enlace del presupuesto: con un toque los productos quedan cargados en tu carrito. También
              podés responder el correo o escribirnos por WhatsApp.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-5 bg-marca px-14 pb-[18px] pt-4 text-white [break-inside:avoid]">
        <div className="flex flex-col gap-[3px] text-xs leading-[1.4]">
          <p className="m-0 text-[13px] font-bold">
            {SITE.razonSocial} · RUC {SITE.ruc}
          </p>
          <p className="m-0 text-[#dfe6f7]">
            {SITE.direccion.replace(", Barrio", `, ${SITE.entreCalles}, Barrio`)}
          </p>
          <p className="m-0 text-[#dfe6f7]">
            Llamadas {SITE.telefonoVisible} · WhatsApp {SITE.whatsappVisible.replace("+595 ", "0")} · {SITE.email}
          </p>
        </div>
        <div className="flex flex-col items-end gap-[3px] text-xs">
          <p className="m-0 text-[13px] font-bold">www.distribuidorarpm.com.py</p>
          <p className="m-0 text-[#dfe6f7]">Instagram: @distribuidorarpm</p>
        </div>
      </div>
    </div>
  );
}

function Fila({ t, v }: { t: string; v: number }) {
  return (
    <div className="flex justify-between text-[13px] text-[#3b4458]">
      <span>{t}</span>
      <span>{gs(v)}</span>
    </div>
  );
}
