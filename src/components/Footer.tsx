import Link from "next/link";
import { SITE } from "@/lib/config";
import { linkWhatsApp } from "@/lib/format";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-12 bg-marca-oscuro text-[15px] text-white/85">
      <div className="contenedor grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo sobreOscuro />
          <p className="mt-3">{SITE.anios} años distribuyendo en Paraguay</p>
        </div>
        <div>
          <h2 className="mb-3 text-[15px] font-bold !text-white">Contacto</h2>
          <ul className="space-y-2">
            <li>{SITE.direccion}</li>
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-white">
                {SITE.email}
              </a>
            </li>
            <li>
              <a href={linkWhatsApp(SITE.whatsapp, "Hola RPM")} target="_blank" rel="noopener" className="hover:text-white">
                WhatsApp {SITE.whatsappVisible}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-[15px] font-bold !text-white">Comprar</h2>
          <ul className="space-y-2">
            <li><Link href="/info/formas-de-entrega" className="hover:text-white">Formas de entrega</Link></li>
            <li><Link href="/info/medios-de-pago" className="hover:text-white">Medios de pago</Link></li>
            <li><Link href="/info/politicas-de-devolucion" className="hover:text-white">Política de devolución</Link></li>
            <li><Link href="/categorias" className="hover:text-white">Todas las categorías</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-[15px] font-bold !text-white">Empresa</h2>
          <ul className="space-y-2">
            <li><Link href="/info/nosotros" className="hover:text-white">Nosotros</Link></li>
            <li><Link href="/empresas" className="hover:text-white">Portal para empresas</Link></li>
            <li><Link href="/info/trabaja-con-nosotros" className="hover:text-white">Trabajá con nosotros</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs leading-relaxed text-white/60">
        <p>
          © {new Date().getFullYear()} DISTRIBUIDORA RPM S.A. · RUC 80122009-2 · {SITE.direccion}
        </p>
        <p className="mt-1">
          Precios en guaraníes, IVA incluido ·{" "}
          <Link href="/info/terminos-y-condiciones" className="underline hover:text-white">
            Términos y condiciones
          </Link>{" "}
          ·{" "}
          <Link href="/info/politica-de-privacidad" className="underline hover:text-white">
            Política de privacidad
          </Link>
        </p>
      </div>
    </footer>
  );
}
