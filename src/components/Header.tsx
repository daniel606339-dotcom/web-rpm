import Link from "next/link";
import { getMenu } from "@/lib/data";
import { SITE } from "@/lib/config";
import { BUSQUEDAS_RAPIDAS } from "@/lib/inicio";
import { linkWhatsApp } from "@/lib/format";
import Logo from "./Logo";
import CarritoBoton from "./CarritoBoton";
import { IconoBuscar, IconoUsuario, IconoWhatsApp } from "./iconos";

export default async function Header() {
  const menu = await getMenu();
  const wa = linkWhatsApp(SITE.whatsapp, "Hola RPM, quiero hacer una consulta.");
  return (
    <header className="md:sticky md:top-0 md:z-40 md:shadow-sm">
      {/* ---------- Escritorio ---------- */}
      <div className="hidden bg-marca-oscuro text-[13px] text-white/85 md:block">
        <div className="contenedor flex h-8 items-center justify-between">
          <span>
            {SITE.anios} años distribuyendo en Paraguay · {SITE.direccion.replace(", Barrio Pinozá", "")}
          </span>
          <nav className="flex items-center gap-5">
            <a href={wa} target="_blank" rel="noopener" className="hover:text-white">
              WhatsApp {SITE.whatsappVisible}
            </a>
            <a
              href={linkWhatsApp(SITE.whatsapp, "Hola RPM, quiero pedir un presupuesto para mi empresa.")}
              target="_blank"
              rel="noopener"
              className="hover:text-white"
            >
              Pedir presupuesto
            </a>
            <Link href="/empresas" className="font-bold text-white">
              Ingresar como empresa
            </Link>
          </nav>
        </div>
      </div>

      <div className="hidden bg-white md:block">
        <div className="contenedor flex h-[74px] items-center gap-6">
          <Logo />
          <form action="/buscar" method="get" role="search" className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-borde bg-white pl-4 pr-1 focus-within:border-marca">
            <IconoBuscar className="size-5 shrink-0 text-suave" />
            <label htmlFor="q-escritorio" className="sr-only">
              Buscar productos
            </label>
            <input
              id="q-escritorio"
              name="q"
              type="search"
              placeholder="Buscá entre más de 7.000 productos, por nombre o código"
              className="h-full flex-1 bg-transparent text-[15px] outline-none placeholder:text-suave"
            />
            <button type="submit" className="h-9 rounded-lg bg-marca px-4 text-sm font-bold text-white hover:bg-marca-oscuro">
              Buscar
            </button>
          </form>
          <Link href="/empresas" className="flex items-center gap-2 text-sm font-semibold text-texto hover:text-marca">
            <IconoUsuario className="size-5" /> Mi cuenta
          </Link>
          <CarritoBoton />
        </div>
      </div>

      <nav aria-label="Departamentos" className="hidden bg-marca md:block">
        <ul className="contenedor flex">
          {menu.map((d) => (
            <li key={d.slug} className="group relative">
              <Link href={`/d/${d.slug}`} className="block px-3 py-3 text-sm font-bold text-white first:pl-0 hover:bg-white/10">
                {d.nombre}
              </Link>
              {d.lineas.length > 0 && (
                <div className="invisible absolute left-0 top-full z-50 w-[520px] rounded-b-xl border border-borde bg-white p-4 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                    {d.lineas.map((l) => (
                      <li key={l.slug}>
                        <Link href={`/c/${l.slug}`} className="block rounded px-2 py-1.5 text-sm text-texto hover:bg-fondo hover:text-marca">
                          {l.nombre}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/d/${d.slug}`} className="mt-2 block px-2 text-sm font-semibold text-marca hover:underline">
                    Ver todo {d.nombre} →
                  </Link>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* ---------- Celular ---------- */}
      <div className="flex flex-col gap-3 bg-marca px-4 pb-3.5 pt-3 md:hidden">
        <div className="flex items-center justify-between">
          <Logo sobreOscuro />
          <a href={wa} target="_blank" rel="noopener" className="flex h-11 items-center gap-1.5 text-sm font-semibold text-white">
            <IconoWhatsApp className="size-5" /> WhatsApp
          </a>
        </div>
        <form action="/buscar" method="get" role="search" className="flex h-11 items-center gap-2 rounded-[10px] bg-white px-3">
          <IconoBuscar className="size-[18px] shrink-0 text-suave" />
          <label htmlFor="q-celular" className="sr-only">
            Buscar productos
          </label>
          <input id="q-celular" name="q" type="search" placeholder="Buscá un producto o código" className="h-full flex-1 bg-transparent text-base outline-none" />
        </form>
        <div className="scroll-x -mx-4 flex gap-2 px-4">
          {BUSQUEDAS_RAPIDAS.map((b) => (
            <Link key={b} href={`/buscar?q=${encodeURIComponent(b)}`} className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-[13px] text-white">
              {b}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
