import type { Metadata } from "next";
import VerReserva from "./VerReserva";

export const metadata: Metadata = { title: "Reserva de útiles", robots: { index: false, follow: false } };

export default async function Pagina({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  return (
    <div className="contenedor py-6 md:py-10">
      <VerReserva numero={numero} />
    </div>
  );
}
