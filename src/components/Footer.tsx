import Link from "next/link";
import { getDepartamentos } from "@/lib/data";
import { SITE } from "@/lib/config";
import { linkWhatsApp } from "@/lib/format";
import Logo from "./Logo";

export default async function Footer() {
  const deps = await getDepartamentos();
  return (
    <footer className="mt-12 bg-marca-oscuro text-white/80">
      <div className="contenedor grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm">{SITE.descripcion}</p>
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-white">Categorías</h2>
          <ul className="space-y-1.5 text-sm">
            {deps.map((d) => (
              <li key={d.slug}>
                <Link href={`/d/${d.slug}`} className="hover:text-white">
                  {d.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-white">Empresas</h2>
          <ul className="space-y-1.5 text-sm">
            <li>
              <a href={linkWhatsApp(SITE.whatsapp, "Hola RPM, quiero pedir un presupuesto para mi empresa.")} className="hover:text-white">
                Pedir presupuesto
              </a>
            </li>
            <li>
              <Link href="/buscar" className="hover:text-white">
                Catálogo completo
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-white">Contacto</h2>
          <ul className="space-y-1.5 text-sm">
            <li>
              <a href={linkWhatsApp(SITE.whatsapp, "Hola RPM")} className="hover:text-white">
                WhatsApp +{SITE.whatsapp}
              </a>
            </li>
            <li>{SITE.ciudad}, Paraguay</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Distribuidora RPM S.A.
      </div>
    </footer>
  );
}
