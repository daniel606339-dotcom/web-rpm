import type { Metadata } from "next";
import VerPresupuesto from "./VerPresupuesto";

export const metadata: Metadata = { title: "Presupuesto", robots: { index: false, follow: false } };

export default async function Pagina({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  return (
    <div className="zona-impresion contenedor py-6 md:py-10">
      <VerPresupuesto numero={numero} />
    </div>
  );
}
