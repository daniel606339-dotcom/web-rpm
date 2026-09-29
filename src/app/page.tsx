import Image from "next/image";
import Link from "next/link";
import { getCategoriaConFoto, getMenu, getProductosPorCodigo, getRubros } from "@/lib/data";
import { SITE } from "@/lib/config";
import { BANNERS, CATEGORIAS_BUSCADAS, LO_MAS_PEDIDO } from "@/lib/inicio";
import { linkWhatsApp } from "@/lib/format";
import Carrusel from "@/components/Carrusel";
import ProductoTarjeta from "@/components/ProductoTarjeta";
import { IconoCamion, IconoChat, IconoDepartamento, IconoEscudo, IconoFactura, IconoRubro } from "@/components/iconos";

export const revalidate = 900;

function Titulo({ children, href, texto }: { children: React.ReactNode; href?: string; texto?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4 md:mb-4">
      <h2 className="text-lg font-bold md:text-2xl">{children}</h2>
      {href && (
        <Link href={href} className="shrink-0 text-[13px] font-semibold text-marca underline underline-offset-2 md:text-sm">
          {texto}
        </Link>
      )}
    </div>
  );
}

export default async function Inicio() {
  const [menu, rubros, categorias, masPedido] = await Promise.all([
    getMenu(),
    getRubros(),
    Promise.all(CATEGORIAS_BUSCADAS.map(getCategoriaConFoto)),
    getProductosPorCodigo(LO_MAS_PEDIDO),
  ]);

  const confianza = [
    { Icono: IconoEscudo, titulo: `${SITE.anios} años en el mercado`, texto: "Proveedor de empresas en todo Paraguay" },
    { Icono: IconoCamion, titulo: "Entrega a domicilio", texto: "Asunción y Gran Asunción en 48 hs · interior 72 hs" },
    { Icono: IconoFactura, titulo: "Factura legal", texto: "A nombre de tu empresa, con tu RUC" },
    { Icono: IconoChat, titulo: "Pedidos por WhatsApp", texto: "Armá tu pedido y te lo confirmamos" },
  ];

  return (
    <div className="pb-4">
      <div className="contenedor mt-3 md:mt-5">
        <Carrusel banners={BANNERS} />
      </div>

      {/* Confianza (escritorio) */}
      <ul className="contenedor mt-6 hidden grid-cols-4 gap-4 md:grid">
        {confianza.map(({ Icono, titulo, texto }) => (
          <li key={titulo} className="flex items-start gap-3 rounded-xl border border-borde bg-white px-4 py-3.5">
            <Icono className="mt-0.5 size-5 shrink-0 text-marca" />
            <div>
              <p className="text-[15px] font-bold leading-tight text-titulo">{titulo}</p>
              <p className="text-[13px] text-suave">{texto}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Departamentos (celular) */}
      <nav aria-label="Departamentos" className="contenedor mt-5 md:hidden">
        <ul className="grid grid-cols-4 gap-x-2 gap-y-4">
          {menu.slice(0, 7).map((d) => (
            <li key={d.slug}>
              <Link href={`/d/${d.slug}`} className="flex flex-col items-center gap-1.5 text-center text-[13px] font-semibold leading-tight">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-marca-suave text-marca">
                  <IconoDepartamento slug={d.slug} />
                </span>
                {d.nombre.replace("Alimentos y bebidas", "Cafetería").replace("Mantenimiento integral", "Mantenimiento")}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/categorias" className="flex flex-col items-center gap-1.5 text-[13px] font-semibold">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-marca-suave text-marca">
                <IconoDepartamento slug="todo" />
              </span>
              Ver todo
            </Link>
          </li>
        </ul>
      </nav>

      {/* Tipo de negocio */}
      {rubros.length > 0 && (
        <section className="contenedor mt-7 md:mt-10">
          <Titulo href="/rubro" texto="Ver todos los rubros">
            Comprá por tipo de negocio
          </Titulo>
          <p className="-mt-2 mb-4 hidden text-suave md:block">Lo que usa tu empresa todos los meses, en un solo lugar</p>
          {/* celular: chips */}
          <ul className="flex flex-wrap gap-2 md:hidden">
            {rubros.map((r) => (
              <li key={r.slug}>
                <Link href={`/rubro/${r.slug}`} className="block rounded-full border border-[#c9cedb] px-3.5 py-2.5 text-sm font-semibold">
                  {r.nombre.split(" y ")[0]}
                </Link>
              </li>
            ))}
          </ul>
          {/* escritorio: tarjetas */}
          <ul className="hidden grid-cols-3 gap-4 md:grid">
            {rubros.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/rubro/${r.slug}`}
                  className="flex h-full items-start gap-4 rounded-xl border border-borde bg-white p-4 transition hover:border-marca hover:shadow-md"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-marca-suave text-marca">
                    <IconoRubro slug={r.slug} />
                  </span>
                  <span>
                    <span className="block font-bold text-titulo">{r.nombre}</span>
                    <span className="mt-1 block text-sm leading-snug text-suave">{r.descripcion}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Categorías más buscadas */}
      <section className="contenedor mt-7 md:mt-10">
        <Titulo href="/categorias" texto="Ver todas">
          Categorías más buscadas
        </Titulo>
        <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
          {categorias.map(
            (c) =>
              c && (
                <li key={c.slug}>
                  <Link
                    href={`/c/${c.slug}`}
                    className="flex h-full items-center gap-3 rounded-xl border border-borde bg-white p-2.5 transition hover:border-marca hover:shadow-md"
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[#f3f4f7] md:size-14">
                      {c.foto && <Image src={c.foto} alt="" fill sizes="56px" className="object-contain p-1" />}
                    </span>
                    <span className="text-sm font-bold text-titulo md:text-[15px]">{c.nombre}</span>
                  </Link>
                </li>
              ),
          )}
        </ul>
      </section>

      {/* Lo más pedido */}
      {masPedido.length > 0 && (
        <section className="contenedor mt-7 md:mt-10">
          <Titulo href="/buscar" texto="Ver más productos">
            Lo más pedido
          </Titulo>
          <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
            {masPedido.map((p) => (
              <li key={p.cod_articulo} className="flex">
                <ProductoTarjeta p={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Empresas */}
      <section className="contenedor mt-8 md:mt-12">
        <div className="flex flex-col gap-4 rounded-[14px] bg-marca p-4 text-white md:flex-row md:items-center md:justify-between md:rounded-2xl md:px-9 md:py-8">
          <div>
            <h2 className="text-lg font-bold !text-white md:text-2xl">¿Comprás para tu empresa?</h2>
            <p className="mt-1 text-sm text-[#dbe3f5] md:text-base">
              Tu lista de precios, tu saldo, tus pedidos anteriores y repetir la compra del mes en un clic.
            </p>
          </div>
          <div className="flex shrink-0 gap-2 md:gap-3">
            <a
              href={linkWhatsApp(SITE.whatsapp, "Hola RPM, quiero pedir un presupuesto para mi empresa.")}
              target="_blank"
              rel="noopener"
              className="flex h-11 items-center rounded-[10px] border-[1.5px] border-white px-4 text-sm font-bold md:h-12 md:px-5 md:text-[15px]"
            >
              Pedir presupuesto
            </a>
            <Link
              href="/empresas"
              className="flex h-11 items-center rounded-[10px] bg-white px-4 text-sm font-bold text-marca md:h-12 md:px-5 md:text-[15px]"
            >
              Ingresar como empresa
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
