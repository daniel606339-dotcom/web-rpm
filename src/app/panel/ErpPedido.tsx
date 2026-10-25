"use client";

import { useEffect, useState } from "react";
import { sb } from "./cliente";

/** Datos del pedido que necesita este bloque. */
export interface PedidoErp {
  id: number;
  ruc: string;
  origen: "web" | "portal";
  cod_cliente: string | null;
  erp_estado: "aprobado" | "enviado" | "error" | null;
  erp_nro: number | null;
  erp_mensaje: string | null;
  erp_aprobado_por: string | null;
  erp_enviado_at: string | null;
}

interface ClienteErp {
  cod_cliente: string;
  razon_social: string;
  ruc: string;
  activo: boolean | null;
}

/** Parte del RUC antes del guion, solo dígitos ("80013744-2" -> "80013744"). */
function rucBase(ruc: string) {
  return (ruc.split("-")[0] ?? "").replace(/\D/g, "");
}

/**
 * Bloque "Inventiva" del detalle de un pedido web: busca el cliente por RUC en los clientes
 * del ERP (web.clientes, sincronizado cada hora) y deja aprobar el envío. El script
 * sync-pedidos-erp.ps1 del servidor toma los aprobados y los graba en VT_PEDIDOS.
 */
export default function ErpPedido({ p, onCambio }: { p: PedidoErp; onCambio: () => void }) {
  const [candidatos, setCandidatos] = useState<ClienteErp[] | null>(null);
  const [elegido, setElegido] = useState(p.cod_cliente ?? "");
  const [manual, setManual] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editable = p.origen !== "portal" && (p.erp_estado == null || p.erp_estado === "error");

  useEffect(() => {
    if (!editable) return;
    // RUC muy corto o vacío: se busca algo que no existe y queda la lista vacía.
    const base = rucBase(p.ruc).length >= 5 ? rucBase(p.ruc) : "-sin-ruc-";
    sb.from("clientes")
      .select("cod_cliente, razon_social, ruc, activo")
      .or(`ruc.eq.${base},ruc.like.${base}-*`)
      .limit(10)
      .then(({ data }) => {
        const xs = (data ?? []) as ClienteErp[];
        setCandidatos(xs);
        if (!p.cod_cliente && xs.length === 1) setElegido(xs[0].cod_cliente);
      });
  }, [editable, p.ruc, p.cod_cliente]);

  async function buscarCodigo() {
    const cod = manual.trim();
    if (!cod) return;
    const { data } = await sb.from("clientes").select("cod_cliente, razon_social, ruc, activo").eq("cod_cliente", cod).maybeSingle();
    // Un cliente recién cargado en el ERP todavía no está acá (la copia se actualiza cada hora),
    // pero se puede usar igual: el servidor lo verifica directo en Inventiva al grabar.
    const fila: ClienteErp = (data as ClienteErp | null) ?? {
      cod_cliente: cod,
      razon_social: "(recién cargado: se verifica en Inventiva al grabar)",
      ruc: "",
      activo: null,
    };
    setError(null);
    setCandidatos((xs) => [fila, ...(xs ?? []).filter((x) => x.cod_cliente !== cod)]);
    setElegido(cod);
  }

  async function aprobar() {
    setEnviando(true);
    setError(null);
    const { error } = await sb.rpc("pedido_erp_aprobar", { p_id: p.id, p_cod_cliente: elegido });
    setEnviando(false);
    if (error) setError(error.message);
    else onCambio();
  }

  async function cancelar() {
    const { error } = await sb.rpc("pedido_erp_cancelar", { p_id: p.id });
    if (error) setError(error.message);
    else onCambio();
  }

  if (p.origen === "portal") {
    return (
      <div className="rounded-lg bg-white p-3">
        <p className="font-bold">Inventiva</p>
        <p className="text-suave">Los pedidos del portal de empresas todavía se cargan a mano.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg bg-white p-3">
      <p className="font-bold">Inventiva</p>

      {p.erp_estado === "enviado" && (
        <p className="rounded bg-ok/10 p-2 font-semibold text-ok">
          Grabado como PED A {p.erp_nro} · cliente {p.cod_cliente}
        </p>
      )}
      {p.erp_estado === "aprobado" && (
        <>
          <p className="rounded bg-acento/10 p-2">
            En cola para el ERP (cliente {p.cod_cliente}). El servidor lo graba en unos minutos.
            {p.erp_aprobado_por ? ` Aprobó ${p.erp_aprobado_por}.` : ""}
          </p>
          <button onClick={cancelar} className="text-xs text-suave underline">
            Sacar de la cola
          </button>
        </>
      )}
      {p.erp_estado === "error" && <p className="rounded bg-red-50 p-2 text-red-700">No se pudo grabar: {p.erp_mensaje}</p>}

      {editable && (
        <>
          {candidatos == null ? (
            <p className="text-suave">Buscando el RUC en Inventiva…</p>
          ) : candidatos.length === 0 ? (
            <p className="text-red-700">
              El RUC {p.ruc} no aparece en Inventiva. Cargá el cliente en el ERP y escribí su código abajo (no hace falta esperar la
              sincronización).
            </p>
          ) : (
            <div className="space-y-1">
              {candidatos.map((c) => (
                <label key={c.cod_cliente} className="flex items-start gap-2">
                  <input type="radio" name={`cli-${p.id}`} checked={elegido === c.cod_cliente} onChange={() => setElegido(c.cod_cliente)} className="mt-1" />
                  <span>
                    <b>{c.cod_cliente}</b> · {c.razon_social} <span className="text-suave">· {c.ruc}</span>
                    {c.activo === false && <span className="ml-1 text-red-700">(inactivo)</span>}
                  </span>
                </label>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Otro código de cliente"
              className="h-9 min-w-0 flex-1 rounded-lg border border-borde px-2"
            />
            <button onClick={buscarCodigo} className="h-9 rounded-lg border border-borde px-3">
              Usar
            </button>
          </div>
          <button
            onClick={aprobar}
            disabled={!elegido || enviando}
            className="h-10 w-full rounded-lg bg-marca font-bold text-white disabled:opacity-50"
          >
            {enviando ? "Enviando…" : p.erp_estado === "error" ? "Reintentar envío al ERP" : "Enviar al ERP"}
          </button>
          <p className="text-xs text-suave">Vendedor 19 VENTAS WEB · lista 6 · condición de venta de la ficha del cliente.</p>
        </>
      )}
      {error && <p className="text-red-700">{error}</p>}
    </div>
  );
}
