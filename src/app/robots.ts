import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  // Hasta pasar al dominio real (RPM_INDEXAR=1) no se deja indexar nada, ni web-rpm.vercel.app.
  if (process.env.RPM_INDEXAR !== "1") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/carrito", "/buscar", "/checkout", "/panel"] },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
