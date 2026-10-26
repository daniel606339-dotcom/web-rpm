import type { Metadata } from "next";
import NuevoPresupuesto from "./NuevoPresupuesto";

export const metadata: Metadata = {
  title: "Pedir presupuesto",
  description: "Armá tu lista de productos y recibí al instante un presupuesto de Distribuidora RPM para tu empresa.",
  robots: { index: false, follow: true },
};

export default function Pagina() {
  return (
    <div className="contenedor py-6 md:py-10">
      <NuevoPresupuesto />
    </div>
  );
}
