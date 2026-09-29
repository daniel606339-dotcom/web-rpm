import type { Metadata } from "next";
import { SITE } from "@/lib/config";
import { linkWhatsApp } from "@/lib/format";

export const metadata: Metadata = {
  title: "Portal para empresas",
  description: "Lista de precios, saldo, pedidos anteriores y compra recurrente para clientes empresa de RPM.",
  robots: { index: false, follow: true },
};

export default function Empresas() {
  return (
    <div className="contenedor py-8 md:py-12">
      <div className="mx-auto max-w-2xl rounded-2xl border border-borde bg-white p-6 md:p-10">
        <h1 className="text-2xl font-bold md:text-3xl">Portal para empresas</h1>
        <p className="mt-3 text-suave">
          Muy pronto vas a poder ingresar con el usuario de tu empresa para ver tu lista de precios, tu saldo, tus pedidos
          anteriores y repetir la compra del mes en un clic.
        </p>
        <p className="mt-3 text-suave">Mientras tanto, tu vendedor te atiende por WhatsApp.</p>
        <a
          href={linkWhatsApp(SITE.whatsapp, "Hola RPM, soy cliente empresa y quiero hacer un pedido.")}
          target="_blank"
          rel="noopener"
          className="mt-6 inline-flex h-12 items-center rounded-[10px] bg-marca px-6 font-bold text-white hover:bg-marca-oscuro"
        >
          Escribir a mi vendedor
        </a>
      </div>
    </div>
  );
}
