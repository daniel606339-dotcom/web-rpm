"use client";

import { useState } from "react";
import { sb } from "./cliente";

const fecha = (s: string) =>
  new Date(s).toLocaleString("es-PY", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Asuncion" });

/** Abre el comprobante que subió el cliente (bucket privado: enlace firmado por 10 minutos). */
export default function VerComprobante({ path, cuando }: { path: string; cuando: string | null }) {
  const [abriendo, setAbriendo] = useState(false);
  async function abrir() {
    setAbriendo(true);
    const ventana = window.open("", "_blank");
    const { data, error } = await sb.storage.from("web-comprobantes").createSignedUrl(path, 600);
    setAbriendo(false);
    if (error || !data) {
      ventana?.close();
      alert("No se pudo abrir el comprobante.");
      return;
    }
    if (ventana) ventana.location.href = data.signedUrl;
    else window.location.href = data.signedUrl;
  }
  return (
    <p className="mt-1">
      <button onClick={abrir} className="font-semibold text-ok underline">
        {abriendo ? "Abriendo…" : "Ver comprobante de pago"}
      </button>
      {cuando && <span className="text-suave"> · subido {fecha(cuando)}</span>}
    </p>
  );
}
