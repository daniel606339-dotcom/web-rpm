import Link from "next/link";

/**
 * Logo de RPM. Pendiente: cuando tengan el archivo, subirlo a /public/logo.svg
 * (o .png) y poner la ruta en LOGO_ARCHIVO. Mientras tanto se ve el espacio reservado.
 */
const LOGO_ARCHIVO: string | null = null; // p. ej. "/logo.svg"

export default function Logo({ sobreOscuro = false, className = "" }: { sobreOscuro?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="Distribuidora RPM, inicio" className={`flex shrink-0 items-center ${className}`}>
      {LOGO_ARCHIVO ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={LOGO_ARCHIVO} alt="Distribuidora RPM" className="h-10 w-auto" />
      ) : (
        <span
          className={`flex h-10 w-[132px] items-center justify-center rounded-lg border-[1.5px] border-dashed text-xs font-semibold tracking-wide md:h-11 md:w-[150px] ${
            sobreOscuro ? "border-[#9fb2dc] text-[#dbe3f5]" : "border-[#b8c2d8] text-suave"
          }`}
        >
          [LOGO RPM]
        </span>
      )}
    </Link>
  );
}
