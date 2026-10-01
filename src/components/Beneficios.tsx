import Link from "next/link";
import { getEnvioDesde } from "@/lib/data";
import { gs } from "@/lib/format";
import { IconoCamion, IconoFactura, IconoTarjeta, IconoTienda } from "./iconos";

/** Lo que el cliente gana comprando acá: envío, retiro, factura y pago. Los montos salen de web.localidades. */
export async function listaBeneficios() {
  const desde = await getEnvioDesde();
  return [
    {
      Icono: IconoCamion,
      titulo: desde ? `Envío desde ${gs(desde)}` : "Entrega a domicilio",
      texto: "Asunción y Gran Asunción en 48 hs",
      href: "/info/formas-de-entrega",
    },
    { Icono: IconoTienda, titulo: "Retiro sin costo", texto: "Listo en 2 horas en nuestro depósito", href: "/info/formas-de-entrega" },
    { Icono: IconoFactura, titulo: "Factura legal", texto: "A nombre de tu empresa, con tu RUC" },
    { Icono: IconoTarjeta, titulo: "Comprá sin crear cuenta", texto: "Pagás por transferencia bancaria" },
  ];
}

/** Franja de beneficios: en celular se desliza, en escritorio 4 columnas. */
export default async function Beneficios({ className = "" }: { className?: string }) {
  const items = await listaBeneficios();
  return (
    <ul className={`scroll-x -mx-4 flex gap-2.5 px-4 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:px-0 ${className}`}>
      {items.map(({ Icono, titulo, texto, href }) => {
        const contenido = (
          <>
            <Icono className="mt-0.5 size-5 shrink-0 text-marca" />
            <span>
              <span className="block text-sm font-bold leading-tight text-titulo md:text-[15px]">{titulo}</span>
              <span className="block text-xs text-suave md:text-[13px]">{texto}</span>
            </span>
          </>
        );
        const clase = "flex h-full min-w-[220px] items-start gap-3 rounded-xl border border-borde bg-white px-4 py-3 md:min-w-0 md:py-3.5";
        return (
          <li key={titulo} className="shrink-0 md:shrink">
            {href ? (
              <Link href={href} className={`${clase} transition hover:border-marca`}>
                {contenido}
              </Link>
            ) : (
              <div className={clase}>{contenido}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
