import { sb } from "@/lib/portal";

/** Cliente de Supabase del panel: el mismo del portal (una sola sesión por navegador). */
export { sb };

/** Hace que la web vuelva a leer los datos de Supabase al instante. Devuelve true si salió bien. */
export async function refrescarWeb(): Promise<boolean> {
  const token = (await sb.auth.getSession()).data.session?.access_token;
  if (!token) return false;
  const r = await fetch("/api/revalidar", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  return r.ok;
}
