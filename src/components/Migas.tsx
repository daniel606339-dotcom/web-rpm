import Link from "next/link";
import { SITE } from "@/lib/config";
import JsonLd from "./JsonLd";

export interface Miga {
  nombre: string;
  href?: string;
}

/** Ruta de navegación visible + datos estructurados BreadcrumbList para Google. */
export default function Migas({ items }: { items: Miga[] }) {
  const todas: Miga[] = [{ nombre: "Inicio", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Ruta" className="scroll-x mb-4 whitespace-nowrap text-sm text-suave">
        <ol className="flex items-center gap-1.5">
          {todas.map((m, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>›</span>}
              {m.href && i < todas.length - 1 ? (
                <Link href={m.href} className="hover:text-marca hover:underline">
                  {m.nombre}
                </Link>
              ) : (
                <span className="text-texto" aria-current={i === todas.length - 1 ? "page" : undefined}>
                  {m.nombre}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: todas.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: m.nombre,
            ...(m.href ? { item: `${SITE.url}${m.href}` } : {}),
          })),
        }}
      />
    </>
  );
}
