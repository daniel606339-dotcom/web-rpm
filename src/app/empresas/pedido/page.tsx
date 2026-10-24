import type { Metadata } from "next";
import Migas from "@/components/Migas";
import PedidoPortal from "./PedidoPortal";

export const metadata: Metadata = { title: "Confirmar pedido", robots: { index: false, follow: false } };

export default function Pagina() {
  return (
    <div className="contenedor py-4 md:py-6">
      <Migas items={[{ nombre: "Carrito", href: "/carrito" }, { nombre: "Confirmar pedido" }]} />
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">Confirmar pedido</h1>
      <PedidoPortal />
    </div>
  );
}
