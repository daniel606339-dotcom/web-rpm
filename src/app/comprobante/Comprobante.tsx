"use client";

import { useEffect, useState } from "react";
import SubirComprobante from "@/components/SubirComprobante";
import { BANCO } from "@/lib/config";
import { gs, linkWhatsApp } from "@/lib/format";
import { sb } from "@/lib/portal";

interface Datos {
  numero: string;
  total: number;
  comprobante_at: string | null;
}

/** /comprobante?n=W000005&t=<token>: el cliente sube el comprobante de un pedido después de pagar. */
export default function Comprobante() {
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");
  const [datos, setDatos] = useState<Datos | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const n = q.get("n") ?? "";
    const t = q.get("t") ?? "";
    if (!/^W\d{6,}$/.test(n) || !/^[0-9a-f-]{36}$/i.test(t)) {
      setTimeout(() => setEstado("error"), 0);
      return;
    }
    sb.rpc("pedido_para_comprobante", { p_numero: n, p_token: t }).then(({ data }) => {
      if (!data) return setEstado("error");
      setToken(t);
      setDatos(data as Datos);
      setEstado("ok");
    });
  }, []);

  if (estado === "cargando") return <p className="text-suave">Cargando…</p>;
  if (estado === "error" || !datos)
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-borde bg-white p-6">
        <h1 className="text-xl font-bold">No encontramos el pedido</h1>
        <p className="mt-2 text-suave">
          El enlace no es válido. Mandanos el comprobante indicando tu número de pedido al WhatsApp de cobranzas{" "}
          <a className="text-marca underline" href={linkWhatsApp(BANCO.whatsappCobranzas, "Hola RPM, les envío el comprobante de mi pedido web.")}>
            {BANCO.whatsappCobranzasVisible}
          </a>{" "}
          o a {BANCO.emailComprobante}.
        </p>
      </div>
    );

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-borde bg-white p-6">
      <div>
        <h1 className="text-xl font-bold">Pedido {datos.numero}</h1>
        <p className="text-suave">Total a transferir: <b className="text-texto">{gs(datos.total)}</b></p>
      </div>
      <div className="rounded-xl bg-fondo p-4 text-sm leading-relaxed">
        <p>Banco: {BANCO.banco}</p>
        <p>Alias: {BANCO.alias}</p>
        <p>Cuenta: {BANCO.cuenta} ({BANCO.tipo})</p>
        <p>Razón social: {BANCO.razonSocial} · RUC {BANCO.ruc}</p>
      </div>
      <SubirComprobante numero={datos.numero} token={token} yaSubido={!!datos.comprobante_at} />
    </div>
  );
}
