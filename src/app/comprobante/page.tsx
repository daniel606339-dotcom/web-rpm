import type { Metadata } from "next";
import Comprobante from "./Comprobante";

export const metadata: Metadata = { title: "Subir comprobante de pago", robots: { index: false, follow: false } };

export default function Pagina() {
  return (
    <div className="contenedor py-8 md:py-12">
      <Comprobante />
    </div>
  );
}
