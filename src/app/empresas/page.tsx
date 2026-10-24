import type { Metadata } from "next";
import Portal from "./Portal";

export const metadata: Metadata = {
  title: "Portal para empresas",
  description: "Precios acordados, pedidos anteriores y compra recurrente para clientes empresa de Distribuidora RPM.",
  robots: { index: false, follow: true },
};

export default function Empresas() {
  return (
    <div className="contenedor py-6 md:py-10">
      <Portal />
    </div>
  );
}
