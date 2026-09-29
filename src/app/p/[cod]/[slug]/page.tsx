import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getDepartamento, getLinea, getProducto, getRelacionados } from "@/lib/data";
import { SITE } from "@/lib/config";
import { disponibles, gs, urlProducto } from "@/lib/format";
import Migas, { type Miga } from "@/components/Migas";
import JsonLd from "@/components/JsonLd";
import AgregarCarrito from "@/components/AgregarCarrito";
import ProductoTarjeta from "@/components/ProductoTarjeta";
import { IconoCamion, IconoEscudo, IconoFactura } from "@/components/iconos";

export const revalidate = 900;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ cod: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cod } = await params;
  const p = await getProducto(decodeURIComponent(cod));
  if (!p) return { title: "Producto no encontrado" };
  const descripcion =
    p.seo_description ??
    `${p.nombre}${p.marca_nombre ? ` de ${p.marca_nombre}` : ""}. ${p.precio_venta ? `${gs(p.precio_venta)}. ` : ""}Venta a empresas y particulares en Paraguay. Pedí por WhatsApp o comprá online.`;
  return {
    title: p.seo_title ?? p.nombre,
    description: descripcion,
    alternates: { canonical: urlProducto(p) },
    openGraph: { title: p.nombre, description: descripcion, images: p.foto_url ? [p.foto_url] : undefined, type: "website" },
  };
}

export default async function PaginaProducto({ params }: Props) {
  const { cod: codRaw, slug } = await params;
  const cod = decodeURIComponent(codRaw);
  const p = await getProducto(cod);
  if (!p) notFound();

  // Solo se publican artículos con stock: sin stock, llevar a su categoría (o 404).
  if ((p.cant_dispon ?? 0) <= 0) {
    const linea = p.linea_slug ? await getLinea(p.linea_slug) : null;
    if (linea) permanentRedirect(`/c/${linea.slug}`);
    notFound();
  }

  const url = urlProducto(p);
  if (`/p/${encodeURIComponent(cod)}/${slug}` !== url) permanentRedirect(url);

  const [dep, relacionados] = await Promise.all([p.departamento ? getDepartamento(p.departamento) : null, getRelacionados(p)]);
  const hayStock = (p.cant_dispon ?? 0) > 0;

  const migas: Miga[] = [];
  if (dep) migas.push({ nombre: dep.nombre, href: `/d/${dep.slug}` });
  if (p.linea_slug && p.linea_nombre) migas.push({ nombre: p.linea_nombre, href: `/c/${p.linea_slug}` });
  migas.push({ nombre: p.nombre });

  return (
    <div className="contenedor py-4 md:py-6">
      <Migas items={migas} />

      <div className="grid gap-6 md:grid-cols-2 lg:gap-10">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-borde bg-white">
          {p.foto_url ? (
            <Image src={p.foto_url} alt={p.nombre} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-contain p-6" />
          ) : (
            <div className="flex h-full items-center justify-center text-suave">Sin foto</div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            {p.marca_nombre && p.marca_slug && (
              <Link href={`/m/${p.marca_slug}`} className="text-sm font-semibold uppercase tracking-wide text-suave hover:text-marca">
                {p.marca_nombre}
              </Link>
            )}
            <h1 className="mt-1 text-2xl font-bold leading-tight md:text-3xl">{p.nombre}</h1>
            <p className="mt-2 text-sm text-suave">
              Código: {p.cod_articulo}
              {p.cod_barra_art && p.cod_barra_art !== p.cod_articulo ? ` · EAN: ${p.cod_barra_art}` : ""}
            </p>
          </div>

          <div className="rounded-2xl border border-borde bg-white p-4 md:p-5">
            <div className="text-3xl font-extrabold text-marca">{gs(p.precio_venta)}</div>
            <div className={`mt-1 text-sm font-semibold ${hayStock ? "text-ok" : "text-suave"}`}>
              {hayStock ? `● En stock: ${disponibles(p.cant_dispon)}` : "Sin stock"}
            </div>
            <div className="mt-4">
              <AgregarCarrito
                cod={p.cod_articulo}
                nombre={p.nombre}
                precio={p.precio_venta}
                foto={p.foto_url}
                url={url}
                whatsapp={SITE.whatsapp}
                hayStock={hayStock}
                stock={Math.floor(p.cant_dispon ?? 0)}
              />
            </div>
          </div>

          <ul className="grid gap-2 text-sm text-suave sm:grid-cols-3">
            <li className="flex items-center gap-2 rounded-xl bg-white p-3">
              <IconoFactura className="size-5 shrink-0 text-marca" /> Factura legal
            </li>
            <li className="flex items-center gap-2 rounded-xl bg-white p-3">
              <IconoCamion className="size-5 shrink-0 text-marca" /> Entrega a empresas
            </li>
            <li className="flex items-center gap-2 rounded-xl bg-white p-3">
              <IconoEscudo className="size-5 shrink-0 text-marca" /> 19 años en el mercado
            </li>
          </ul>

          {p.texto && (
            <div className="prose max-w-none rounded-2xl border border-borde bg-white p-4 text-sm leading-relaxed whitespace-pre-line">{p.texto}</div>
          )}
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-bold">Más en {p.linea_nombre}</h2>
            {p.linea_slug && (
              <Link href={`/c/${p.linea_slug}`} className="text-sm font-semibold text-marca hover:underline">
                Ver todos
              </Link>
            )}
          </div>
          <ul className="scroll-x -mx-4 flex gap-3 px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:px-0 xl:grid-cols-8">
            {relacionados.map((r) => (
              <li key={r.cod_articulo} className="flex w-44 shrink-0 lg:w-auto">
                <ProductoTarjeta p={r} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.nombre,
          sku: p.cod_articulo,
          ...(p.cod_barra_art && /^\d{8,14}$/.test(p.cod_barra_art) ? { gtin: p.cod_barra_art } : {}),
          ...(p.foto_url ? { image: [p.foto_url] } : {}),
          ...(p.marca_nombre ? { brand: { "@type": "Brand", name: p.marca_nombre } } : {}),
          ...(p.linea_nombre ? { category: p.linea_nombre } : {}),
          description: p.texto ?? p.nombre,
          url: `${SITE.url}${url}`,
          ...(p.precio_venta
            ? {
                offers: {
                  "@type": "Offer",
                  url: `${SITE.url}${url}`,
                  priceCurrency: SITE.moneda,
                  price: p.precio_venta,
                  availability: hayStock ? "https://schema.org/InStock" : "https://schema.org/BackOrder",
                  itemCondition: "https://schema.org/NewCondition",
                  seller: { "@type": "Organization", name: "Distribuidora RPM S.A." },
                },
              }
            : {}),
        }}
      />
    </div>
  );
}
