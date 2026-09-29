import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  // Solo el sitio de producción se deja indexar; las direcciones de prueba no.
  if (process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/carrito", "/buscar"] },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
