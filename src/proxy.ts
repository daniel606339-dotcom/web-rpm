import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE } from "@/lib/config";

/**
 * Redirecciones 301 desde las URL viejas de Porta (/producto/..., /categoria/...,
 * /marca/..., /index.php/...) a las nuevas. La regla vive en Supabase:
 * web.resolver_redireccion(path). Solo corre en las rutas viejas (ver matcher).
 */
export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  try {
    let destino: string | null = null;
    if (process.env.RPM_FIXTURES === "1") {
      const m = path.match(/\/marca\/\d+\/([^/?]+)/);
      destino = m ? `/m/${m[1]}` : null;
    } else {
      const res = await fetch(`${SUPABASE.url}/rest/v1/rpc/resolver_redireccion`, {
        method: "POST",
        headers: {
          apikey: SUPABASE.key,
          Authorization: `Bearer ${SUPABASE.key}`,
          "Content-Profile": "web",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ p_path: path }),
      });
      if (res.ok) destino = (await res.json()) as string | null;
    }
    if (destino) {
      return NextResponse.redirect(new URL(destino, req.url), 301);
    }
  } catch {
    // Si Supabase no responde, seguimos: mejor un 404 que una caída.
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/index.php",
    "/index.php/:path*",
    "/index",
    "/producto/:path*",
    "/categoria/:path*",
    "/marca/:path*",
    "/marcas",
    "/marcas/:path*",
  ],
};
