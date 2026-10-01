import type { Metadata } from "next";
import { getEnvioDesde } from "@/lib/data";
import CarritoVista from "./CarritoVista";

export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false, follow: false },
};

export const revalidate = 3600;

export default async function Carrito() {
  const envioDesde = await getEnvioDesde();
  return (
    <div className="contenedor py-4 md:py-6">
      <h1 className="mb-4 text-2xl font-bold">Tu carrito</h1>
      <CarritoVista envioDesde={envioDesde} />
    </div>
  );
}
