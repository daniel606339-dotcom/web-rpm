"use client";

import { useState } from "react";

/** Enlace privado para subir el comprobante más tarde (si el cliente paga después). */
export default function EnlaceComprobante({ numero, token }: { numero: string; token: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <p className="text-sm text-suave">
      ¿Pagás más tarde?{" "}
      <button
        className="text-marca underline"
        onClick={async () => {
          const url = `${window.location.origin}/comprobante?n=${encodeURIComponent(numero)}&t=${encodeURIComponent(token)}`;
          try {
            await navigator.clipboard.writeText(url);
            setCopiado(true);
          } catch {
            window.prompt("Guardá este enlace para subir tu comprobante:", url);
          }
        }}
      >
        {copiado ? "Enlace copiado ✓" : "Copiá el enlace para subir el comprobante después"}
      </button>
    </p>
  );
}
