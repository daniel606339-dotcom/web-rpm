import { revalidatePath, revalidateTag } from "next/cache";
import { SUPABASE } from "@/lib/config";
import { ETIQUETA } from "@/lib/db";

/**
 * POST /api/revalidar  (Authorization: Bearer <token de sesión del panel>)
 * Vuelve a leer de Supabase menú, categorías, precios y stock en toda la web,
 * sin esperar la hora de caché. Solo para usuarios del staff.
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!token) return Response.json({ ok: false, error: "Sin sesión" }, { status: 401 });

  const res = await fetch(`${SUPABASE.url}/rest/v1/rpc/es_staff`, {
    method: "POST",
    headers: {
      apikey: SUPABASE.key,
      Authorization: `Bearer ${token}`,
      "Content-Profile": "web",
      "Content-Type": "application/json",
    },
    body: "{}",
    cache: "no-store",
  });
  if (!res.ok || (await res.json()) !== true) {
    return Response.json({ ok: false, error: "Sin permiso" }, { status: 403 });
  }

  revalidateTag(ETIQUETA, { expire: 0 });
  revalidatePath("/", "layout");
  return Response.json({ ok: true });
}
