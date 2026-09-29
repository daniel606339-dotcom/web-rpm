"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCarrito } from "./carrito";
import { IconoCarrito, IconoCategorias, IconoInicio, IconoUsuario } from "./iconos";

/** Barra de navegación inferior en celular. */
export default function NavInferior() {
  const ruta = usePathname();
  const n = useCarrito().reduce((s, x) => s + x.cantidad, 0);
  const items = [
    { href: "/", texto: "Inicio", Icono: IconoInicio, activo: ruta === "/" },
    { href: "/categorias", texto: "Categorías", Icono: IconoCategorias, activo: ruta.startsWith("/categorias") || /^\/(c|d)\//.test(ruta) },
    { href: "/carrito", texto: "Mi pedido", Icono: IconoCarrito, activo: ruta === "/carrito", badge: n },
    { href: "/empresas", texto: "Mi cuenta", Icono: IconoUsuario, activo: ruta === "/empresas" },
  ];
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t border-borde bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {items.map(({ href, texto, Icono, activo, badge }) => (
        <Link
          key={href}
          href={href}
          aria-current={activo ? "page" : undefined}
          className={`relative flex flex-col items-center justify-center gap-0.5 text-xs ${activo ? "font-bold text-marca" : "font-semibold text-suave"}`}
        >
          <Icono className="size-[22px]" />
          {texto}
          {!!badge && (
            <span className="absolute left-1/2 top-1.5 ml-2 min-w-5 rounded-full bg-acento px-1 text-center text-[11px] font-bold leading-5 text-white">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
