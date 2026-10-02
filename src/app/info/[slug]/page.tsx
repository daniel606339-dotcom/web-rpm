import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE } from "@/lib/config";
import { linkWhatsApp } from "@/lib/format";
import Migas from "@/components/Migas";

/**
 * Páginas informativas. Para editar un texto, cambiarlo acá.
 * Una página sin "bloques" muestra "Estamos preparando esta sección" y no se indexa.
 */
interface Bloque {
  titulo?: string;
  parrafos?: string[];
  lista?: string[];
}

const PAGINAS: Record<string, { titulo: string; descripcion?: string; bloques?: Bloque[] }> = {
  "formas-de-entrega": {
    titulo: "Formas de entrega",
    descripcion: "Costos, plazos y zonas de entrega de Distribuidora RPM en Asunción, Gran Asunción y el interior.",
    bloques: [
      {
        parrafos: [
          "El costo del servicio de entrega depende de las dimensiones del o de los productos que se adquieran y de la dirección de entrega de los mismos. Dicho monto se define y es informado al usuario en el proceso de la compra.",
          "El plazo de entrega de la compra depende de la dirección de entrega. En Asunción y Gran Asunción la entrega se realizará en un plazo no mayor a 48 hs. y en el interior del país dentro de las 72 hs. Este tiempo se debe tomar a partir del email que el usuario recibe en su casilla de correo informando el envío de su compra.",
          "Por logística interna, para que el usuario disfrute de los productos más rápido, la compra puede ser enviada particionada en más de una entrega; esto se le informará previamente vía email.",
          "El servicio de entrega a domicilio se encuentra habilitado en determinadas localidades del país, las cuales podrán ser consultadas al tiempo de iniciarse el proceso de compra online, momento en el cual el usuario procederá a seleccionar según su conveniencia.",
          "El servicio de entrega a domicilio tendrá un costo, que aparecerá expresado y diferenciado en la etapa del proceso de llenado del carrito previa a la emisión de su pedido. Dicho costo se añadirá al de las mercaderías detalladas en la correspondiente factura.",
          "La confirmación del pedido y la aprobación de la emisión de la factura implicarán la aceptación del usuario del costo del servicio de entrega a domicilio y, consecuentemente, también del monto total de la correspondiente factura.",
        ],
      },
    ],
  },
  "medios-de-pago": {
    titulo: "Medios de pago",
    descripcion: "Cómo pagar tus compras en Distribuidora RPM.",
    bloques: [
      {
        titulo: "Transferencia bancaria",
        parrafos: [
          "Al confirmar el pedido te mostramos los datos de la cuenta y te los enviamos por email. Cuando hagas la transferencia, mandanos el comprobante con el número de pedido por WhatsApp o por email.",
          "Banco Continental S.A.E.C.A. · Cuenta corriente en guaraníes N° 34-23106000-03 · Alias: RUC 80122009-2 · Titular: DISTRIBUIDORA RPM S.A.",
        ],
      },
      {
        titulo: "Tarjetas de crédito y débito",
        parrafos: ["Próximamente vas a poder pagar con tarjeta directamente en el sitio."],
      },
      {
        titulo: "Precios",
        parrafos: [
          "Todos los precios están expresados en guaraníes (Gs.) e incluyen IVA. El costo de envío se muestra por separado antes de confirmar el pedido.",
        ],
      },
    ],
  },
  "politicas-de-devolucion": {
    titulo: "Política de devolución",
    descripcion: "Derecho de retracto, cambios y garantía de los productos comprados en Distribuidora RPM.",
    bloques: [
      {
        titulo: "Derecho de retracto (compras en este sitio)",
        parrafos: [
          "Si compraste a través de este sitio podés arrepentirte de la compra dentro de los 5 (cinco) días hábiles siguientes a la recepción del producto, sin necesidad de explicar el motivo, conforme al artículo 30 de la Ley N° 4868/2013 de Comercio Electrónico.",
          "Para hacerlo, escribinos a ventas@distribuidorarpm.com.py o por WhatsApp indicando el número de pedido. El producto debe estar sin uso, en perfecto estado, con su embalaje original, accesorios y manuales, y con la factura.",
          "Te devolvemos el importe total pagado por el producto por el mismo medio de pago que usaste: por transferencia bancaria si pagaste por transferencia, o mediante la anulación o reversión de la operación ante la procesadora si pagaste con tarjeta (el plazo de acreditación en este caso depende de tu banco). El costo de devolver el producto corre por cuenta del comprador.",
        ],
      },
      {
        titulo: "Productos sin derecho de retracto",
        parrafos: ["Según el artículo 31 de la misma ley, el retracto no se aplica a:"],
        lista: [
          "Productos perecederos o de rápido vencimiento.",
          "Productos hechos a medida o personalizados (por ejemplo, sellos o impresos con datos del cliente).",
          "Discos, grabaciones y programas informáticos que hayan sido abiertos o desprecintados.",
        ],
      },
      {
        titulo: "Errores en el envío",
        parrafos: [
          "Si recibiste un producto distinto al que pediste, una cantidad incorrecta o un producto dañado en el transporte, avisanos dentro de las 24 horas hábiles de recibido el pedido para que lo cambiemos sin costo.",
        ],
      },
      {
        titulo: "Garantía",
        parrafos: [
          "Garantizamos los productos que vendemos contra defectos de fabricación durante 15 (quince) días desde su recepción, sin perjuicio de la garantía del fabricante y de los derechos que te otorga la Ley N° 1334/1998 de Defensa del Consumidor y del Usuario. Dentro de ese plazo reparamos, cambiamos el producto o te devolvemos el dinero. La garantía no cubre daños por mal uso, golpes, instalación incorrecta o desgaste normal.",
        ],
      },
    ],
  },
  nosotros: {
    titulo: "Nosotros",
    descripcion: "Distribuidora RPM: desde 2007 proveedores de insumos de oficina, informática y limpieza para empresas en Paraguay.",
    bloques: [
      {
        titulo: "Nuestra historia",
        parrafos: [
          "Nacimos en marzo del año 2007, con la intención de ganar un espacio en el competitivo mercado nacional, generando relaciones comerciales de confianza con proveedores y clientes, porque además del buen precio, le damos a nuestro trabajo el valor agregado de la personalización, lo que nos permite un conocimiento más profundo del cliente y sus necesidades.",
        ],
      },
      {
        titulo: "Misión",
        parrafos: [
          "Acercar a empresas y personas soluciones a sus necesidades de insumos de informática, útiles de escritorio y artículos para limpieza, con fuerte orientación a la atención personalizada, convirtiéndonos así en asesores, con propuestas bien pensadas que satisfacen los requerimientos de calidad, stock y economía.",
        ],
      },
      {
        titulo: "Visión",
        parrafos: [
          "Convertirnos en una empresa proveedora integral, distinguida por las compañías por nuestra calidad: de productos, atención y servicio post venta.",
        ],
      },
      {
        titulo: "Valores",
        lista: ["Innovación", "Orientación al cliente", "Trabajo en equipo", "Respeto a las personas", "Dinamismo"],
      },
    ],
  },
  "trabaja-con-nosotros": { titulo: "Trabajá con nosotros" },
  "terminos-y-condiciones": {
    titulo: "Términos y condiciones",
    descripcion: "Condiciones de compra en el sitio de Distribuidora RPM S.A.",
    bloques: [
      {
        titulo: "1. Quiénes somos",
        parrafos: [
          "Este sitio pertenece a DISTRIBUIDORA RPM S.A., RUC 80122009-2, con domicilio en 12 de Octubre N° 521, Barrio Pinozá, Asunción, Paraguay. Email: ventas@distribuidorarpm.com.py · WhatsApp: +595 976 634 184.",
          "Al comprar en este sitio aceptás estos términos y condiciones, que se rigen por la Ley N° 4868/2013 de Comercio Electrónico, su Decreto reglamentario N° 1165/2014 y la Ley N° 1334/1998 de Defensa del Consumidor y del Usuario.",
        ],
      },
      {
        titulo: "2. Productos, precios y stock",
        parrafos: [
          "Los precios están expresados en guaraníes (Gs.) e incluyen IVA. El costo de envío depende de la ciudad de entrega y se muestra antes de confirmar el pedido.",
          "Publicamos solo productos con stock disponible y la cantidad disponible se actualiza cada hora. Si al preparar tu pedido algún producto se agotó, te avisamos para que elijas reemplazarlo, recibir el resto o cancelar esa parte, y no te cobramos lo que no podamos entregar.",
          "Las imágenes son de los productos reales; los colores pueden variar levemente según la pantalla.",
        ],
      },
      {
        titulo: "3. Cómo se hace la compra",
        parrafos: ["La compra no requiere crear una cuenta. Los pasos son:"],
        lista: [
          "Agregás los productos al carrito, donde podés cambiar cantidades o quitar productos.",
          "En \"Finalizar compra\" elegís entrega a domicilio o retiro, y cargás tus datos y los de facturación.",
          "Antes de confirmar ves el resumen: productos, cantidades, precios, costo de envío y total con IVA.",
          "Al presionar \"Confirmar pedido\" aceptás la compra. Te mostramos el número de pedido en pantalla y, si nos diste tu email, te enviamos la confirmación con el detalle.",
          "Nos comunicamos con vos para coordinar el pago y la entrega.",
        ],
      },
      {
        titulo: "4. Pago y factura",
        parrafos: [
          "Por ahora el pago es por transferencia bancaria (ver Medios de pago). El pedido se despacha una vez acreditado el pago, salvo que hayamos acordado otra condición.",
          "Emitimos factura legal a nombre del RUC o la cédula que nos indiques en el pedido.",
        ],
      },
      {
        titulo: "5. Entrega",
        parrafos: [
          "Los plazos, zonas y costos de entrega están en la sección Formas de entrega. Si elegís retirar, el pedido queda listo en 2 horas en nuestro depósito, dentro del horario de atención.",
        ],
      },
      {
        titulo: "6. Retracto, cambios y garantía",
        parrafos: [
          "Tenés 5 días hábiles desde que recibís el producto para arrepentirte de la compra, y 15 días de garantía por defectos de fabricación. Las condiciones y excepciones están en la Política de devolución.",
        ],
      },
      {
        titulo: "7. Compras de empresas",
        parrafos: [
          "Las empresas con cuenta en nuestro portal compran con las condiciones comerciales acordadas con Distribuidora RPM (lista de precios, plazos de pago y direcciones de entrega). En lo no previsto en ese acuerdo se aplican estos términos.",
        ],
      },
      {
        titulo: "8. Registro del pedido y consultas",
        parrafos: [
          "Cada pedido queda registrado con su número, fecha y detalle. Podés pedirnos una copia en cualquier momento.",
          "Para consultas o reclamos escribinos a ventas@distribuidorarpm.com.py o por WhatsApp al +595 976 634 184. Si no quedás conforme con nuestra respuesta, podés recurrir a la Secretaría de Defensa del Consumidor y el Usuario (SEDECO) o al Ministerio de Industria y Comercio, autoridad de aplicación de la Ley de Comercio Electrónico.",
        ],
      },
      {
        titulo: "9. Cambios en estos términos",
        parrafos: [
          "Podemos actualizar estos términos. Cada compra se rige por los términos vigentes al momento de confirmarla. Vigentes desde el 1 de octubre de 2026.",
        ],
      },
    ],
  },
  "politica-de-privacidad": {
    titulo: "Política de privacidad",
    descripcion: "Cómo Distribuidora RPM S.A. trata los datos personales de sus clientes.",
    bloques: [
      {
        titulo: "Responsable",
        parrafos: [
          "DISTRIBUIDORA RPM S.A., RUC 80122009-2, 12 de Octubre N° 521, Asunción, es responsable de los datos personales que nos das en este sitio. Contacto: ventas@distribuidorarpm.com.py.",
        ],
      },
      {
        titulo: "Qué datos pedimos",
        lista: [
          "Nombre o razón social, RUC o cédula, teléfono y email.",
          "Dirección, ciudad y referencias de entrega.",
          "Tu ubicación, solo si elegís compartirla con el botón \"Usar mi ubicación actual\".",
          "El detalle de tus pedidos.",
          "En el portal de empresas, el email y el nombre de cada usuario.",
        ],
      },
      {
        titulo: "Para qué los usamos",
        parrafos: [
          "Para procesar y entregar tu pedido, emitir la factura, comunicarnos con vos sobre la compra y atender consultas o reclamos. También usamos estadísticas de navegación sin identificarte para mejorar el sitio. Solo te enviaremos promociones si nos lo autorizás, y siempre vas a poder darte de baja de forma simple y gratuita.",
        ],
      },
      {
        titulo: "Con quién los compartimos",
        parrafos: [
          "No vendemos ni cedemos tus datos. Solo los compartimos con quienes necesitamos para cumplir con tu pedido o con la ley: el servicio de entrega, la procesadora de pagos, nuestros proveedores de tecnología (alojamiento del sitio, base de datos y envío de emails) y las autoridades que lo requieran, como la administración tributaria.",
        ],
      },
      {
        titulo: "Cuánto tiempo y con qué seguridad",
        parrafos: [
          "Guardamos los datos de las compras durante el plazo que exigen las normas tributarias y comerciales. El sitio usa conexión cifrada (HTTPS) y el acceso a los datos de pedidos está restringido al personal autorizado.",
          "Tu carrito y tu último pedido se guardan solo en tu navegador, para que no los pierdas. Podés borrarlos limpiando los datos del sitio en tu navegador.",
        ],
      },
      {
        titulo: "Tus derechos",
        parrafos: [
          "Podés pedirnos en cualquier momento acceder a tus datos, corregirlos, eliminarlos u oponerte a su uso, escribiendo a ventas@distribuidorarpm.com.py, de acuerdo con la Ley N° 7593/2025 de Protección de Datos Personales y demás normas vigentes.",
        ],
      },
      {
        titulo: "Cambios",
        parrafos: ["Podemos actualizar esta política y publicaremos aquí la versión vigente. Vigente desde el 1 de octubre de 2026."],
      },
    ],
  },
};

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(PAGINAS).map((slug) => ({ slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = PAGINAS[slug];
  return {
    title: p?.titulo,
    description: p?.descripcion,
    alternates: { canonical: `/info/${slug}` },
    robots: p?.bloques ? undefined : { index: false, follow: true },
  };
}

export default async function Info({ params }: Props) {
  const p = PAGINAS[(await params).slug];
  if (!p) notFound();
  return (
    <div className="contenedor py-4 md:py-6">
      <Migas items={[{ nombre: p.titulo }]} />
      <article className="max-w-3xl rounded-2xl border border-borde bg-white p-6 md:p-10">
        <h1 className="mb-5 text-2xl font-bold md:text-3xl">{p.titulo}</h1>
        {p.bloques ? (
          <div className="space-y-6 text-[17px] leading-relaxed">
            {p.bloques.map((b, i) => (
              <section key={i}>
                {b.titulo && <h2 className="mb-2 text-lg font-bold md:text-xl">{b.titulo}</h2>}
                {b.parrafos?.map((t, j) => (
                  <p key={j} className="mb-3 last:mb-0">
                    {t}
                  </p>
                ))}
                {b.lista && (
                  <ul className={`grid gap-2 ${b.lista.some((t) => t.length > 40) ? "" : "sm:grid-cols-2"}`}>
                    {b.lista.map((t) => (
                      <li key={t} className="flex items-start gap-2">
                        <span className="mt-[0.6em] size-2 shrink-0 rounded-full bg-acento" aria-hidden />
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        ) : (
          <p className="text-suave">
            Estamos preparando esta sección. Consultanos por{" "}
            <a href={linkWhatsApp(SITE.whatsapp, `Hola RPM, quiero consultar sobre ${p.titulo.toLowerCase()}.`)} className="font-semibold text-marca underline">
              WhatsApp
            </a>
            .
          </p>
        )}
      </article>
    </div>
  );
}
