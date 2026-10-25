import { HORARIO_ATENCION, SITE } from "@/lib/config";
import { getEnvioDesde, getMenu, getRubros } from "@/lib/data";
import { gs } from "@/lib/format";

/**
 * /llms.txt — resumen del sitio para asistentes de IA (formato llmstxt.org):
 * quiénes somos, qué vendemos y qué páginas conviene leer o citar.
 * Las categorías y rubros salen del catálogo, así que se actualiza solo.
 */
export const revalidate = 3600;

export async function GET() {
  const [menu, rubros, envioDesde] = await Promise.all([getMenu(), getRubros(), getEnvioDesde()]);
  const u = (p: string) => `${SITE.url}${p}`;

  const texto = `# ${SITE.nombre}

> ${SITE.razonSocial} (RUC ${SITE.ruc}) es una distribuidora mayorista de ${SITE.ciudad}, Paraguay, con ${SITE.anios} años en el mercado. Vende artículos de librería, papelería, limpieza, higiene, cafetería y empaque a empresas, comercios y particulares, con entrega en Asunción, Gran Asunción y el interior del país.

- Solo se publican productos con stock disponible; precio y stock se actualizan cada hora desde el sistema de la empresa.
- Precios en guaraníes (PYG) con IVA incluido. Factura legal con el RUC del cliente.
- Se compra sin crear cuenta, por el carrito del sitio o por WhatsApp. Pago por transferencia bancaria.
- Envío ${envioDesde ? `desde ${gs(envioDesde)} ` : ""}según la ciudad (hasta 48 h en Asunción y Gran Asunción, 72 h en el interior) o retiro sin costo en el depósito, listo en 2 horas.
- Las empresas con precios acordados compran en el portal para empresas: ${u("/empresas")}

Contacto: teléfono ${SITE.telefonoVisible} · WhatsApp ${SITE.whatsappVisible} · ${SITE.email} · ${SITE.direccion} (${SITE.entreCalles}), Paraguay.
Horario de atención: ${HORARIO_ATENCION.map((h) => h.texto.toLowerCase()).join(" y ")}.

## Información para clientes

- [Formas de entrega](${u("/info/formas-de-entrega")}): plazos, zonas y costo de envío, retiro en depósito.
- [Medios de pago](${u("/info/medios-de-pago")}): transferencia bancaria y precios con IVA.
- [Política de devolución](${u("/info/politicas-de-devolucion")}): derecho de retracto de 5 días hábiles y garantía de 15 días.
- [Nosotros](${u("/info/nosotros")}): historia, misión y valores de la empresa.
- [Términos y condiciones](${u("/info/terminos-y-condiciones")})
- [Política de privacidad](${u("/info/politica-de-privacidad")})

## Categorías de productos

${menu
  .map((d) => `- [${d.nombre}](${u(`/d/${d.slug}`)}): ${d.lineas.map((l) => l.nombre).join(", ")}.`)
  .join("\n")}

## Productos por tipo de negocio

${rubros
  .filter((r) => r.lineas.length > 0)
  .map((r) => `- [${r.nombre}](${u(`/rubro/${r.slug}`)})${r.descripcion ? `: ${r.descripcion}` : ""}`)
  .join("\n")}

## Optional

- [Mapa del sitio con todos los productos](${u("/sitemap.xml")})
- [Buscar productos](${u("/buscar?q=")}): agregar el término de búsqueda al final de la dirección.
`;

  return new Response(texto, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
