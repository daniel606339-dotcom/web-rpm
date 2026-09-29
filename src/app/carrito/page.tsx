import type { Metadata } from "next";
import CarritoVista from "./CarritoVista";

export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false, follow: false },
};

export default function Carrito() {
  return (
    <div className="contenedor py-4 md:py-6">
      <h1 className="mb-4 text-2xl font-bold">Tu carrito</h1>
      <CarritoVista />
    </div>
  );
}
