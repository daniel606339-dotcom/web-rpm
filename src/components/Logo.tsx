import Link from "next/link";

/**
 * Lugar del logo. Para usar el logo real: subir el archivo a /public/logo.svg
 * (o .png) y cambiar LOGO_ARCHIVO. Mientras tanto se muestra el nombre en texto.
 */
const LOGO_ARCHIVO: string | null = null; // p. ej. "/logo.svg"

export default function Logo({ claro = true }: { claro?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Distribuidora RPM, inicio">
      {LOGO_ARCHIVO ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={LOGO_ARCHIVO} alt="Distribuidora RPM" className="h-9 w-auto" />
      ) : (
        <span className={`flex items-baseline gap-1 leading-none ${claro ? "text-white" : "text-marca"}`}>
          <span className="text-2xl font-black tracking-tight">RPM</span>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Distribuidora</span>
        </span>
      )}
    </Link>
  );
}
