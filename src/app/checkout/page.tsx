import type { Metadata } from "next";
import { consultar } from "@/lib/db";
import Migas from "@/components/Migas";
import Checkout, { type Localidad } from "./Checkout";

export const metadata: Metadata = {
  title: "Finalizar compra",
  robots: { index: false, follow: false },
};

export const revalidate = 3600;

export default async function PaginaCheckout() {
  const { filas } = await consultar<Localidad>("localidades", {
    select: "id,nombre,costo_envio,tipo",
    orden: [{ col: "orden" }],
    revalidar: 3600,
  });
  return (
    <div className="contenedor py-4 md:py-6">
      <Migas items={[{ nombre: "Carrito", href: "/carrito" }, { nombre: "Finalizar compra" }]} />
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">Finalizar compra</h1>
      <Checkout localidades={filas} />
    </div>
  );
}
