import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo.png";
import logoBlanco from "../../public/logo-blanco.png";

/**
 * Logo de RPM.
 *   public/logo.png         fondo transparente, para fondos claros
 *   public/logo-blanco.png  "RPM" en blanco, para fondos oscuros (barra del celular, pie)
 */
export default function Logo({ sobreOscuro = false, className = "" }: { sobreOscuro?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="Distribuidora RPM, inicio" className={`flex shrink-0 items-center ${className}`}>
      <Image
        src={sobreOscuro ? logoBlanco : logo}
        alt="Distribuidora RPM"
        priority
        sizes="120px"
        className="h-10 w-auto md:h-12"
      />
    </Link>
  );
}
