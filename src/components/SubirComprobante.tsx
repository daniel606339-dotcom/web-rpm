"use client";

import { useRef, useState } from "react";
import { sb } from "@/lib/portal";

const TIPOS = "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf";
const MAX_MB = 8;

/**
 * Sube el comprobante de transferencia de un pedido web. El archivo va al bucket privado
 * "web-comprobantes" en la carpeta del token secreto del pedido (solo lo ve el personal de RPM)
 * y queda registrado en el pedido para verlo desde el panel.
 */
export default function SubirComprobante({
  numero,
  token,
  yaSubido = false,
}: {
  numero: string;
  token: string;
  yaSubido?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<"listo" | "subiendo" | "ok" | "error">(yaSubido ? "ok" : "listo");
  const [error, setError] = useState<string | null>(null);

  async function subir(archivo: File) {
    setError(null);
    if (archivo.size > MAX_MB * 1024 * 1024) {
      setError(`El archivo pesa más de ${MAX_MB} MB. Probá con una captura de pantalla.`);
      return;
    }
    setEstado("subiendo");
    const ext = (archivo.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
    const ruta = `${token}/comprobante-${Date.now()}.${ext}`;
    const { error: e1 } = await sb.storage.from("web-comprobantes").upload(ruta, archivo, {
      contentType: archivo.type || undefined,
      upsert: false,
    });
    if (e1) {
      setEstado("error");
      setError("No se pudo subir el archivo. Probá de nuevo o mandalo por WhatsApp.");
      return;
    }
    const { error: e2 } = await sb.rpc("registrar_comprobante", { p_numero: numero, p_token: token, p_path: ruta });
    if (e2) {
      setEstado("error");
      setError("El archivo se subió pero no se pudo asociar al pedido. Mandalo por WhatsApp, por favor.");
      return;
    }
    setEstado("ok");
  }

  return (
    <div className="rounded-xl border-[1.5px] border-dashed border-marca/40 bg-white p-4">
      <p className="font-bold text-titulo">Subí tu comprobante de transferencia</p>
      {estado === "ok" ? (
        <p className="mt-1 text-sm font-semibold text-ok">
          ✓ Recibimos tu comprobante del pedido {numero}. Lo verificamos y seguimos con tu pedido.
          <button onClick={() => setEstado("listo")} className="ml-2 font-normal text-suave underline">
            Subir otro
          </button>
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-suave">Foto o captura de pantalla (JPG, PNG o PDF). Queda guardado junto a tu pedido.</p>
          <input
            ref={input}
            type="file"
            accept={TIPOS}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) subir(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => input.current?.click()}
            disabled={estado === "subiendo"}
            className="mt-3 h-11 w-full rounded-lg bg-marca font-bold text-white disabled:opacity-60"
          >
            {estado === "subiendo" ? "Subiendo…" : "Elegir archivo o sacar foto"}
          </button>
        </>
      )}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
