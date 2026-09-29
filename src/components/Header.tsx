import Link from "next/link";
import { getMenu } from "@/lib/data";
import { SITE } from "@/lib/config";
import { linkWhatsApp } from "@/lib/format";
import Logo from "./Logo";
import CarritoBoton from "./CarritoBoton";
import MenuMovil from "./MenuMovil";
import { IconoBuscar, IconoWhatsApp } from "./iconos";

export default async function Header() {
  const menu = await getMenu();
  return (
    <header className="sticky top-0 z-40 bg-marca shadow-md">
      <div className="contenedor flex h-16 items-center gap-3">
        <MenuMovil menu={menu.map((d) => ({ slug: d.slug, nombre: d.nombre, lineas: d.lineas.map((l) => ({ slug: l.slug, nombre: l.nombre })) }))} />
        <Logo />
        <form action="/buscar" method="get" role="search" className="mx-2 hidden flex-1 md:flex">
          <label htmlFor="q-escritorio" className="sr-only">Buscar productos</label>
          <input
            id="q-escritorio"
            name="q"
            type="search"
            placeholder="Buscá por producto, marca o código"
            className="h-11 w-full rounded-l-lg border-0 bg-white px-4 text-texto outline-none placeholder:text-suave focus:ring-2 focus:ring-acento"
          />
          <button type="submit" className="flex h-11 items-center rounded-r-lg bg-acento px-5 text-white hover:bg-acento-oscuro" aria-label="Buscar">
            <IconoBuscar />
          </button>
        </form>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <a
            href={linkWhatsApp(SITE.whatsapp, "Hola RPM, quiero hacer una consulta.")}
            target="_blank"
            rel="noopener"
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 lg:flex"
          >
            <IconoWhatsApp className="size-5" /> Ventas
          </a>
          <CarritoBoton />
        </div>
      </div>

      {/* Buscador en celular */}
      <form action="/buscar" method="get" role="search" className="contenedor flex pb-3 md:hidden">
        <label htmlFor="q-celular" className="sr-only">Buscar productos</label>
        <input
          id="q-celular"
          name="q"
          type="search"
          placeholder="Buscá por producto, marca o código"
          className="h-11 w-full rounded-l-lg border-0 bg-white px-4 text-texto outline-none placeholder:text-suave"
        />
        <button type="submit" className="flex h-11 items-center rounded-r-lg bg-acento px-4 text-white" aria-label="Buscar">
          <IconoBuscar />
        </button>
      </form>

      {/* Departamentos en escritorio */}
      <nav aria-label="Departamentos" className="hidden border-t border-white/10 bg-marca-oscuro md:block">
        <ul className="contenedor flex">
          {menu.map((d) => (
            <li key={d.slug} className="group relative">
              <Link href={`/d/${d.slug}`} className="block px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white">
                {d.nombre}
              </Link>
              {d.lineas.length > 0 && (
                <div className="invisible absolute left-0 top-full z-50 w-[520px] rounded-b-lg bg-white p-4 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {d.lineas.map((l) => (
                      <li key={l.slug}>
                        <Link href={`/c/${l.slug}`} className="block rounded px-2 py-1 text-sm text-texto hover:bg-fondo hover:text-marca">
                          {l.nombre}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
