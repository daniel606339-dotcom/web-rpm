"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/config";
import { linkWhatsApp } from "@/lib/format";
import { recargarCuenta, sb } from "@/lib/portal";

const campo = "h-12 w-full rounded-[10px] border border-borde bg-white px-3.5 text-base outline-none focus:border-marca focus:ring-2 focus:ring-marca/15";

/** Llega desde el enlace de invitación (o de "nueva contraseña") que genera RPM. */
export default function Activar() {
  const router = useRouter();
  const [paso, setPaso] = useState<"verificando" | "clave" | "error">("verificando");
  const [clave, setClave] = useState("");
  const [clave2, setClave2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const hecho = useRef(false);

  useEffect(() => {
    if (hecho.current) return;
    hecho.current = true;
    const q = new URLSearchParams(window.location.search);
    const token_hash = q.get("token_hash");
    const type = q.get("type") === "recovery" ? "recovery" : "invite";
    if (!token_hash) {
      setTimeout(() => setPaso("error"), 0);
      return;
    }
    sb.auth.verifyOtp({ token_hash, type }).then(({ error }) => {
      window.history.replaceState(null, "", "/empresas/activar");
      setPaso(error ? "error" : "clave");
    });
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (clave.length < 8) return setError("La contraseña tiene que tener al menos 8 caracteres.");
    if (clave !== clave2) return setError("Las contraseñas no coinciden.");
    setGuardando(true);
    setError(null);
    const { error } = await sb.auth.updateUser({ password: clave });
    setGuardando(false);
    if (error) return setError("No se pudo guardar la contraseña. Probá con otra.");
    await recargarCuenta();
    router.push("/empresas");
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-borde bg-white p-6 md:p-8">
      <h1 className="mb-2 text-2xl font-bold">Acceso al portal de empresas</h1>
      {paso === "verificando" && <p className="text-suave">Verificando el enlace…</p>}
      {paso === "error" && (
        <>
          <p className="mb-4 text-suave">El enlace venció o ya se usó. Pedile a tu vendedor uno nuevo.</p>
          <a
            href={linkWhatsApp(SITE.whatsapp, "Hola RPM, necesito un enlace nuevo para entrar al portal de empresas.")}
            target="_blank"
            rel="noopener"
            className="inline-flex h-11 items-center rounded-lg bg-marca px-5 font-bold text-white"
          >
            Pedir enlace nuevo
          </a>
        </>
      )}
      {paso === "clave" && (
        <form onSubmit={guardar} className="space-y-4">
          <p className="text-suave">Elegí tu contraseña para entrar de ahora en más con tu email.</p>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Contraseña nueva</span>
            <input type="password" autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} className={campo} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Repetir contraseña</span>
            <input type="password" autoComplete="new-password" value={clave2} onChange={(e) => setClave2(e.target.value)} className={campo} />
          </label>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={guardando} className="h-12 w-full rounded-lg bg-marca font-bold text-white disabled:opacity-60">
            {guardando ? "Guardando…" : "Guardar y entrar"}
          </button>
        </form>
      )}
    </div>
  );
}
