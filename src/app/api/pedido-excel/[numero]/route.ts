import { SUPABASE } from "@/lib/config";
import { excelPedido, type ItemExcel } from "@/lib/excelPedido";

/**
 * GET /api/pedido-excel/W000001?t=<excel_token>
 * Devuelve el Excel del pedido para el ERP. Lo usa N8N para adjuntarlo al email.
 * Sin el token correcto (viene en el aviso del pedido) responde 404.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ numero: string }> }) {
  const { numero } = await ctx.params;
  const token = new URL(req.url).searchParams.get("t") ?? "";
  if (!/^W\d{6,}$/.test(numero) || !/^[0-9a-f-]{36}$/i.test(token)) {
    return new Response("No encontrado", { status: 404 });
  }

  const res = await fetch(`${SUPABASE.url}/rest/v1/rpc/pedido_excel`, {
    method: "POST",
    headers: {
      apikey: SUPABASE.key,
      Authorization: `Bearer ${SUPABASE.key}`,
      "Content-Profile": "web",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_numero: numero, p_token: token }),
    cache: "no-store",
  });
  if (!res.ok) return new Response("Error", { status: 502 });
  const items = (await res.json()) as ItemExcel[];
  if (!items.length) return new Response("No encontrado", { status: 404 });

  return new Response(excelPedido(numero, items) as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${numero}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
