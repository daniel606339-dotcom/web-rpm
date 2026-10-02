import { createClient } from "@supabase/supabase-js";
import { SUPABASE } from "@/lib/config";

/** Cliente de Supabase del panel (esquema web, sesión del usuario del staff). */
export const sb = createClient(SUPABASE.url, SUPABASE.key, { db: { schema: "web" } });

/** Hace que la web vuelva a leer los datos de Supabase al instante. Devuelve true si salió bien. */
export async function refrescarWeb(): Promise<boolean> {
  const token = (await sb.auth.getSession()).data.session?.access_token;
  if (!token) return false;
  const r = await fetch("/api/revalidar", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  return r.ok;
}
