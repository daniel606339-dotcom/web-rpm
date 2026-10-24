import type { Metadata } from "next";
import Activar from "./Activar";

export const metadata: Metadata = { title: "Activar acceso", robots: { index: false, follow: false } };

export default function Pagina() {
  return (
    <div className="contenedor py-8 md:py-12">
      <Activar />
    </div>
  );
}
