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
  "medios-de-pago": { titulo: "Medios de pago" },
  "politicas-de-devolucion": {
    titulo: "Política de devolución",
    descripcion: "Condiciones para devolución o cambio de productos comprados en Distribuidora RPM.",
    bloques: [
      {
        titulo: "Devolución o cambio de productos",
        parrafos: [
          "Los productos adquiridos sólo podrán ser devueltos o cambiados dentro de un periodo de no más de 24 horas hábiles de haber sido recibido el pedido y con la presentación de la factura emitida por Distribuidora RPM.",
        ],
      },
      {
        titulo: "Condiciones de devolución de productos",
        parrafos: [
          "Todos los productos a ser devueltos deberán entregarse junto con los embalajes originales y en perfecto estado de conservación, con los accesorios, manuales e instructivos del mismo en los casos que sean aplicables. Caso contrario no podrá hacerse efectiva la devolución.",
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
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {b.lista.map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-acento" aria-hidden />
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
